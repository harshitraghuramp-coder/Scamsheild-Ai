import { Router, Request, Response, NextFunction } from 'express';
import {
  SignupRequestSchema,
  LoginRequestSchema,
  RequestEmailOtpSchema,
  VerifyEmailOtpSchema,
  RequestPhoneOtpSchema,
  VerifyPhoneOtpSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordSchema,
  KycSubmissionSchema,
  UserAccount,
} from './types.ts';
import {
  hashPassword,
  verifyPassword,
  generateNumericOtp,
  verifyOtp,
  maskDocumentNumber,
} from './crypto.ts';
import { authStore } from './store.ts';
import { notifier } from './notifier.ts';
import { kycProvider } from './kyc-provider.ts';
import {
  getPasskeyRegistrationOptions,
  verifyPasskeyRegistration,
  getPasskeyAuthenticationOptions,
  verifyPasskeyAuthentication,
} from './webauthn.ts';
import { DEMO_PROFILES, buildDemoUserAccount } from './demo-profiles.ts';

const router = Router();

// Middleware: Authenticate Session Token from Cookie or Authorization header
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token =
    req.cookies?.scamshield_session ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  const session = authStore.getSession(token);
  if (!session) {
    res.status(401).json({ error: 'Session expired or invalidated. Please sign in again.' });
    return;
  }

  const user = authStore.getUserById(session.userId);
  if (!user) {
    res.status(401).json({ error: 'Account not found.' });
    return;
  }

  (req as any).user = user;
  (req as any).session = session;
  next();
}

// Helper to sanitize user object for client responses (no passwordHash, salt, or challenges)
function sanitizeUser(user: UserAccount) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    isDemo: Boolean(user.isDemo),
    demoProfileId: user.demoProfileId,
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    phoneVerifiedAt: user.phoneVerifiedAt,
    kycStatus: user.kycStatus,
    kycRecord: user.kycRecord
      ? {
          id: user.kycRecord.id,
          docType: user.kycRecord.docType,
          docNumberMasked: user.kycRecord.docNumberMasked,
          status: user.kycRecord.status,
          submittedAt: user.kycRecord.submittedAt,
          reviewedAt: user.kycRecord.reviewedAt,
          rejectionReason: user.kycRecord.rejectionReason,
          providerReferenceId: user.kycRecord.providerReferenceId,
          authenticityScore: user.kycRecord.authenticityScore,
        }
      : undefined,
    passkeys: user.passkeys.map((p) => ({
      id: p.id,
      friendlyName: p.friendlyName,
      deviceType: p.deviceType,
      createdAt: p.createdAt,
      lastUsedAt: p.lastUsedAt,
    })),
    twoFactorEnforced: user.twoFactorEnforced,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// -------------------------------------------------------------
// 1. Account Creation (Sign Up)
// -------------------------------------------------------------
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = SignupRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid input' });
      return;
    }

    const { email, password, displayName } = parseResult.data;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'ScamShield Web';

    // Rate limit signups by IP (max 10 per hour)
    if (!authStore.checkRateLimit(`signup-ip:${clientIp}`, 10, 3600000)) {
      res.status(429).json({ error: 'Too many account creation requests from this IP. Please wait an hour.' });
      return;
    }

    // Check if user already exists
    if (authStore.getUserByEmail(email)) {
      res.status(409).json({ error: 'An account with this email address already exists. Please sign in instead.' });
      return;
    }

    const { hash, salt } = hashPassword(password);
    const userId = 'USR-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const newUser: UserAccount = {
      id: userId,
      email: email.toLowerCase().trim(),
      displayName: displayName.trim(),
      role: 'USER',
      emailVerified: false,
      phoneVerified: false,
      passwordHash: hash,
      passwordSalt: salt,
      passkeys: [],
      kycStatus: 'NOT_STARTED',
      twoFactorEnforced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    authStore.createUser(newUser);

    // Create session
    const session = authStore.createSession(userId, userAgent, clientIp);

    // Set secure cookie
    res.cookie('scamshield_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    // Auto-dispatch verification email OTP
    const otp = generateNumericOtp();
    authStore.storeOtp(email, otp, 'EMAIL');
    await notifier.sendEmailOtp(email, otp);

    authStore.recordAudit({
      action: 'ACCOUNT_CREATED',
      status: 'SUCCESS',
      ipAddress: clientIp,
      userAgent,
      details: `New account created for ${email}. Verification email dispatched.`,
    });

    res.status(201).json({
      success: true,
      user: sanitizeUser(newUser),
      sessionToken: session.token,
      message: 'Account created successfully. A verification code has been dispatched to your email.',
    });
  } catch (err: any) {
    console.error('[Auth API] Signup error:', err);
    res.status(500).json({ error: 'Internal server error while creating account.' });
  }
});

// -------------------------------------------------------------
// 2. Sign In (Password Login)
// -------------------------------------------------------------
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = LoginRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid email or password format' });
      return;
    }

    const { email, password } = parseResult.data;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'ScamShield Web';

    // Rate limit logins (max 10 failed attempts per 15 min per IP)
    if (!authStore.checkRateLimit(`login-ip:${clientIp}`, 15, 900000)) {
      res.status(429).json({ error: 'Too many login attempts. Please try again in 15 minutes.' });
      return;
    }

    const user = authStore.getUserByEmail(email);
    if (!user || !user.passwordHash || !user.passwordSalt) {
      authStore.recordAudit({
        action: 'PASSWORD_LOGIN_FAILED',
        status: 'FAILURE',
        ipAddress: clientIp,
        userAgent,
        details: `Login attempt for unknown email: ${email}`,
      });
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!isMatch) {
      authStore.recordAudit({
        action: 'PASSWORD_LOGIN_FAILED',
        status: 'FAILURE',
        ipAddress: clientIp,
        userAgent,
        details: `Failed password authentication for user ID: ${user.id}`,
      });
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const session = authStore.createSession(user.id, userAgent, clientIp);

    res.cookie('scamshield_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    authStore.recordAudit({
      action: 'PASSWORD_LOGIN_SUCCESS',
      status: 'SUCCESS',
      ipAddress: clientIp,
      userAgent,
      details: `Successful password authentication for ${user.email}`,
    });

    res.json({
      success: true,
      user: sanitizeUser(user),
      sessionToken: session.token,
    });
  } catch (err: any) {
    console.error('[Auth API] Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// -------------------------------------------------------------
// 3. Current User & Session Info
// -------------------------------------------------------------
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  const token =
    req.cookies?.scamshield_session ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    res.status(200).json({ authenticated: false, user: null });
    return;
  }

  const session = authStore.getSession(token);
  if (!session) {
    res.status(200).json({ authenticated: false, user: null });
    return;
  }

  const user = authStore.getUserById(session.userId);
  if (!user) {
    res.status(200).json({ authenticated: false, user: null });
    return;
  }

  const activeSessions = authStore.getUserSessions(user.id).map((s) => ({
    tokenSnippet: s.token.slice(0, 8) + '...',
    isCurrent: s.token === token,
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    createdAt: s.createdAt,
    lastActiveAt: s.lastActiveAt,
  }));

  const providers = notifier.getProvidersStatus();

  res.json({
    authenticated: true,
    user: sanitizeUser(user),
    sessions: activeSessions,
    providers,
  });
});

// -------------------------------------------------------------
// 4. Logout (Current Session or All)
// -------------------------------------------------------------
router.post('/logout', (req: Request, res: Response): void => {
  const token =
    req.cookies?.scamshield_session ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (token) {
    const session = authStore.getSession(token);
    if (session) {
      authStore.recordAudit({
        action: 'LOGOUT_SESSION',
        status: 'SUCCESS',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
        details: `Session revoked for user ${session.userId}`,
      });
      authStore.revokeSession(token);
    }
  }

  res.clearCookie('scamshield_session');
  res.json({ success: true, message: 'Signed out successfully.' });
});

router.post('/logout-all', requireAuth, (req: Request, res: Response): void => {
  const user = (req as any).user as UserAccount;
  const count = authStore.revokeAllUserSessions(user.id);

  authStore.recordAudit({
    action: 'LOGOUT_ALL_SESSIONS',
    status: 'SUCCESS',
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || '',
    details: `Revoked ${count} sessions for user ${user.id}`,
  });

  res.clearCookie('scamshield_session');
  res.json({ success: true, count, message: `Signed out from ${count} devices.` });
});

// -------------------------------------------------------------
// 5. Email OTP Verification Workflow
// -------------------------------------------------------------
router.post('/email/request-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = RequestEmailOtpSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.issues[0]?.message || 'Invalid email address' });
      return;
    }

    const email = parse.data.email.toLowerCase().trim();
    const clientIp = req.ip || '127.0.0.1';

    // Anti-bombing rate limit
    if (!authStore.checkRateLimit(`otp-req-email:${email}`, 5, 900000)) {
      res.status(429).json({ error: 'Too many OTP requests. Please wait 15 minutes.' });
      return;
    }

    const plainOtp = generateNumericOtp();
    const result = authStore.storeOtp(email, plainOtp, 'EMAIL');

    if (!result.allowed) {
      res.status(429).json({
        error: `Please wait ${result.cooldownRemaining} seconds before requesting a new OTP.`,
        cooldownRemaining: result.cooldownRemaining,
      });
      return;
    }

    const delivery = await notifier.sendEmailOtp(email, plainOtp);

    authStore.recordAudit({
      action: 'EMAIL_OTP_SENT',
      status: delivery.sent ? 'SUCCESS' : 'WARNING',
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'] || '',
      details: `Dispatched OTP to ${email} via ${delivery.provider}`,
    });

    res.json({
      success: true,
      provider: delivery.provider,
      providerConfigured: delivery.providerConfigured,
      cooldownSeconds: 60,
      message: delivery.providerConfigured
        ? `Security OTP sent to ${email}. Valid for 10 minutes.`
        : `Security OTP generated and dispatched in secure sandbox mode. Valid for 10 minutes.`,
    });
  } catch (err: any) {
    console.error('[Auth API] Email OTP request error:', err);
    res.status(500).json({ error: 'Failed to dispatch email verification code.' });
  }
});

router.post('/email/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = VerifyEmailOtpSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.issues[0]?.message || 'Invalid OTP payload' });
      return;
    }

    const { email, otp } = parse.data;
    const cleanEmail = email.toLowerCase().trim();
    const record = authStore.getOtpRecord(cleanEmail);

    if (!record) {
      res.status(400).json({ error: 'No active OTP verification session found. Please request a new code.' });
      return;
    }

    if (Date.now() > record.expiresAt) {
      authStore.invalidateOtp(cleanEmail);
      res.status(400).json({ error: 'This verification code has expired. Please request a fresh code.' });
      return;
    }

    if (record.attempts >= record.maxAttempts) {
      authStore.invalidateOtp(cleanEmail);
      res.status(400).json({ error: 'Maximum attempts exceeded. This code has been invalidated for security.' });
      return;
    }

    const isValid = verifyOtp(otp, record.salt, record.hashedOtp);
    if (!isValid) {
      const attempts = authStore.incrementOtpAttempt(cleanEmail);
      const remaining = record.maxAttempts - attempts;
      res.status(400).json({
        error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Code invalidated.'}`,
      });
      return;
    }

    // Success! Invalidate OTP immediately
    authStore.invalidateOtp(cleanEmail);

    // Update user record if exists
    const user = authStore.getUserByEmail(cleanEmail);
    if (user) {
      user.emailVerified = true;
      user.emailVerifiedAt = new Date().toISOString();
      authStore.updateUser(user);
    }

    authStore.recordAudit({
      action: 'EMAIL_OTP_VERIFIED',
      status: 'SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      details: `Email ${cleanEmail} verified successfully.`,
    });

    res.json({
      success: true,
      verified: true,
      message: 'Email address successfully verified.',
      user: user ? sanitizeUser(user) : null,
    });
  } catch (err: any) {
    console.error('[Auth API] Email OTP verification error:', err);
    res.status(500).json({ error: 'Failed to verify OTP code.' });
  }
});

// -------------------------------------------------------------
// 6. Phone OTP Verification Workflow
// -------------------------------------------------------------
router.post('/phone/request-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = RequestPhoneOtpSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.issues[0]?.message || 'Invalid phone number format' });
      return;
    }

    const { countryCode, phoneNumber } = parse.data;
    const fullNumber = `${countryCode}${phoneNumber}`;
    const clientIp = req.ip || '127.0.0.1';

    // Anti-bombing check
    if (!authStore.checkRateLimit(`otp-req-phone:${fullNumber}`, 5, 900000)) {
      res.status(429).json({ error: 'Too many SMS requests for this number. Please wait 15 minutes.' });
      return;
    }

    const plainOtp = generateNumericOtp();
    const result = authStore.storeOtp(fullNumber, plainOtp, 'PHONE');

    if (!result.allowed) {
      res.status(429).json({
        error: `Please wait ${result.cooldownRemaining} seconds before requesting a new SMS code.`,
        cooldownRemaining: result.cooldownRemaining,
      });
      return;
    }

    const delivery = await notifier.sendSmsOtp(countryCode, phoneNumber, plainOtp);

    authStore.recordAudit({
      action: 'PHONE_OTP_SENT',
      status: delivery.sent ? 'SUCCESS' : 'WARNING',
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'] || '',
      details: `Dispatched SMS OTP to ${fullNumber} via ${delivery.provider}`,
    });

    res.json({
      success: true,
      provider: delivery.provider,
      providerConfigured: delivery.providerConfigured,
      cooldownSeconds: 60,
      message: delivery.providerConfigured
        ? `Verification SMS dispatched to ${fullNumber}.`
        : `SMS code generated in secure sandbox mode for ${fullNumber}.`,
    });
  } catch (err: any) {
    console.error('[Auth API] Phone OTP request error:', err);
    res.status(500).json({ error: 'Failed to dispatch SMS verification code.' });
  }
});

router.post('/phone/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = VerifyPhoneOtpSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.issues[0]?.message || 'Invalid SMS verification request' });
      return;
    }

    const { countryCode, phoneNumber, otp } = parse.data;
    const fullNumber = `${countryCode}${phoneNumber}`;
    const record = authStore.getOtpRecord(fullNumber);

    if (!record) {
      res.status(400).json({ error: 'No active SMS verification session found. Please request a new code.' });
      return;
    }

    if (Date.now() > record.expiresAt) {
      authStore.invalidateOtp(fullNumber);
      res.status(400).json({ error: 'This verification code has expired. Please request a fresh code.' });
      return;
    }

    if (record.attempts >= record.maxAttempts) {
      authStore.invalidateOtp(fullNumber);
      res.status(400).json({ error: 'Maximum attempts exceeded. This code has been invalidated for security.' });
      return;
    }

    const isValid = verifyOtp(otp, record.salt, record.hashedOtp);
    if (!isValid) {
      const attempts = authStore.incrementOtpAttempt(fullNumber);
      const remaining = record.maxAttempts - attempts;
      res.status(400).json({
        error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Code invalidated.'}`,
      });
      return;
    }

    authStore.invalidateOtp(fullNumber);

    // If an authenticated user is linked to this session, update their profile
    const token =
      req.cookies?.scamshield_session ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    let updatedUser: UserAccount | null = null;
    if (token) {
      const session = authStore.getSession(token);
      if (session) {
        const u = authStore.getUserById(session.userId);
        if (u) {
          u.phone = fullNumber;
          u.phoneVerified = true;
          u.phoneVerifiedAt = new Date().toISOString();
          authStore.updateUser(u);
          updatedUser = u;
        }
      }
    }

    authStore.recordAudit({
      action: 'PHONE_OTP_VERIFIED',
      status: 'SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      details: `Phone ${fullNumber} verified successfully.`,
    });

    res.json({
      success: true,
      verified: true,
      phone: fullNumber,
      message: 'Phone number verified successfully.',
      user: updatedUser ? sanitizeUser(updatedUser) : null,
    });
  } catch (err: any) {
    console.error('[Auth API] Phone OTP verify error:', err);
    res.status(500).json({ error: 'Failed to verify phone OTP.' });
  }
});

// -------------------------------------------------------------
// 7. Passkey (WebAuthn / FIDO2) Workflow
// -------------------------------------------------------------
router.post('/passkey/register-options', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user as UserAccount;
    const host = req.headers.host;
    const options = await getPasskeyRegistrationOptions(user, host);
    res.json(options);
  } catch (err: any) {
    console.error('[Auth API] Passkey register options error:', err);
    res.status(500).json({ error: 'Failed to generate passkey registration challenge.' });
  }
});

router.post('/passkey/register-verify', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user as UserAccount;
    const { response, friendlyName } = req.body;
    const host = req.headers.host;

    if (!response) {
      res.status(400).json({ error: 'Missing authenticator response payload.' });
      return;
    }

    const verification = await verifyPasskeyRegistration(user, response, host, friendlyName);
    if (!verification.verified || !verification.credential) {
      authStore.recordAudit({
        action: 'PASSKEY_REGISTERED',
        status: 'FAILURE',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
        details: verification.error || 'Registration verification failed',
      });
      res.status(400).json({ error: verification.error || 'Passkey verification failed.' });
      return;
    }

    authStore.recordAudit({
      action: 'PASSKEY_REGISTERED',
      status: 'SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      details: `Passkey registered: ${verification.credential.friendlyName} (ID: ${verification.credential.id.slice(0, 8)}...)`,
    });

    res.json({
      success: true,
      message: 'Passkey registered successfully! You can now sign in passwordless.',
      passkey: {
        id: verification.credential.id,
        friendlyName: verification.credential.friendlyName,
        createdAt: verification.credential.createdAt,
      },
    });
  } catch (err: any) {
    console.error('[Auth API] Passkey register verify error:', err);
    res.status(500).json({ error: 'Failed to verify passkey registration response.' });
  }
});

router.post('/passkey/login-options', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = email ? authStore.getUserByEmail(email) : undefined;
    const host = req.headers.host;
    const options = await getPasskeyAuthenticationOptions(user, host);
    res.json(options);
  } catch (err: any) {
    console.error('[Auth API] Passkey login options error:', err);
    res.status(500).json({ error: 'Failed to generate passkey authentication challenge.' });
  }
});

router.post('/passkey/login-verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, response } = req.body;
    const host = req.headers.host;
    const clientIp = req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'ScamShield Web';

    if (!email || !response) {
      res.status(400).json({ error: 'Email and passkey assertion response are required.' });
      return;
    }

    const user = authStore.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'User not found.' });
      return;
    }

    const verification = await verifyPasskeyAuthentication(user, response, host);
    if (!verification.verified) {
      authStore.recordAudit({
        action: 'PASSKEY_LOGIN_FAILED',
        status: 'FAILURE',
        ipAddress: clientIp,
        userAgent,
        details: verification.error || 'Cryptographic assertion check failed',
      });
      res.status(401).json({ error: verification.error || 'Passkey authentication failed.' });
      return;
    }

    const session = authStore.createSession(user.id, userAgent, clientIp);

    res.cookie('scamshield_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    authStore.recordAudit({
      action: 'PASSKEY_LOGIN_SUCCESS',
      status: 'SUCCESS',
      ipAddress: clientIp,
      userAgent,
      details: `Passwordless passkey login successful for ${user.email}`,
    });

    res.json({
      success: true,
      user: sanitizeUser(user),
      sessionToken: session.token,
    });
  } catch (err: any) {
    console.error('[Auth API] Passkey login verify error:', err);
    res.status(500).json({ error: 'Failed to complete passkey login assertion.' });
  }
});

router.delete('/passkey/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user as UserAccount;
    const { id } = req.params;

    const initialLen = user.passkeys.length;
    user.passkeys = user.passkeys.filter((p) => p.id !== id);

    if (user.passkeys.length === initialLen) {
      res.status(404).json({ error: 'Passkey not found.' });
      return;
    }

    authStore.updateUser(user);
    authStore.recordAudit({
      action: 'PASSKEY_REMOVED',
      status: 'SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      details: `Removed passkey ID ${id.slice(0, 8)}...`,
    });

    res.json({ success: true, message: 'Passkey removed.' });
  } catch (err: any) {
    console.error('[Auth API] Remove passkey error:', err);
    res.status(500).json({ error: 'Failed to remove passkey.' });
  }
});

// -------------------------------------------------------------
// 8. Identity Document Verification (KYC)
// -------------------------------------------------------------
router.post('/kyc/submit', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user as UserAccount;
    const parse = KycSubmissionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.issues[0]?.message || 'Invalid KYC document submission' });
      return;
    }

    const { docType, docNumber, frontImageBase64, backImageBase64 } = parse.data;

    // Process through identity verification engine
    const verification = await kycProvider.verifyIdentityDocument(
      user.id,
      docType,
      docNumber,
      frontImageBase64,
      backImageBase64
    );

    if (!verification.validFormat) {
      res.status(400).json({ error: verification.error || 'Document validation failed' });
      return;
    }

    const kycRecord = {
      id: 'KYC-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      userId: user.id,
      docType,
      docNumberMasked: maskDocumentNumber(docNumber),
      status: verification.providerCheck.verificationStatus,
      frontUploaded: true,
      backUploaded: Boolean(backImageBase64),
      submittedAt: new Date().toISOString(),
      consentTimestamp: new Date().toISOString(),
      providerReferenceId: verification.providerCheck.referenceId,
      authenticityScore: verification.providerCheck.authenticityScore,
      reviewedAt:
        verification.providerCheck.verificationStatus === 'VERIFIED' ? new Date().toISOString() : undefined,
    };

    user.kycStatus = verification.providerCheck.verificationStatus;
    user.kycRecord = kycRecord;
    authStore.updateUser(user);

    authStore.recordAudit({
      action: 'KYC_SUBMITTED',
      status: 'SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      details: `Submitted ${docType} for verification. Status: ${kycRecord.status} (Ref: ${kycRecord.providerReferenceId})`,
    });

    res.json({
      success: true,
      record: kycRecord,
      providerDetails: verification.providerCheck,
      message:
        kycRecord.status === 'VERIFIED'
          ? 'Identity document verified successfully.'
          : 'Identity document submitted and currently in compliance review queue.',
    });
  } catch (err: any) {
    console.error('[Auth API] KYC submit error:', err);
    res.status(500).json({ error: 'Failed to process identity verification.' });
  }
});

router.delete('/kyc/purge', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user as UserAccount;
    user.kycStatus = 'NOT_STARTED';
    user.kycRecord = undefined;
    authStore.updateUser(user);

    authStore.recordAudit({
      action: 'KYC_SUBMITTED',
      status: 'SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      details: `User purged all uploaded KYC identity records under DPDP Act data rights.`,
    });

    res.json({ success: true, message: 'All identity verification documents permanently purged from records.' });
  } catch (err: any) {
    console.error('[Auth API] KYC purge error:', err);
    res.status(500).json({ error: 'Failed to purge KYC records.' });
  }
});

// -------------------------------------------------------------
// 9. Password Reset & Account Recovery
// -------------------------------------------------------------
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = ForgotPasswordRequestSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Invalid email address.' });
      return;
    }

    const email = parse.data.email.toLowerCase().trim();
    const user = authStore.getUserByEmail(email);

    // Consistent response whether user exists or not (prevents account enumeration attack)
    if (user) {
      const plainOtp = generateNumericOtp();
      authStore.storeOtp(email, plainOtp, 'PASSWORD_RESET');
      await notifier.sendEmailOtp(email, plainOtp);

      authStore.recordAudit({
        action: 'PASSWORD_RESET_REQUESTED',
        status: 'SUCCESS',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
        details: `Password reset OTP dispatched to ${email}`,
      });
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a 6-digit password reset code has been sent.',
    });
  } catch (err: any) {
    console.error('[Auth API] Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = ResetPasswordSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.issues[0]?.message || 'Invalid password reset input' });
      return;
    }

    const { email, otp, newPassword } = parse.data;
    const cleanEmail = email.toLowerCase().trim();
    const record = authStore.getOtpRecord(cleanEmail);

    if (!record || record.type !== 'PASSWORD_RESET') {
      res.status(400).json({ error: 'No active password reset request found. Please request a new code.' });
      return;
    }

    if (Date.now() > record.expiresAt) {
      authStore.invalidateOtp(cleanEmail);
      res.status(400).json({ error: 'Password reset code has expired. Please request a new one.' });
      return;
    }

    const isValid = verifyOtp(otp, record.salt, record.hashedOtp);
    if (!isValid) {
      authStore.incrementOtpAttempt(cleanEmail);
      res.status(400).json({ error: 'Invalid verification code.' });
      return;
    }

    authStore.invalidateOtp(cleanEmail);

    const user = authStore.getUserByEmail(cleanEmail);
    if (!user) {
      res.status(400).json({ error: 'Account not found.' });
      return;
    }

    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.passwordSalt = salt;
    authStore.updateUser(user);

    // Invalidate prior sessions for security
    authStore.revokeAllUserSessions(user.id);

    authStore.recordAudit({
      action: 'PASSWORD_RESET_COMPLETED',
      status: 'SUCCESS',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      details: `Password reset successfully completed for ${cleanEmail}`,
    });

    res.json({
      success: true,
      message: 'Password successfully updated! You can now sign in with your new password.',
    });
  } catch (err: any) {
    console.error('[Auth API] Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// -------------------------------------------------------------
// 10. Audit Logs & System Status
// -------------------------------------------------------------
router.get('/security/audit-logs', requireAuth, (req: Request, res: Response): void => {
  const user = (req as any).user as UserAccount;
  const logs = authStore.getAuditLogs(user.id);
  res.json({ logs });
});

router.get('/security/providers', (_req: Request, res: Response): void => {
  res.json(notifier.getProvidersStatus());
});

// Test Harness Route for Automated Verification Testing
router.post('/test-harness/get-sandbox-code', (req: Request, res: Response): void => {
  // Only available in development/sandbox mode for testing verify pipelines
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Disabled in production' });
    return;
  }
  const { target } = req.body;
  if (!target) {
    res.status(400).json({ error: 'Target required' });
    return;
  }
  const code = authStore.getSandboxDispatchCode(target);
  if (!code) {
    res.status(404).json({ error: 'No sandbox code found' });
    return;
  }
  res.json({ code });
});

// -------------------------------------------------------------
// 11. DEMO PROFILES – Explore ScamShield AI
// -------------------------------------------------------------
router.get('/demo/profiles', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    profiles: DEMO_PROFILES,
    disclaimer:
      'DEMO MODE NOTICE: All demo profiles contain simulated scenario data and strictly isolated demo sessions. No actual police reports, production user records, or real external authority contacts are executed.',
  });
});

router.post('/demo/launch', (req: Request, res: Response): void => {
  try {
    const { profileId } = req.body;
    if (!profileId) {
      res.status(400).json({ error: 'profileId is required.' });
      return;
    }

    const demoProfile = DEMO_PROFILES.find((p) => p.id === profileId);
    if (!demoProfile) {
      res.status(404).json({ error: `Demo profile '${profileId}' not found.` });
      return;
    }

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'ScamShield Demo Client';

    // Construct isolated demo account
    const demoAccount = buildDemoUserAccount(demoProfile);
    authStore.createUser(demoAccount);

    // Issue isolated demo session
    const session = authStore.createSession(demoAccount.id, userAgent, clientIp);
    session.isDemo = true;
    session.demoProfileId = demoProfile.id;

    res.cookie('scamshield_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 4 * 60 * 60 * 1000, // 4 hours for demo sessions
    });

    authStore.recordAudit({
      action: 'DEMO_PROFILE_LAUNCHED',
      status: 'SUCCESS',
      ipAddress: clientIp,
      userAgent,
      details: `Launched simulated demo profile: ${demoProfile.name} (${demoProfile.accessLevel})`,
    });

    res.json({
      success: true,
      user: sanitizeUser(demoAccount),
      sessionToken: session.token,
      demoProfile,
      message: `Welcome to Demo Mode as ${demoProfile.name}. All displayed data is simulated for evaluation purposes.`,
    });
  } catch (err: any) {
    console.error('[Auth API] Demo launch error:', err);
    res.status(500).json({ error: 'Failed to launch demo profile.' });
  }
});

router.post('/demo/exit', (req: Request, res: Response): void => {
  const token =
    req.cookies?.scamshield_session ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (token) {
    authStore.revokeSession(token);
  }

  res.clearCookie('scamshield_session');
  res.json({
    success: true,
    message: 'Exited demo mode successfully. Returned to standard login environment.',
  });
});

export default router;

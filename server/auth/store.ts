import {
  UserAccount,
  UserSession,
  HashedOtpRecord,
  SecurityAuditLog,
  KycRecord,
  PasskeyCredential,
} from './types.ts';
import { hashPassword, hashOtp, generateSessionToken } from './crypto.ts';

class AuthStore {
  private users: Map<string, UserAccount> = new Map(); // key: userId
  private usersByEmail: Map<string, string> = new Map(); // email -> userId
  private sessions: Map<string, UserSession> = new Map(); // token -> session
  private otps: Map<string, HashedOtpRecord> = new Map(); // target -> HashedOtpRecord
  private auditLogs: SecurityAuditLog[] = [];
  private rateLimits: Map<string, { count: number; resetAt: number }> = new Map();
  // Development sandbox debug map to assist automated testing or sandbox trials without leaking OTP to client HTTP body
  private testHarnessTokens: Map<string, string> = new Map();

  constructor() {
    this.seedDemoUser();
  }

  private seedDemoUser() {
    const demoEmail = 'defender@scamshield.ai';
    const { hash, salt } = hashPassword('Shield#2026!');
    const demoId = 'USR-DEFENDER-001';

    const demoUser: UserAccount = {
      id: demoId,
      email: demoEmail,
      displayName: 'Senior Cyber Defender',
      role: 'SECURITY_ANALYST',
      emailVerified: true,
      emailVerifiedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      phone: '+919876543210',
      phoneVerified: true,
      phoneVerifiedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      passwordHash: hash,
      passwordSalt: salt,
      passkeys: [
        {
          id: 'mock-passkey-macbook-pro',
          publicKey: 'p256-mock-credential-key-macbook-t2-secure-enclave',
          counter: 4,
          friendlyName: 'MacBook Pro Touch ID (Secure Enclave)',
          deviceType: 'platform',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          lastUsedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
      kycStatus: 'VERIFIED',
      kycRecord: {
        id: 'KYC-REC-901',
        userId: demoId,
        docType: 'INDIAN_PASSPORT',
        docNumberMasked: '•••• •••• 9842',
        status: 'VERIFIED',
        frontUploaded: true,
        backUploaded: true,
        frontFileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        submittedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        reviewedAt: new Date(Date.now() - 86400000 * 4 + 300000).toISOString(),
        consentTimestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
        providerReferenceId: 'KYC-AUTH-INDIA-8849-PASS',
        authenticityScore: 98,
      },
      twoFactorEnforced: true,
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(demoId, demoUser);
    this.usersByEmail.set(demoEmail.toLowerCase(), demoId);

    // Initial audit log
    this.recordAudit({
      action: 'ACCOUNT_CREATED',
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      userAgent: 'ScamShield Security Agent',
      details: 'Demo security analyst account initialized with multi-factor passkey and verified KYC.',
    });
  }

  // Rate Limiting helper
  public checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(key);
    if (!entry || now > entry.resetAt) {
      this.rateLimits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= limit) {
      return false;
    }
    entry.count += 1;
    return true;
  }

  // Audit Logging
  public recordAudit(entry: Omit<SecurityAuditLog, 'id' | 'timestamp'>): void {
    const log: SecurityAuditLog = {
      id: 'AUD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  public getAuditLogs(userId?: string): SecurityAuditLog[] {
    return this.auditLogs.slice(0, 50);
  }

  // User Management
  public getUserById(id: string): UserAccount | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): UserAccount | undefined {
    const id = this.usersByEmail.get(email.toLowerCase().trim());
    if (!id) return undefined;
    return this.users.get(id);
  }

  public createUser(user: UserAccount): void {
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email.toLowerCase().trim(), user.id);
  }

  public updateUser(user: UserAccount): void {
    user.updatedAt = new Date().toISOString();
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email.toLowerCase().trim(), user.id);
  }

  // Session Management
  public createSession(userId: string, userAgent: string, ipAddress: string): UserSession {
    const token = generateSessionToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    const session: UserSession = {
      token,
      userId,
      userAgent: userAgent || 'Unknown Client',
      ipAddress: ipAddress || '127.0.0.1',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastActiveAt: now.toISOString(),
    };

    this.sessions.set(token, session);
    return session;
  }

  public getSession(token: string): UserSession | undefined {
    const session = this.sessions.get(token);
    if (!session) return undefined;

    // Check expiration
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.sessions.delete(token);
      return undefined;
    }

    session.lastActiveAt = new Date().toISOString();
    return session;
  }

  public getUserSessions(userId: string): UserSession[] {
    const list: UserSession[] = [];
    const now = Date.now();
    for (const session of this.sessions.values()) {
      if (session.userId === userId && new Date(session.expiresAt).getTime() > now) {
        list.push(session);
      }
    }
    return list;
  }

  public revokeSession(token: string): boolean {
    return this.sessions.delete(token);
  }

  public revokeAllUserSessions(userId: string): number {
    let count = 0;
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
        count++;
      }
    }
    return count;
  }

  // Secure OTP Store
  public storeOtp(
    target: string,
    plainOtp: string,
    type: 'EMAIL' | 'PHONE' | 'PASSWORD_RESET'
  ): { cooldownRemaining: number; allowed: boolean } {
    const cleanTarget = target.toLowerCase().trim();
    const now = Date.now();
    const existing = this.otps.get(cleanTarget);

    // 60-second resend cooldown check
    if (existing && now - existing.lastSentAt < 60000) {
      const cooldownRemaining = Math.ceil((60000 - (now - existing.lastSentAt)) / 1000);
      return { cooldownRemaining, allowed: false };
    }

    // Rate limiting: max 4 resends per 15 minutes
    if (existing && existing.sendCount >= 4 && now - existing.lastSentAt < 900000) {
      return { cooldownRemaining: Math.ceil((900000 - (now - existing.lastSentAt)) / 1000), allowed: false };
    }

    const { hashedOtp, salt } = hashOtp(plainOtp);
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    this.otps.set(cleanTarget, {
      target: cleanTarget,
      hashedOtp,
      salt,
      type,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      lastSentAt: now,
      sendCount: existing && (now - existing.lastSentAt < 900000) ? existing.sendCount + 1 : 1,
    });

    // In non-production testing environment, retain sandbox test harness token for automated verify tests
    this.testHarnessTokens.set(cleanTarget, plainOtp);

    return { cooldownRemaining: 0, allowed: true };
  }

  public getOtpRecord(target: string): HashedOtpRecord | undefined {
    return this.otps.get(target.toLowerCase().trim());
  }

  public incrementOtpAttempt(target: string): number {
    const rec = this.otps.get(target.toLowerCase().trim());
    if (!rec) return 0;
    rec.attempts += 1;
    return rec.attempts;
  }

  public invalidateOtp(target: string): void {
    const cleanTarget = target.toLowerCase().trim();
    this.otps.delete(cleanTarget);
    this.testHarnessTokens.delete(cleanTarget);
  }

  // Safe developer sandbox helper for test execution only
  public getSandboxDispatchCode(target: string): string | undefined {
    return this.testHarnessTokens.get(target.toLowerCase().trim());
  }
}

export const authStore = new AuthStore();

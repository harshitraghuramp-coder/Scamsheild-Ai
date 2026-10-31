import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import { UserAccount, PasskeyCredential } from './types.ts';
import { authStore } from './store.ts';

// RP Configuration
export function getWebAuthnConfig(reqHost?: string) {
  // Relying Party configuration
  const rpName = 'ScamShield AI Secure Identity';
  // Use host without port for rpID (or 'localhost' for local development)
  let rpID = 'localhost';
  if (reqHost) {
    const cleanHost = reqHost.split(':')[0];
    if (cleanHost && cleanHost !== '0.0.0.0') {
      rpID = cleanHost;
    }
  }

  // Derive origin from host
  const origin = reqHost && reqHost.includes('https://')
    ? reqHost
    : reqHost && !reqHost.startsWith('http')
    ? `https://${reqHost}`
    : 'http://localhost:3000';

  return { rpName, rpID, origin };
}

/**
 * Generate Registration Options for client navigator.credentials.create()
 */
export async function getPasskeyRegistrationOptions(
  user: UserAccount,
  reqHost?: string
) {
  const { rpName, rpID } = getWebAuthnConfig(reqHost);

  const existingCredentials = user.passkeys.map((p) => ({
    id: p.id,
    type: 'public-key' as const,
    transports: p.transports as any,
  }));

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(user.id),
    userName: user.email,
    userDisplayName: user.displayName || user.email.split('@')[0],
    attestationType: 'none',
    excludeCredentials: existingCredentials,
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      // Allow both platform (TouchID, FaceID, Windows Hello) and cross-platform (Yubikey)
    },
  });

  // Store active challenge with 5-minute timeout
  user.currentChallenge = options.challenge;
  user.challengeExpiresAt = Date.now() + 5 * 60 * 1000;
  authStore.updateUser(user);

  return options;
}

/**
 * Verify Registration Response from navigator.credentials.create()
 */
export async function verifyPasskeyRegistration(
  user: UserAccount,
  responseBody: any,
  reqHost?: string,
  friendlyName?: string
): Promise<{ verified: boolean; credential?: PasskeyCredential; error?: string }> {
  const { rpID, origin } = getWebAuthnConfig(reqHost);

  if (!user.currentChallenge || !user.challengeExpiresAt || Date.now() > user.challengeExpiresAt) {
    return { verified: false, error: 'Registration challenge has expired. Please initiate passkey setup again.' };
  }

  const expectedChallenge = user.currentChallenge;

  try {
    const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse({
      response: responseBody,
      expectedChallenge,
      expectedOrigin: [origin, 'http://localhost:3000', `https://${rpID}`, `http://${rpID}`],
      expectedRPID: rpID,
      requireUserVerification: false,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;

      const newPasskey: PasskeyCredential = {
        id: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString('base64url'),
        counter: credential.counter,
        deviceType: verification.registrationInfo.credentialDeviceType || 'platform',
        backedUp: verification.registrationInfo.credentialBackedUp || false,
        transports: responseBody.response?.transports,
        friendlyName: friendlyName || 'Security Passkey Authenticator',
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };

      // Clear challenge
      user.currentChallenge = undefined;
      user.challengeExpiresAt = undefined;

      // Add to user passkeys
      user.passkeys.push(newPasskey);
      authStore.updateUser(user);

      return { verified: true, credential: newPasskey };
    }

    return { verified: false, error: 'Cryptographic passkey registration signature check failed.' };
  } catch (err: any) {
    return { verified: false, error: err.message || 'Passkey verification failed' };
  }
}

/**
 * Generate Authentication Options for client navigator.credentials.get()
 */
export async function getPasskeyAuthenticationOptions(
  user?: UserAccount,
  reqHost?: string
) {
  const { rpID } = getWebAuthnConfig(reqHost);

  const allowCredentials = user
    ? user.passkeys.map((p) => ({
        id: p.id,
        type: 'public-key' as const,
        transports: p.transports as any,
      }))
    : undefined;

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification: 'preferred',
  });

  if (user) {
    user.currentChallenge = options.challenge;
    user.challengeExpiresAt = Date.now() + 5 * 60 * 1000;
    authStore.updateUser(user);
  }

  return options;
}

/**
 * Verify Authentication Response from navigator.credentials.get()
 */
export async function verifyPasskeyAuthentication(
  user: UserAccount,
  responseBody: any,
  reqHost?: string
): Promise<{ verified: boolean; error?: string }> {
  const { rpID, origin } = getWebAuthnConfig(reqHost);

  if (!user.currentChallenge || !user.challengeExpiresAt || Date.now() > user.challengeExpiresAt) {
    return { verified: false, error: 'Authentication challenge expired. Please retry.' };
  }

  const passkey = user.passkeys.find((p) => p.id === responseBody.id);
  if (!passkey) {
    return { verified: false, error: 'Passkey credential not recognized for this account.' };
  }

  try {
    const verification: VerifiedAuthenticationResponse = await verifyAuthenticationResponse({
      response: responseBody,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: [origin, 'http://localhost:3000', `https://${rpID}`, `http://${rpID}`],
      expectedRPID: rpID,
      credential: {
        id: passkey.id,
        publicKey: Buffer.from(passkey.publicKey, 'base64url'),
        counter: passkey.counter,
        transports: passkey.transports as any,
      },
      requireUserVerification: false,
    });

    if (verification.verified) {
      // Update counter and last used
      passkey.counter = verification.authenticationInfo.newCounter;
      passkey.lastUsedAt = new Date().toISOString();

      user.currentChallenge = undefined;
      user.challengeExpiresAt = undefined;
      authStore.updateUser(user);

      return { verified: true };
    }

    return { verified: false, error: 'Passkey verification failed cryptographic assertion check.' };
  } catch (err: any) {
    return { verified: false, error: err.message || 'Passkey authentication error' };
  }
}

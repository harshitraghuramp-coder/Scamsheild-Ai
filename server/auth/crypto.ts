import crypto from 'crypto';

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';

/**
 * Hash a plain password with a secure per-user salt using PBKDF2-HMAC-SHA512.
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST
  );
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

/**
 * Verify a plain password against stored salt and hash using timing-safe comparison.
 */
export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const derivedKey = crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      PBKDF2_KEYLEN,
      PBKDF2_DIGEST
    );
    const keyBuf = derivedKey;
    const expectedBuf = Buffer.from(expectedHash, 'hex');
    if (keyBuf.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(keyBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure 6-digit numeric OTP.
 */
export function generateNumericOtp(): string {
  // Generates between 100000 and 999999 inclusive
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hash an OTP with a random salt before storing in database/memory.
 * Raw OTPs are NEVER stored.
 */
export function hashOtp(otp: string): { hashedOtp: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedOtp = crypto
    .createHash('sha256')
    .update(otp + ':' + salt)
    .digest('hex');
  return { hashedOtp, salt };
}

/**
 * Verify that a candidate OTP matches the stored hash and salt in constant time.
 */
export function verifyOtp(candidateOtp: string, salt: string, expectedHash: string): boolean {
  try {
    const computed = crypto
      .createHash('sha256')
      .update(candidateOtp + ':' + salt)
      .digest('hex');
    const compBuf = Buffer.from(computed, 'hex');
    const expBuf = Buffer.from(expectedHash, 'hex');
    if (compBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(compBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure 256-bit session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash sensitive document numbers so only masked versions are visible in logs/UI.
 */
export function maskDocumentNumber(docNumber: string): string {
  const clean = docNumber.trim();
  if (clean.length <= 4) return '••••';
  const lastFour = clean.slice(-4);
  return `•••• •••• ${lastFour}`;
}

/**
 * Compute SHA-256 fingerprint of an uploaded file buffer/string.
 */
export function computeFileHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

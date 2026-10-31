import { z } from 'zod';

export type UserRole = 'USER' | 'ADMIN' | 'SECURITY_ANALYST' | 'DEMO_USER';

export type DemoProfileId =
  | 'basic_user'
  | 'security_enthusiast'
  | 'victim_simulation'
  | 'intelligence_viewer';

export interface DemoScenario {
  title: string;
  category: string;
  description: string;
  type: 'message' | 'url' | 'app' | 'phone' | 'emergency';
  sampleInput: string;
  expectedRisk: string;
}

export interface DemoProfile {
  id: DemoProfileId;
  name: string;
  email: string;
  avatarIcon: string;
  badge: string;
  accessLevel: string;
  description: string;
  features: string[];
  allowedNavs: string[];
  defaultNav: string;
  sampleScenarios: DemoScenario[];
}

export type KycStatus =
  | 'NOT_STARTED'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'ADDITIONAL_INFO_REQUIRED';

export type KycDocType =
  | 'INDIAN_PASSPORT'
  | 'DRIVING_LICENCE'
  | 'VOTER_ID'
  | 'PAN_CARD';

export interface PasskeyCredential {
  id: string; // base64url credential ID
  publicKey: string; // base64url public key
  counter: number;
  deviceType?: string;
  backedUp?: boolean;
  transports?: string[];
  friendlyName: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface UserSession {
  token: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
  isDemo?: boolean;
  demoProfileId?: DemoProfileId;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action:
    | 'ACCOUNT_CREATED'
    | 'PASSWORD_LOGIN_SUCCESS'
    | 'PASSWORD_LOGIN_FAILED'
    | 'PASSKEY_LOGIN_SUCCESS'
    | 'PASSKEY_LOGIN_FAILED'
    | 'PASSKEY_REGISTERED'
    | 'PASSKEY_REMOVED'
    | 'EMAIL_OTP_SENT'
    | 'EMAIL_OTP_VERIFIED'
    | 'PHONE_OTP_SENT'
    | 'PHONE_OTP_VERIFIED'
    | 'KYC_SUBMITTED'
    | 'KYC_VERIFIED'
    | 'PASSWORD_RESET_REQUESTED'
    | 'PASSWORD_RESET_COMPLETED'
    | 'DEMO_PROFILE_LAUNCHED'
    | 'LOGOUT_SESSION'
    | 'LOGOUT_ALL_SESSIONS';
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
  ipAddress: string;
  userAgent: string;
  details: string;
}

export interface KycRecord {
  id: string;
  userId: string;
  docType: KycDocType;
  docNumberMasked: string; // only last 4 visible, e.g. "•••• •••• 4892"
  status: KycStatus;
  frontUploaded: boolean;
  backUploaded: boolean;
  frontFileHash?: string;
  backFileHash?: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  consentTimestamp: string;
  providerReferenceId: string;
  authenticityScore?: number;
}

export interface UserAccount {
  id: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  phone?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  displayName: string;
  role: UserRole;
  isDemo?: boolean;
  demoProfileId?: DemoProfileId;
  passwordHash?: string;
  passwordSalt?: string;
  passkeys: PasskeyCredential[];
  kycStatus: KycStatus;
  kycRecord?: KycRecord;
  currentChallenge?: string;
  challengeExpiresAt?: number;
  twoFactorEnforced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HashedOtpRecord {
  target: string; // email or phone
  hashedOtp: string;
  salt: string;
  type: 'EMAIL' | 'PHONE' | 'PASSWORD_RESET';
  expiresAt: number; // epoch ms
  attempts: number;
  maxAttempts: number;
  lastSentAt: number;
  sendCount: number;
}

// Zod Schemas for API validation
export const SignupRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters with letters and numbers').max(128),
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(80),
});

export const LoginRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RequestEmailOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const VerifyEmailOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric digits'),
});

export const RequestPhoneOtpSchema = z.object({
  countryCode: z.string().regex(/^\+\d{1,4}$/, 'Invalid country code format (e.g. +91)'),
  phoneNumber: z.string().min(7).max(15).regex(/^\d+$/, 'Phone number must contain only digits'),
});

export const VerifyPhoneOtpSchema = z.object({
  countryCode: z.string().regex(/^\+\d{1,4}$/),
  phoneNumber: z.string().min(7).max(15),
  otp: z.string().length(6).regex(/^\d{6}$/),
});

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const KycSubmissionSchema = z.object({
  docType: z.enum(['INDIAN_PASSPORT', 'DRIVING_LICENCE', 'VOTER_ID', 'PAN_CARD']),
  docNumber: z.string().min(5).max(30),
  frontImageBase64: z.string().min(50, 'Front document image is required'),
  backImageBase64: z.string().optional(),
  consentGiven: z.literal(true, {
    message: 'Informed consent is required to process identity verification',
  }),
});

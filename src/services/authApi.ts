import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser';

const SESSION_STORAGE_KEY = 'scamshield_auth_token';

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

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN' | 'SECURITY_ANALYST' | 'DEMO_USER';
  isDemo?: boolean;
  demoProfileId?: DemoProfileId;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  phone?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  kycStatus: 'NOT_STARTED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED';
  kycRecord?: {
    id: string;
    docType: 'INDIAN_PASSPORT' | 'DRIVING_LICENCE' | 'VOTER_ID' | 'PAN_CARD';
    docNumberMasked: string;
    status: 'NOT_STARTED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED';
    submittedAt: string;
    reviewedAt?: string;
    rejectionReason?: string;
    providerReferenceId: string;
    authenticityScore?: number;
  };
  passkeys: {
    id: string;
    friendlyName: string;
    deviceType?: string;
    createdAt: string;
    lastUsedAt: string;
  }[];
  twoFactorEnforced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveSession {
  tokenSnippet: string;
  isCurrent: boolean;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface ProviderStatus {
  email: {
    configured: boolean;
    activeProvider: string;
  };
  sms: {
    configured: boolean;
    activeProvider: string;
  };
}

export interface SecurityAuditItem {
  id: string;
  timestamp: string;
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
  ipAddress: string;
  userAgent: string;
  details: string;
}

// Token storage helpers
export function getStoredSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredSessionToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(SESSION_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage issues in private mode
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredSessionToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: 'include', // Include HTTP-only cookies
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP ${response.status}: Request failed`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const authApi = {
  isWebAuthnSupported(): boolean {
    return browserSupportsWebAuthn();
  },

  async getMe(): Promise<{
    authenticated: boolean;
    user: UserProfile | null;
    sessions?: ActiveSession[];
    providers?: ProviderStatus;
  }> {
    return request('/api/auth/me', { method: 'GET' });
  },

  async signup(payload: { email: string; password: string; displayName: string }): Promise<{
    success: boolean;
    user: UserProfile;
    sessionToken: string;
    message: string;
  }> {
    const data = await request<any>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.sessionToken) {
      setStoredSessionToken(data.sessionToken);
    }
    return data;
  },

  async login(payload: { email: string; password: string }): Promise<{
    success: boolean;
    user: UserProfile;
    sessionToken: string;
  }> {
    const data = await request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.sessionToken) {
      setStoredSessionToken(data.sessionToken);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setStoredSessionToken(null);
    }
  },

  async logoutAll(): Promise<{ count: number }> {
    try {
      const res = await request<any>('/api/auth/logout-all', { method: 'POST' });
      return res;
    } finally {
      setStoredSessionToken(null);
    }
  },

  // Email OTP
  async requestEmailOtp(email: string): Promise<{
    success: boolean;
    provider: string;
    providerConfigured: boolean;
    cooldownSeconds: number;
    message: string;
  }> {
    return request('/api/auth/email/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyEmailOtp(email: string, otp: string): Promise<{
    success: boolean;
    verified: boolean;
    message: string;
    user?: UserProfile;
  }> {
    return request('/api/auth/email/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  // Phone OTP
  async requestPhoneOtp(countryCode: string, phoneNumber: string): Promise<{
    success: boolean;
    provider: string;
    providerConfigured: boolean;
    cooldownSeconds: number;
    message: string;
  }> {
    return request('/api/auth/phone/request-otp', {
      method: 'POST',
      body: JSON.stringify({ countryCode, phoneNumber }),
    });
  },

  async verifyPhoneOtp(countryCode: string, phoneNumber: string, otp: string): Promise<{
    success: boolean;
    verified: boolean;
    phone: string;
    message: string;
    user?: UserProfile;
  }> {
    return request('/api/auth/phone/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ countryCode, phoneNumber, otp }),
    });
  },

  // Passkey Registration (Create Passkey)
  async registerPasskey(friendlyName?: string): Promise<{ success: boolean; message: string }> {
    const options = await request<any>('/api/auth/passkey/register-options', {
      method: 'POST',
    });

    const regResponse = await startRegistration({ optionsJSON: options });

    return request('/api/auth/passkey/register-verify', {
      method: 'POST',
      body: JSON.stringify({
        response: regResponse,
        friendlyName: friendlyName || 'Personal Security Passkey',
      }),
    });
  },

  // Passkey Login (Sign in with Passkey)
  async loginWithPasskey(email: string): Promise<{
    success: boolean;
    user: UserProfile;
    sessionToken: string;
  }> {
    const options = await request<any>('/api/auth/passkey/login-options', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const authResponse = await startAuthentication({ optionsJSON: options });

    const data = await request<any>('/api/auth/passkey/login-verify', {
      method: 'POST',
      body: JSON.stringify({
        email,
        response: authResponse,
      }),
    });

    if (data.sessionToken) {
      setStoredSessionToken(data.sessionToken);
    }
    return data;
  },

  async deletePasskey(id: string): Promise<{ success: boolean }> {
    return request(`/api/auth/passkey/${id}`, { method: 'DELETE' });
  },

  // KYC
  async submitKyc(payload: {
    docType: 'INDIAN_PASSPORT' | 'DRIVING_LICENCE' | 'VOTER_ID' | 'PAN_CARD';
    docNumber: string;
    frontImageBase64: string;
    backImageBase64?: string;
    consentGiven: true;
  }): Promise<{
    success: boolean;
    record: any;
    providerDetails: any;
    message: string;
  }> {
    return request('/api/auth/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async purgeKyc(): Promise<{ success: boolean; message: string }> {
    return request('/api/auth/kyc/purge', { method: 'DELETE' });
  },

  // Password Recovery
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(payload: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    return request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Audit Logs
  async getAuditLogs(): Promise<{ logs: SecurityAuditItem[] }> {
    return request('/api/auth/security/audit-logs', { method: 'GET' });
  },

  // Demo Profiles – Explore ScamShield AI
  async getDemoProfiles(): Promise<{
    success: boolean;
    profiles: DemoProfile[];
    disclaimer: string;
  }> {
    return request('/api/auth/demo/profiles', { method: 'GET' });
  },

  async launchDemoProfile(profileId: string): Promise<{
    success: boolean;
    user: UserProfile;
    sessionToken: string;
    demoProfile: DemoProfile;
    message: string;
  }> {
    const data = await request<any>('/api/auth/demo/launch', {
      method: 'POST',
      body: JSON.stringify({ profileId }),
    });
    if (data.sessionToken) {
      setStoredSessionToken(data.sessionToken);
    }
    return data;
  },

  async exitDemo(): Promise<{ success: boolean; message: string }> {
    try {
      return await request<any>('/api/auth/demo/exit', { method: 'POST' });
    } finally {
      setStoredSessionToken(null);
    }
  },

  // Sandbox helper (development testing)
  async getSandboxCode(target: string): Promise<{ code: string }> {
    return request('/api/auth/test-harness/get-sandbox-code', {
      method: 'POST',
      body: JSON.stringify({ target }),
    });
  },
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  UserProfile,
  ActiveSession,
  ProviderStatus,
  DemoProfile,
} from '../services/authApi';

export type AuthModalMode =
  | 'signin'
  | 'signup'
  | 'forgot_password'
  | 'verify_email'
  | 'verify_phone'
  | 'kyc'
  | 'passkey'
  | 'demo_selector';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  activeDemoProfile: DemoProfile | null;
  demoProfilesList: DemoProfile[];
  isLoading: boolean;
  sessions: ActiveSession[];
  providers: ProviderStatus | null;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  pendingEmail?: string;
  pendingPhone?: { countryCode: string; phoneNumber: string };
  openAuthModal: (mode?: AuthModalMode, extra?: { email?: string; phone?: { countryCode: string; phoneNumber: string } }) => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<UserProfile>;
  signup: (email: string, password: string, displayName: string) => Promise<UserProfile>;
  launchDemoProfile: (profileId: string) => Promise<DemoProfile>;
  exitDemoMode: () => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loadDemoProfiles: () => Promise<DemoProfile[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [providers, setProviders] = useState<ProviderStatus | null>(null);
  const [demoProfilesList, setDemoProfilesList] = useState<DemoProfile[]>([]);
  const [activeDemoProfile, setActiveDemoProfile] = useState<DemoProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');
  const [pendingEmail, setPendingEmail] = useState<string | undefined>(undefined);
  const [pendingPhone, setPendingPhone] = useState<{ countryCode: string; phoneNumber: string } | undefined>(undefined);

  const loadDemoProfiles = useCallback(async (): Promise<DemoProfile[]> => {
    try {
      const res = await authApi.getDemoProfiles();
      setDemoProfilesList(res.profiles || []);
      return res.profiles || [];
    } catch {
      return [];
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      if (data.authenticated && data.user) {
        setUser(data.user);
        setSessions(data.sessions || []);
        setProviders(data.providers || null);

        // If user is a demo user, match their active profile
        if (data.user.isDemo && data.user.demoProfileId) {
          const profiles = demoProfilesList.length > 0 ? demoProfilesList : await loadDemoProfiles();
          const matched = profiles.find((p) => p.id === data.user?.demoProfileId);
          if (matched) setActiveDemoProfile(matched);
        } else {
          setActiveDemoProfile(null);
        }
      } else {
        setUser(null);
        setSessions([]);
        setActiveDemoProfile(null);
        setProviders(data.providers || null);
      }
    } catch {
      setUser(null);
      setActiveDemoProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [demoProfilesList, loadDemoProfiles]);

  useEffect(() => {
    loadDemoProfiles();
    refreshUser();
  }, [loadDemoProfiles, refreshUser]);

  const openAuthModal = (
    mode: AuthModalMode = 'signin',
    extra?: { email?: string; phone?: { countryCode: string; phoneNumber: string } }
  ) => {
    setAuthModalMode(mode);
    if (extra?.email) setPendingEmail(extra.email);
    if (extra?.phone) setPendingPhone(extra.phone);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setUser(res.user);
    setActiveDemoProfile(null);
    await refreshUser();
    return res.user;
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const res = await authApi.signup({ email, password, displayName });
    setUser(res.user);
    setActiveDemoProfile(null);
    setPendingEmail(email);
    await refreshUser();
    return res.user;
  };

  const launchDemoProfile = async (profileId: string): Promise<DemoProfile> => {
    const res = await authApi.launchDemoProfile(profileId);
    setUser(res.user);
    setActiveDemoProfile(res.demoProfile);
    closeAuthModal();
    await refreshUser();
    return res.demoProfile;
  };

  const exitDemoMode = async () => {
    await authApi.exitDemo();
    setUser(null);
    setActiveDemoProfile(null);
    setSessions([]);
    await refreshUser();
    openAuthModal('signin');
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setActiveDemoProfile(null);
    setSessions([]);
    await refreshUser();
  };

  const logoutAll = async () => {
    await authApi.logoutAll();
    setUser(null);
    setActiveDemoProfile(null);
    setSessions([]);
    await refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isDemoMode: Boolean(user?.isDemo),
        activeDemoProfile,
        demoProfilesList,
        isLoading,
        sessions,
        providers,
        isAuthModalOpen,
        authModalMode,
        pendingEmail,
        pendingPhone,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        launchDemoProfile,
        exitDemoMode,
        logout,
        logoutAll,
        refreshUser,
        setUser,
        loadDemoProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

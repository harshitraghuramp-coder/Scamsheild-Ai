import React, { useState } from 'react';
import { useAuth, AuthModalMode } from '../../context/AuthContext';
import { authApi } from '../../services/authApi';
import { EmailOtpVerification } from './EmailOtpVerification';
import { PhoneOtpVerification } from './PhoneOtpVerification';
import { PasskeyManager } from './PasskeyManager';
import { KycVerificationView } from './KycVerificationView';
import { DemoProfileSelector } from './DemoProfileSelector';
import {
  Shield,
  X,
  Lock,
  Mail,
  User,
  KeyRound,
  Fingerprint,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Users,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    user,
    login,
    signup,
    refreshUser,
    pendingEmail,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot_password'>(
    authModalMode === 'signup'
      ? 'signup'
      : authModalMode === 'forgot_password'
      ? 'forgot_password'
      : 'signin'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode changes
  React.useEffect(() => {
    if (authModalMode === 'signup') setActiveTab('signup');
    else if (authModalMode === 'forgot_password') setActiveTab('forgot_password');
    else if (authModalMode === 'signin') setActiveTab('signin');
  }, [authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      setSuccessMessage('Welcome back! Signed in securely.');
      setTimeout(() => {
        closeAuthModal();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await signup(email, password, displayName);
      setSuccessMessage('Account created! Please verify your email.');
      // Immediately open email OTP verification step
      openAuthModal('verify_email', { email });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasskeySignIn = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address to authenticate with your registered passkey.');
      return;
    }

    setErrorMessage(null);
    setIsPasskeyLoading(true);
    try {
      await authApi.loginWithPasskey(email.trim());
      await refreshUser();
      setSuccessMessage('Passkey verified successfully!');
      setTimeout(() => {
        closeAuthModal();
      }, 600);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Passkey authentication was cancelled or timed out.');
      } else {
        setErrorMessage(err.message || 'Passkey verification failed. Ensure this device has a registered passkey.');
      }
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setSuccessMessage(res.message);
      setForgotStep('reset');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request password reset code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await authApi.resetPassword({
        email: email.trim(),
        otp: resetOtp.trim(),
        newPassword,
      });
      setSuccessMessage(res.message);
      setTimeout(() => {
        setActiveTab('signin');
        setForgotStep('request');
        setSuccessMessage('Password reset complete. You can now sign in.');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full ${authModalMode === 'demo_selector' ? 'max-w-3xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0B0F19] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 text-slate-100 transition-all duration-200`}>
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#070B14] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-white font-mono">
                SCAMSHIELD<span className="text-cyan-400">AI</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                Secure Identity
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Think Before You Click.</p>
          </div>
        </div>

        {/* Context-Driven View Switching */}
        {authModalMode === 'demo_selector' && (
          <DemoProfileSelector
            onSelectProfile={() => closeAuthModal()}
            onClose={closeAuthModal}
            onBack={() => openAuthModal('signin')}
          />
        )}

        {authModalMode === 'verify_email' && (
          <EmailOtpVerification
            email={pendingEmail || user?.email || email}
            onSuccess={() => {
              openAuthModal('verify_phone');
            }}
            onChangeEmail={() => {
              openAuthModal('signup');
            }}
            onBack={() => setActiveTab('signin')}
          />
        )}

        {authModalMode === 'verify_phone' && (
          <PhoneOtpVerification
            onSuccess={() => {
              openAuthModal('passkey');
            }}
            onSkip={() => {
              openAuthModal('passkey');
            }}
            onBack={() => openAuthModal('verify_email')}
          />
        )}

        {authModalMode === 'passkey' && user && (
          <div className="space-y-4">
            <PasskeyManager
              user={user}
              onUpdate={refreshUser}
              onClose={closeAuthModal}
            />
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => openAuthModal('kyc')}
                className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 font-mono"
              >
                <span>Continue to Optional KYC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {authModalMode === 'kyc' && user && (
          <KycVerificationView
            user={user}
            onUpdate={refreshUser}
            onClose={closeAuthModal}
            onSkip={closeAuthModal}
          />
        )}

        {/* Standard Auth Tabs (Sign In, Create Account, Forgot Password) */}
        {(authModalMode === 'signin' || authModalMode === 'signup' || authModalMode === 'forgot_password') && (
          <div className="space-y-5">
            {/* Tab Buttons */}
            <div className="flex border-b border-slate-800 gap-6 text-xs font-mono">
              <button
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`pb-3 transition relative cursor-pointer ${
                  activeTab === 'signin'
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
                {activeTab === 'signin' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`pb-3 transition relative cursor-pointer ${
                  activeTab === 'signup'
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
                {activeTab === 'signup' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('forgot_password');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`pb-3 transition relative cursor-pointer ${
                  activeTab === 'forgot_password'
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Recovery
                {activeTab === 'forgot_password' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            </div>

            {/* Notifications */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB: Sign In */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="defender@scamshield.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#070B14] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono font-bold uppercase text-slate-400">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot_password')}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#070B14] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In with Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* 1-Tap Passkey Sign In */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handlePasskeySignIn}
                    disabled={isPasskeyLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPasskeyLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                        <span>Prompting Authenticator...</span>
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-4 h-4 text-cyan-400" />
                        <span>Sign In with Passkey / Biometrics</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-1.5 font-mono">
                    Touch ID · Face ID · Windows Hello · Hardware Security Keys
                  </p>
                </div>

                {/* Explore Demo Profiles Section */}
                <div className="pt-3 border-t border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">
                    Don&apos;t want to create an account yet?
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openAuthModal('demo_selector')}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-950 via-[#0A152E] to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/40"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Try Demo Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={closeAuthModal}
                      className="w-full sm:w-auto py-2 px-3 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-mono transition cursor-pointer"
                    >
                      Continue as Guest
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-bold text-cyan-300 font-mono">Standard Demo Analyst:</span>{' '}
                  <code className="text-slate-300">defender@scamshield.ai</code> /{' '}
                  <code className="text-slate-300">Shield#2026!</code>
                </div>
              </form>
            )}

            {/* TAB: Create Account */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Full Name / Cyber Handle
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Sharma"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#070B14] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#070B14] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Master Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#070B14] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Hashed with salted PBKDF2-HMAC-SHA512.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Initializing Identity Vault...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Create Account & Verify Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB: Recovery */}
            {activeTab === 'forgot_password' && (
              <div className="space-y-4">
                {forgotStep === 'request' ? (
                  <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                    <p className="text-xs text-slate-400">
                      Enter your account email. If recognized, we'll dispatch a 6-digit recovery OTP code.
                    </p>
                    <div>
                      <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                        Registered Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#070B14] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching OTP...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Send Recovery Code</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                        6-Digit Recovery OTP
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="123456"
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-[#070B14] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-center font-mono text-lg font-bold tracking-widest focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
                        New Master Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        placeholder="Minimum 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#070B14] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Update Password & Sign In</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

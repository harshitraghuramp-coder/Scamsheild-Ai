import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi, SecurityAuditItem } from '../../services/authApi';
import { PasskeyManager } from '../auth/PasskeyManager';
import { KycVerificationView } from '../auth/KycVerificationView';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  KeyRound,
  Mail,
  Smartphone,
  FileCheck2,
  Lock,
  LogOut,
  RefreshCw,
  CheckCircle,
  Clock,
  Laptop,
  AlertTriangle,
  Server,
  ArrowRight,
  UserCheck,
  History,
} from 'lucide-react';

export const SecurityDashboardView: React.FC = () => {
  const {
    user,
    isAuthenticated,
    openAuthModal,
    logout,
    logoutAll,
    refreshUser,
    sessions,
    providers,
  } = useAuth();

  const [activeSection, setActiveSection] = useState<'overview' | 'passkeys' | 'kyc' | 'audit'>('overview');
  const [auditLogs, setAuditLogs] = useState<SecurityAuditItem[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadAuditLogs();
    }
  }, [isAuthenticated]);

  const loadAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const data = await authApi.getAuditLogs();
      setAuditLogs(data.logs || []);
    } catch (err: any) {
      console.warn('Could not load audit logs:', err.message);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleLogoutAll = async () => {
    if (confirm('Sign out from all active devices and sessions?')) {
      await logoutAll();
      setActionMessage('Signed out from all devices.');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] border border-cyan-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/40">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-wide">
              ScamShield Secure Identity Vault
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in or create a verified account to manage your Multi-Factor Passkeys, cryptographic Email & Phone verification, and DPDP-compliant Indian KYC credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openAuthModal('signin')}
              className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to Account</span>
            </button>

            <button
              onClick={() => openAuthModal('signup')}
              className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs transition cursor-pointer"
            >
              <span>Create New Account</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#070B14]/80 border border-slate-800/80 max-w-lg mx-auto text-left text-xs text-slate-400 mt-6">
            <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Knowledge Architecture</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Passkeys use FIDO2 public-key cryptography. Biometrics never leave your physical device. Passwords are PBKDF2-hashed with salt.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Identity Trust Score
  const trustFactors = [
    user.emailVerified,
    user.phoneVerified,
    user.passkeys.length > 0,
    user.kycStatus === 'VERIFIED',
  ];
  const trustScore = Math.round((trustFactors.filter(Boolean).length / trustFactors.length) * 100);

  return (
    <div className="space-y-6">
      {/* Hero Security Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0B132B] via-[#0A1024] to-[#070B14] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-xl shadow-cyan-500/20">
              <div className="w-full h-full bg-[#070B14] rounded-[14px] flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>Identity Vault #{user.id}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {user.displayName}
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                {user.email} · Role: <span className="text-cyan-300">{user.role}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Identity Trust Rating */}
            <div className="p-3 rounded-2xl bg-[#070B14]/80 border border-slate-800 flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Identity Trust Score</span>
                <span className="text-lg font-extrabold text-cyan-400 font-mono">{trustScore}%</span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-cyan-500/40 flex items-center justify-center font-mono text-xs font-bold text-white bg-cyan-950/40">
                {trustScore >= 75 ? 'A+' : trustScore >= 50 ? 'B' : 'C'}
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-rose-300 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {user.isDemo && (
        <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/50 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-950/30">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="leading-relaxed">
              <strong>SIMULATED DEMO VAULT:</strong> You are evaluating an isolated demo profile ({user.displayName}). All verification badges, passkeys, and KYC records shown below are synthetic demo simulations.
            </span>
          </div>
          <button
            onClick={() => openAuthModal('demo_selector')}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-[11px] shrink-0 border border-amber-500/40 cursor-pointer"
          >
            Switch Profile
          </button>
        </div>
      )}

      {actionMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-mono">
        <button
          onClick={() => setActiveSection('overview')}
          className={`pb-3 transition relative cursor-pointer ${
            activeSection === 'overview'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Security Overview
          {activeSection === 'overview' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSection('passkeys')}
          className={`pb-3 transition relative cursor-pointer ${
            activeSection === 'passkeys'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Passkeys & Biometrics ({user.passkeys.length})
          {activeSection === 'passkeys' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSection('kyc')}
          className={`pb-3 transition relative cursor-pointer ${
            activeSection === 'kyc'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Identity Documents (KYC)
          {activeSection === 'kyc' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSection('audit')}
          className={`pb-3 transition relative cursor-pointer ${
            activeSection === 'audit'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Security Audit Logs
          {activeSection === 'audit' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
          )}
        </button>
      </div>

      {/* SECTION: Overview */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* 4 Multi-Factor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Email OTP */}
            <div className="p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  {user.emailVerified ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                      Unverified
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase">Email Security</h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">{user.email}</p>
                </div>
              </div>

              {user.emailVerified ? (
                <p className="text-[10px] text-slate-500 font-mono">
                  Verified on: {user.emailVerifiedAt ? new Date(user.emailVerifiedAt).toLocaleDateString() : 'Active'}
                </p>
              ) : (
                <button
                  onClick={() => openAuthModal('verify_email', { email: user.email })}
                  className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition cursor-pointer"
                >
                  Verify Email OTP
                </button>
              )}
            </div>

            {/* 2. Phone OTP */}
            <div className="p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  {user.phoneVerified ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                      Not Linked
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase">Phone SMS 2FA</h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                    {user.phone || 'No phone linked'}
                  </p>
                </div>
              </div>

              {user.phoneVerified ? (
                <p className="text-[10px] text-slate-500 font-mono">
                  Verified: {user.phoneVerifiedAt ? new Date(user.phoneVerifiedAt).toLocaleDateString() : 'Active'}
                </p>
              ) : (
                <button
                  onClick={() => openAuthModal('verify_phone')}
                  className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition cursor-pointer"
                >
                  Add Phone SMS 2FA
                </button>
              )}
            </div>

            {/* 3. Passkey */}
            <div className="p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  {user.passkeys.length > 0 ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      {user.passkeys.length} Registered
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                      None
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase">FIDO2 Passkeys</h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {user.passkeys[0]?.friendlyName || 'Passwordless biometrics'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSection('passkeys')}
                className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition cursor-pointer"
              >
                Manage Passkeys
              </button>
            </div>

            {/* 4. KYC Status */}
            <div className="p-5 rounded-2xl bg-[#0B132B]/80 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      user.kycStatus === 'VERIFIED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : user.kycStatus === 'PENDING_REVIEW'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {user.kycStatus.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase">Identity Document</h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                    {user.kycRecord?.docType ? user.kycRecord.docType.replace('_', ' ') : 'Indian Govt ID (Optional)'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSection('kyc')}
                className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition cursor-pointer"
              >
                {user.kycStatus === 'VERIFIED' ? 'View Certificate' : 'Verify Identity'}
              </button>
            </div>
          </div>

          {/* Active Sessions & Registered Devices */}
          <div className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Active Sessions & Registered Devices ({sessions.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Devices currently authorized with cryptographic session tokens.
                </p>
              </div>

              <button
                onClick={handleLogoutAll}
                className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-mono transition cursor-pointer"
              >
                Sign Out From All Devices
              </button>
            </div>

            <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-[#070B14] overflow-hidden">
              {sessions.map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{s.userAgent}</span>
                        {s.isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                            Current Device
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        IP: {s.ipAddress} · First connected: {new Date(s.createdAt).toLocaleDateString()} · Active:{' '}
                        {new Date(s.lastActiveAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Authorized
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Provider Integrations Status (Truth-in-Systems) */}
          <div className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                External Verification Infrastructure
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#070B14] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Email OTP Dispatch</span>
                <span className="font-bold text-white mt-1 block">
                  {providers?.email.activeProvider || 'Resend / SMTP Gateway'}
                </span>
                <span className="text-[10px] text-cyan-400 mt-1 block">
                  {providers?.email.configured ? 'Live API Active' : 'Sandbox Dispatcher Ready'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070B14] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">SMS OTP Gateway</span>
                <span className="font-bold text-white mt-1 block">
                  {providers?.sms.activeProvider || 'Twilio / Fast2SMS India'}
                </span>
                <span className="text-[10px] text-cyan-400 mt-1 block">
                  {providers?.sms.configured ? 'Live Telecom Route' : 'Sandbox Dispatcher Ready'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070B14] border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">KYC Registrar Engine</span>
                <span className="font-bold text-white mt-1 block">Parivahan / ECI / ITD</span>
                <span className="text-[10px] text-emerald-400 mt-1 block">DPDP Act Compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Passkeys */}
      {activeSection === 'passkeys' && (
        <PasskeyManager
          user={user}
          onUpdate={refreshUser}
        />
      )}

      {/* SECTION: KYC */}
      {activeSection === 'kyc' && (
        <KycVerificationView
          user={user}
          onUpdate={refreshUser}
        />
      )}

      {/* SECTION: Audit Logs */}
      {activeSection === 'audit' && (
        <div className="p-6 rounded-3xl bg-[#0B132B]/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Security Audit Trail & Incident Logs</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tamper-evident chronological log of all login, OTP, passkey, and verification actions.
              </p>
            </div>

            <button
              onClick={loadAuditLogs}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Refresh Audit Logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingAudit ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-[#070B14] overflow-hidden max-h-[500px] overflow-y-auto font-mono text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No security audit events recorded yet.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : log.status === 'WARNING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="text-slate-300">{log.details}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span>IP: {log.ipAddress}</span>
                      <span>·</span>
                      <span className="truncate max-w-xs">{log.userAgent}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

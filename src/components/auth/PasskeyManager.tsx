import React, { useState } from 'react';
import { authApi, UserProfile } from '../../services/authApi';
import {
  KeyRound,
  Fingerprint,
  Smartphone,
  Laptop,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

interface PasskeyManagerProps {
  user: UserProfile;
  onUpdate: () => Promise<void>;
  onClose?: () => void;
}

export const PasskeyManager: React.FC<PasskeyManagerProps> = ({
  user,
  onUpdate,
  onClose,
}) => {
  const [friendlyName, setFriendlyName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isWebAuthnSupported = authApi.isWebAuthnSupported();

  const handleRegisterPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsRegistering(true);

    try {
      const defaultName =
        friendlyName.trim() ||
        `${navigator.platform.includes('Mac') ? 'MacBook' : navigator.platform.includes('Win') ? 'Windows Device' : 'Mobile Device'} Passkey`;

      const result = await authApi.registerPasskey(defaultName);
      setSuccessMessage(result.message || 'Passkey registered successfully!');
      setFriendlyName('');
      await onUpdate();
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setErrorMessage('Passkey setup was cancelled by the user or timed out.');
      } else {
        setErrorMessage(err.message || 'Passkey registration failed. Please ensure biometric or PIN access is available.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeletePasskey = async (id: string) => {
    if (!confirm('Are you sure you want to remove this passkey? You may lose passwordless sign-in on this device.')) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);
    try {
      await authApi.deletePasskey(id);
      setSuccessMessage('Passkey removed successfully.');
      await onUpdate();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove passkey.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-[10px] font-mono text-cyan-300 mb-2">
            <KeyRound className="w-3 h-3 text-cyan-400" />
            <span>FIDO2 / WebAuthn Standard</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Passkey & Passwordless Security
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in instantly using Touch ID, Face ID, Windows Hello, or hardware security keys (e.g. YubiKey). No passwords to steal or forget.
          </p>
        </div>
      </div>

      {!isWebAuthnSupported && (
        <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            Your current browser or operating system does not support the FIDO2/WebAuthn standard. Please use Chrome, Safari, Edge, or Firefox on a modern device.
          </span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2">
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

      {/* Register New Passkey Section */}
      <form onSubmit={handleRegisterPasskey} className="p-5 rounded-2xl bg-[#070B14] border border-cyan-500/30 space-y-4">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Register This Device as a Passkey
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          Your biometric data never leaves your device. ScamShield AI only stores a cryptographic public key.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Work MacBook Touch ID or Pixel Fingerprint"
            value={friendlyName}
            onChange={(e) => setFriendlyName(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={isRegistering || !isWebAuthnSupported}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 shrink-0"
          >
            {isRegistering ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Interacting with Authenticator...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Create Passkey</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Registered Passkeys List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          Registered Passkey Authenticators ({user.passkeys.length})
        </h3>

        {user.passkeys.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <KeyRound className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              No passkeys configured yet. Add your first passkey above for one-touch passwordless sign-in!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-[#070B14] overflow-hidden">
            {user.passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/30 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
                    {passkey.deviceType === 'cross-platform' ? (
                      <KeyRound className="w-5 h-5" />
                    ) : passkey.friendlyName.toLowerCase().includes('phone') ||
                      passkey.friendlyName.toLowerCase().includes('pixel') ||
                      passkey.friendlyName.toLowerCase().includes('iphone') ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white truncate font-mono">
                        {passkey.friendlyName}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Active
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Added: {new Date(passkey.createdAt).toLocaleDateString()} · Last used:{' '}
                      {new Date(passkey.lastUsedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeletePasskey(passkey.id)}
                  disabled={deletingId === passkey.id}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition cursor-pointer"
                  title="Remove this passkey"
                >
                  {deletingId === passkey.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recovery Information */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Safe Account Recovery</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          If you ever lose access to your biometric device or security key, you can always recover your account using your verified email address or SMS phone verification codes.
        </p>
      </div>
    </div>
  );
};

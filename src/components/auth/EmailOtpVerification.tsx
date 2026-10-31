import React, { useState, useEffect, useRef } from 'react';
import { authApi, UserProfile } from '../../services/authApi';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

interface EmailOtpVerificationProps {
  email: string;
  onSuccess: (user?: UserProfile) => void;
  onChangeEmail?: () => void;
  onBack?: () => void;
}

export const EmailOtpVerification: React.FC<EmailOtpVerificationProps> = ({
  email,
  onSuccess,
  onChangeEmail,
  onBack,
}) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [providerConfigured, setProviderConfigured] = useState<boolean>(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Cooldown countdown timer
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      if (pastedDigits.length > 0) {
        const nextDigits = [...digits];
        pastedDigits.forEach((d, idx) => {
          if (idx < 6) nextDigits[idx] = d;
        });
        setDigits(nextDigits);
        const focusIdx = Math.min(pastedDigits.length, 5);
        inputRefs.current[focusIdx]?.focus();
        return;
      }
    }

    const cleanChar = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = cleanChar;
    setDigits(nextDigits);
    setErrorMessage(null);

    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullOtp = digits.join('');

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const res = await authApi.verifyEmailOtp(email, fullOtp);
      setStatusMessage('Email verified successfully!');
      setTimeout(() => {
        onSuccess(res.user);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setIsSending(true);
    setErrorMessage(null);
    try {
      const res = await authApi.requestEmailOtp(email);
      setCooldown(res.cooldownSeconds || 60);
      setProviderConfigured(res.providerConfigured);
      setStatusMessage(res.message);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center shadow-lg shadow-cyan-950/40">
          <Mail className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-wide">
          Verify Your Email
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          We sent a 6-digit cryptographic verification code to:
          <br />
          <span className="font-mono text-cyan-300 font-semibold text-sm">{email}</span>
        </p>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-800/60 text-cyan-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 6-Digit Code Inputs */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            autoFocus={idx === 0}
            className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-bold bg-[#070B14] border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white rounded-xl outline-none transition"
          />
        ))}
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleVerify()}
          disabled={fullOtp.length !== 6 || isVerifying}
          className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying Cryptographic Code...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          {onChangeEmail ? (
            <button
              onClick={onChangeEmail}
              className="text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Change email address
            </button>
          ) : (
            <span />
          )}

          <button
            onClick={handleResendOtp}
            disabled={cooldown > 0 || isSending}
            className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 font-mono transition cursor-pointer"
          >
            {isSending ? (
              'Sending...'
            ) : cooldown > 0 ? (
              `Resend code in ${cooldown}s`
            ) : (
              'Resend 6-Digit Code'
            )}
          </button>
        </div>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer pt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      )}
    </div>
  );
};

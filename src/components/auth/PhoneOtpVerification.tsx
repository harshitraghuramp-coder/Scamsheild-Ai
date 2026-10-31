import React, { useState, useEffect, useRef } from 'react';
import { authApi, UserProfile } from '../../services/authApi';
import { Smartphone, CheckCircle, AlertCircle, RefreshCw, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

interface PhoneOtpVerificationProps {
  initialPhone?: { countryCode: string; phoneNumber: string };
  onSuccess: (user?: UserProfile) => void;
  onSkip?: () => void;
  onBack?: () => void;
}

const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'United States (+1)' },
  { code: '+44', label: 'United Kingdom (+44)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+65', label: 'Singapore (+65)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+81', label: 'Japan (+81)' },
];

export const PhoneOtpVerification: React.FC<PhoneOtpVerificationProps> = ({
  initialPhone,
  onSuccess,
  onSkip,
  onBack,
}) => {
  const [step, setStep] = useState<'input' | 'verify'>(initialPhone ? 'verify' : 'input');
  const [countryCode, setCountryCode] = useState(initialPhone?.countryCode || '+91');
  const [phoneNumber, setPhoneNumber] = useState(initialPhone?.phoneNumber || '');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== 'verify' || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown, step]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 7 || cleanNumber.length > 15) {
      setErrorMessage('Please enter a valid phone number (e.g. 10 digits for India).');
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    try {
      const res = await authApi.requestPhoneOtp(countryCode, cleanNumber);
      setStatusMessage(res.message);
      setCooldown(res.cooldownSeconds || 60);
      setStep('verify');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch SMS verification code.');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
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
      setErrorMessage('Please enter the 6-digit verification code sent via SMS.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const res = await authApi.verifyPhoneOtp(countryCode, phoneNumber.replace(/\D/g, ''), fullOtp);
      setStatusMessage('Phone number verified successfully!');
      setTimeout(() => {
        onSuccess(res.user);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'SMS verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center shadow-lg shadow-cyan-950/40">
          <Smartphone className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-wide">
          {step === 'input' ? 'Secure Phone Verification' : 'Enter SMS Code'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {step === 'input'
            ? 'Add a trusted mobile number for multi-factor authorization and urgent cyber threat alerts.'
            : `We sent a 6-digit SMS security code to ${countryCode} ${phoneNumber}.`}
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

      {step === 'input' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
              Country & Phone Number
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-36 bg-[#070B14] border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.label}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="flex-1 bg-[#070B14] border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              India (+91) default. Standard telecom messaging rates may apply.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSending || !phoneNumber.trim()}
            className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending SMS OTP...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Send Security OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
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

          <button
            onClick={() => handleVerify()}
            disabled={fullOtp.length !== 6 || isVerifying}
            className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying SMS Code...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Verify Phone Number</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <button
              onClick={() => {
                setStep('input');
                setDigits(['', '', '', '', '', '']);
                setErrorMessage(null);
              }}
              className="text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Change phone number
            </button>

            <button
              onClick={handleSendOtp}
              disabled={cooldown > 0 || isSending}
              className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 font-mono transition cursor-pointer"
            >
              {isSending ? (
                'Sending...'
              ) : cooldown > 0 ? (
                `Resend SMS in ${cooldown}s`
              ) : (
                'Resend SMS Code'
              )}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <span />
        )}

        {onSkip && (
          <button
            onClick={onSkip}
            className="text-slate-500 hover:text-slate-300 transition cursor-pointer"
          >
            Skip for now &rarr;
          </button>
        )}
      </div>
    </div>
  );
};

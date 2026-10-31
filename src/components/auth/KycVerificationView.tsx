import React, { useState } from 'react';
import { authApi, UserProfile } from '../../services/authApi';
import {
  FileCheck2,
  Upload,
  Shield,
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Clock,
  XCircle,
  HelpCircle,
  Trash2,
  Eye,
  Camera,
  FileText,
  Lock,
} from 'lucide-react';

interface KycVerificationViewProps {
  user: UserProfile;
  onUpdate: () => Promise<void>;
  onClose?: () => void;
  onSkip?: () => void;
}

type KycDocType = 'INDIAN_PASSPORT' | 'DRIVING_LICENCE' | 'VOTER_ID' | 'PAN_CARD';

const DOC_TYPES: { id: KycDocType; name: string; issuer: string; placeholder: string; helper: string; requiresBack: boolean }[] = [
  {
    id: 'INDIAN_PASSPORT',
    name: 'Indian Passport',
    issuer: 'Ministry of External Affairs',
    placeholder: 'K1234567',
    helper: '1 letter followed by 7 numeric digits.',
    requiresBack: true,
  },
  {
    id: 'DRIVING_LICENCE',
    name: 'Driving Licence',
    issuer: 'Ministry of Road Transport & Highways (Sarathi)',
    placeholder: 'MH1420110012345',
    helper: 'Standard Parivahan format: 2 state letters + 13 to 14 digits.',
    requiresBack: true,
  },
  {
    id: 'VOTER_ID',
    name: 'Voter ID (EPIC Card)',
    issuer: 'Election Commission of India',
    placeholder: 'ABC1234567',
    helper: '3 letter constituency prefix followed by 7 digits.',
    requiresBack: false,
  },
  {
    id: 'PAN_CARD',
    name: 'Permanent Account Number (PAN)',
    issuer: 'Income Tax Department, Govt of India',
    placeholder: 'ABCDE1234F',
    helper: '5 letters, 4 digits, 1 letter format.',
    requiresBack: false,
  },
];

export const KycVerificationView: React.FC<KycVerificationViewProps> = ({
  user,
  onUpdate,
  onClose,
  onSkip,
}) => {
  const [docType, setDocType] = useState<KycDocType>('INDIAN_PASSPORT');
  const [docNumber, setDocNumber] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedDocConfig = DOC_TYPES.find((d) => d.id === docType)!;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('File size exceeds 8MB limit. Please upload an optimized image.');
      return;
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, WebP) or PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'front') setFrontImage(result);
      else setBackImage(result);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Explicit statutory Aadhaar rejection check
    if (/^\d{12}$/.test(docNumber.replace(/[\s-]/g, ''))) {
      setErrorMessage(
        'Aadhaar numbers cannot be collected under the Aadhaar Act, 2016. Please enter an accepted ID (Passport, Driving Licence, Voter ID, or PAN).'
      );
      return;
    }

    if (!docNumber.trim()) {
      setErrorMessage('Please enter the document registration number.');
      return;
    }

    if (!frontImage) {
      setErrorMessage('Please upload the front photo of your identity document.');
      return;
    }

    if (selectedDocConfig.requiresBack && !backImage) {
      setErrorMessage(`The reverse side of your ${selectedDocConfig.name} is required.`);
      return;
    }

    if (!consentGiven) {
      setErrorMessage('Informed user consent is legally required before processing verification.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.submitKyc({
        docType,
        docNumber: docNumber.trim(),
        frontImageBase64: frontImage,
        backImageBase64: backImage || undefined,
        consentGiven: true,
      });

      setSuccessMessage(res.message);
      await onUpdate();
    } catch (err: any) {
      setErrorMessage(err.message || 'Identity verification submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePurge = async () => {
    if (!confirm('Are you sure you want to permanently delete all uploaded identity records and certificates? This action is irreversible per DPDP Act data rights.')) {
      return;
    }

    setIsPurging(true);
    setErrorMessage(null);
    try {
      await authApi.purgeKyc();
      setSuccessMessage('Identity documents and verification records permanently purged.');
      setFrontImage(null);
      setBackImage(null);
      setDocNumber('');
      setConsentGiven(false);
      await onUpdate();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to purge documents.');
    } finally {
      setIsPurging(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Verified Identity</span>
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Pending Registrar Review</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Verification Rejected</span>
          </span>
        );
      case 'ADDITIONAL_INFO_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>Additional Info Required</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-mono text-xs">
            <span>Not Started (Optional)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-[#0B132B] to-[#070B14] border border-cyan-500/30">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950 border border-cyan-800 text-cyan-300 mb-1">
            <FileCheck2 className="w-3 h-3 text-cyan-400" />
            <span>Identity Trust Tier</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">
            Official Identity Verification (KYC)
          </h2>
          <p className="text-xs text-slate-400">
            Optional verification for anti-impersonation badge and high-confidence community incident reporting.
          </p>
        </div>
        <div>{getStatusBadge(user.kycStatus)}</div>
      </div>

      {/* Statutory UIDAI / Aadhaar Protection Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
          <Lock className="w-4 h-4 text-cyan-400" />
          <span>STATUTORY PRIVACY & UIDAI NOTICE</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Under the <strong>Aadhaar Act, 2016</strong> and Supreme Court of India directives, ScamShield AI explicitly does not collect, store, or process 12-digit Aadhaar numbers or biometrics. Please present an authorized non-Aadhaar government credential (Passport, Driving Licence, Voter ID, or PAN Card).
        </p>
      </div>

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

      {/* If already verified or in review, show audit summary */}
      {user.kycRecord && user.kycStatus !== 'NOT_STARTED' && (
        <div className="p-5 rounded-2xl bg-[#070B14] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Verification Audit Details
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">
              Ref: {user.kycRecord.providerReferenceId}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Document</span>
              <span className="font-bold text-white mt-0.5 block">{user.kycRecord.docType.replace('_', ' ')}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">ID Number</span>
              <span className="font-mono text-cyan-300 mt-0.5 block">{user.kycRecord.docNumberMasked}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Submitted At</span>
              <span className="text-slate-300 font-mono mt-0.5 block">
                {new Date(user.kycRecord.submittedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Confidence</span>
              <span className="text-emerald-400 font-mono font-bold mt-0.5 block">
                {user.kycRecord.authenticityScore ? `${user.kycRecord.authenticityScore}%` : 'In Progress'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <p className="text-[11px] text-slate-500">
              Data encrypted with SHA-256 fingerprinting. Protected under DPDP Act 2023.
            </p>
            <button
              onClick={handlePurge}
              disabled={isPurging}
              className="px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPurging ? 'Purging...' : 'Purge All KYC Records'}</span>
            </button>
          </div>
        </div>
      )}

      {/* KYC Upload Form (enabled when Not Started or Rejected) */}
      {(user.kycStatus === 'NOT_STARTED' || user.kycStatus === 'REJECTED') && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Document Type Selector */}
          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-2">
              Select Official Government Document
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOC_TYPES.map((doc) => {
                const isSelected = docType === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setDocType(doc.id);
                      setErrorMessage(null);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide">{doc.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{doc.issuer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Document Number Input */}
          <div>
            <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block mb-1">
              {selectedDocConfig.name} Number
            </label>
            <input
              type="text"
              placeholder={`e.g. ${selectedDocConfig.placeholder}`}
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value.toUpperCase())}
              required
              className="w-full bg-[#070B14] border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-mono focus:border-cyan-400 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1 font-mono">{selectedDocConfig.helper}</p>
          </div>

          {/* Upload Front & Back Documents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Front Image */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block">
                Document Front Photo <span className="text-rose-400">*</span>
              </label>

              {frontImage ? (
                <div className="relative rounded-2xl border border-cyan-500/40 overflow-hidden bg-slate-950 p-2">
                  <img
                    src={frontImage}
                    alt="Document Front Preview"
                    className="w-full h-36 object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setFrontImage(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 hover:text-white cursor-pointer"
                    title="Replace image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-4 left-4 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                    Front Captured
                  </span>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-900/30 hover:bg-slate-900/50 transition h-36">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-300 font-medium">Click to upload Front</span>
                  <span className="text-[10px] text-slate-500">JPEG, PNG, WebP up to 8MB</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload(e, 'front')}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Back Image (if requiresBack) */}
            {selectedDocConfig.requiresBack && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-slate-400 block">
                  Document Back Photo <span className="text-rose-400">*</span>
                </label>

                {backImage ? (
                  <div className="relative rounded-2xl border border-cyan-500/40 overflow-hidden bg-slate-950 p-2">
                    <img
                      src={backImage}
                      alt="Document Back Preview"
                      className="w-full h-36 object-contain rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setBackImage(null)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 hover:text-white cursor-pointer"
                      title="Replace image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-4 left-4 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                      Back Captured
                    </span>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-900/30 hover:bg-slate-900/50 transition h-36">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs text-slate-300 font-medium">Click to upload Reverse Side</span>
                    <span className="text-[10px] text-slate-500">Address & registrar stamps</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, 'back')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Informed User Consent Checkbox */}
          <div className="p-4 rounded-2xl bg-[#070B14] border border-slate-800 flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
            />
            <label htmlFor="consent" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
              I provide my voluntary, informed consent to ScamShield AI and its authorized verification registrar to verify the authenticity of this official credential for anti-fraud identity protection. I understand data is encrypted per the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and can be permanently purged at any time.
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            {onSkip ? (
              <button
                type="button"
                onClick={onSkip}
                className="text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                Skip KYC (Continue to Dashboard) &rarr;
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={isSubmitting || !consentGiven || !frontImage}
              className="py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wide transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting to Registrar...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Submit for Verification</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

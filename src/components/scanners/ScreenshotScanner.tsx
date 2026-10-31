import React, { useState, useRef, useEffect } from 'react';
import { analyzeScreenshotApi } from '../../services/api';
import { AnalysisResult } from '../../types';
import { createWorker } from 'tesseract.js';
import {
  UploadCloud,
  FileImage,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  X,
  Eye,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface ScreenshotScannerProps {
  onScanComplete: (result: AnalysisResult, inputSnippet: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
}

export const ScreenshotScanner: React.FC<ScreenshotScannerProps> = ({
  onScanComplete,
  isLoading,
  setIsLoading,
  setError,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [ocrText, setOcrText] = useState<string>('');
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [ocrStatusText, setOcrStatusText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler for quick Ctrl+V screenshot pasting
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processFile = (file: File) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      setError('Please upload a valid image (PNG, JPEG, or WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image exceeds 10MB limit. Please upload a smaller screenshot.');
      return;
    }

    setError(null);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      // Run OCR extraction automatically
      runClientOcr(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const runClientOcr = async (imageUrl: string) => {
    try {
      setOcrStatusText('Initializing Optical Character Recognition (Tesseract)...');
      setOcrProgress(10);

      const worker = await createWorker('eng');
      setOcrProgress(30);
      setOcrStatusText('Recognizing text in screenshot...');

      const ret = await worker.recognize(imageUrl);
      setOcrProgress(90);
      const text = ret.data.text.trim();
      setOcrText(text);

      await worker.terminate();
      setOcrProgress(null);
      setOcrStatusText('');
    } catch (ocrErr) {
      console.warn('Tesseract OCR client error:', ocrErr);
      setOcrProgress(null);
      setOcrStatusText('');
      // Non-fatal, server multimodal will still analyze
    }
  };

  // Generate synthetic sample screenshot for quick testing
  const loadPresetScreenshot = (type: 'job' | 'kyc' | 'invoice') => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark cyber phone card
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1E293B';
    ctx.roundRect(20, 20, 600, 380, 16);
    ctx.fill();

    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 18px sans-serif';

    if (type === 'job') {
      ctx.fillText('WhatsApp Message - Unknown International Number (+44 7911 123456)', 40, 60);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '15px sans-serif';
      ctx.fillText('Hi there! HR Team at Apex Solutions shortlisted your resume.', 40, 100);
      ctx.fillText('Position: Remote Data Reviewer ($350/day guaranteed).', 40, 130);
      ctx.fillText('Requirement: Message our Manager on Telegram @ApexManager_HR', 40, 160);
      ctx.fillStyle = '#F59E0B';
      ctx.fillText('Notice: You must deposit $120 registration fee for onboarding kits.', 40, 200);
      ctx.fillStyle = '#00E5FF';
      ctx.fillText('Pay via USDT or Apple Gift Cards before 6:00 PM today.', 40, 230);
    } else if (type === 'kyc') {
      ctx.fillStyle = '#EF4444';
      ctx.fillText('SMS ALERT - CHASE BANK SECURITY NOTIFICATION', 40, 60);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '15px sans-serif';
      ctx.fillText('WARNING: Unrecognized sign-in attempt detected from IP 45.33.32.156', 40, 100);
      ctx.fillText('Your account and linked debit cards will be FROZEN within 24 hours.', 40, 130);
      ctx.fillText('Verify your identity immediately to prevent full account suspension:', 40, 160);
      ctx.fillStyle = '#38BDF8';
      ctx.fillText('https://chase-online-account-unlock.top/verify?auth=9012', 40, 200);
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('Do not reply to this automated text message.', 40, 240);
    } else {
      ctx.fillStyle = '#38BDF8';
      ctx.fillText('Geek Squad Billing Confirmation - #INV-889410', 40, 60);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '15px sans-serif';
      ctx.fillText('Thank you for renewing your Geek Squad Protection 360 Plan.', 40, 100);
      ctx.fillText('Total Charged: $499.00 USD (Auto-Debited from checking)', 40, 130);
      ctx.fillStyle = '#EF4444';
      ctx.fillText('Did not authorize this charge? Call +1 (888) 492-0193 within 24h.', 40, 170);
      ctx.fillText('Our agent will connect to your computer via AnyDesk for instant refund.', 40, 200);
    }

    const dataUrl = canvas.toDataURL('image/png');
    setImagePreview(dataUrl);
    setMimeType('image/png');
    runClientOcr(dataUrl);
  };

  const handleScan = async () => {
    if (!imagePreview) {
      setError('Please upload, drop, or paste a screenshot first.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await analyzeScreenshotApi(imagePreview, mimeType, ocrText);
      onScanComplete(result, ocrText ? ocrText.slice(0, 120) : 'Screenshot Image');
    } catch (err: any) {
      console.error('Screenshot scan failed:', err);
      setError(err.message || 'Failed to inspect screenshot. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setImagePreview(null);
    setOcrText('');
    setOcrProgress(null);
    setOcrStatusText('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      {!imagePreview ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-[#0B132B]/50 hover:bg-[#0B132B]/90 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition duration-200 mb-4">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition">
            Upload or Drag & Drop Screenshot
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Drag a WhatsApp chat, phishing email, or bank notification image here, or press{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
              Ctrl+V
            </kbd>{' '}
            / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">Cmd+V</kbd> to paste.
          </p>

          <span className="inline-block mt-4 text-[11px] font-mono text-slate-500">
            Supports PNG, JPEG, WebP (up to 10MB)
          </span>
        </div>
      ) : (
        /* Image Preview & OCR Text Editor */
        <div className="space-y-4">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-[#0B132B]">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <FileImage className="w-4 h-4 text-cyan-400" />
                <span>Uploaded Screenshot Preview</span>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            <div className="p-4 flex items-center justify-center bg-slate-950/80 max-h-[300px] overflow-hidden">
              <img
                src={imagePreview}
                alt="Scan target preview"
                className="max-h-[260px] rounded-lg object-contain shadow-lg"
              />
            </div>
          </div>

          {/* OCR Status Progress Bar if running */}
          {ocrProgress !== null && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-300 font-medium">{ocrStatusText}</span>
                <span className="text-cyan-400 font-mono">{ocrProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Extracted Text (Editable for OCR adjustments) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Extracted Text (OCR Context)</span>
              </label>
              <span className="text-[11px] text-slate-500">Review & edit text before scanning</span>
            </div>

            <textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              placeholder="OCR text will appear here automatically, or you can type/edit key text from the screenshot..."
              rows={4}
              className="w-full rounded-xl border border-slate-800 bg-[#0B132B]/80 p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleScan}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Visuals & Forensics...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Run Multimodal Threat Scan</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Preset Test Screenshots */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Or Load a Sample Screenshot:</span>
          </span>
          <span className="text-[11px] text-slate-500">Test visual forensics instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => loadPresetScreenshot('job')}
            className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 text-left transition group cursor-pointer"
          >
            <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 inline-block mb-1">
              WhatsApp
            </div>
            <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
              Fake Job Offer Screenshot
            </div>
          </button>

          <button
            type="button"
            onClick={() => loadPresetScreenshot('kyc')}
            className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 text-left transition group cursor-pointer"
          >
            <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-rose-400 inline-block mb-1">
              SMS Phish
            </div>
            <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
              Bank KYC Suspension SMS
            </div>
          </button>

          <button
            type="button"
            onClick={() => loadPresetScreenshot('invoice')}
            className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 text-left transition group cursor-pointer"
          >
            <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 inline-block mb-1">
              Invoice
            </div>
            <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
              Geek Squad $499 Bill
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

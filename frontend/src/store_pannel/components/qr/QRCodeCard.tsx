import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Eye,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { QRConfig, QRTemplateOption } from '../../types/qr.types';
import { qrTemplatesList } from '../../data/qrData';

interface QRCodeCardProps {
  config: QRConfig;
  onOpenPreview: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onTestQR: () => void;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  config,
  onOpenPreview,
  onDownload,
  onPrint,
  onTestQR
}) => {
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const activeTemplate: QRTemplateOption =
    qrTemplatesList.find((t) => t.id === config.template) || qrTemplatesList[0];

  useEffect(() => {
    // Generate high-resolution SVG string for the QR code
    const fg =
      config.template === 'dark'
        ? activeTemplate.fgColor
        : config.primaryColor || activeTemplate.fgColor;
    const bg = activeTemplate.bgColor;

    QRCode.toString(
      config.storeUrl,
      {
        type: 'svg',
        margin: 2,
        color: {
          dark: fg,
          light: bg
        },
        errorCorrectionLevel: 'H' // High error correction to allow center icon badge
      },
      (err, string) => {
        if (!err && string) {
          setQrSvg(string);
        }
      }
    );
  }, [config.storeUrl, config.template, config.primaryColor, activeTemplate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(config.storeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Your Store QR Code
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Live QR
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Customers scan this QR to upload and print
          </p>
        </div>

        {/* QR Code Card Display */}
        <div className="flex flex-col items-center justify-center py-6">
          <motion.div
            layout
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            id="store-qr-code-element"
            className={`relative p-5 rounded-2xl shadow-sm border transition-all duration-200 ${
              config.template === 'dark'
                ? 'bg-[#0F172A] border-slate-800 text-white'
                : 'bg-white border-slate-200/80 text-slate-900'
            }`}
          >
            {/* Real Dynamic QR Code */}
            <div className="w-56 h-56 relative flex items-center justify-center">
              {qrSvg ? (
                <div
                  className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Generating QR...
                </div>
              )}

              {/* Central Logo Emblem Badge */}
              <div
                className="absolute inset-0 m-auto w-12 h-12 rounded-xl flex items-center justify-center shadow-md border-2 border-white pointer-events-none"
                style={{
                  backgroundColor: config.primaryColor || '#4F46E5'
                }}
              >
                {config.logoUrl ? (
                  <img
                    src={config.logoUrl}
                    alt="Store Logo"
                    className="w-8 h-8 rounded-lg object-contain"
                  />
                ) : (
                  <div className="text-white flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6"
                    >
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                      <rect x="6" y="14" width="12" height="8" rx="1" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Preview Button */}
          <button
            onClick={onOpenPreview}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        {/* Download QR (Solid Purple) */}
        <button
          onClick={onDownload}
          className="w-full py-2.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 active:scale-[0.99]"
        >
          <Download className="w-4 h-4" />
          <span>Download QR</span>
        </button>

        {/* Print QR (White Outline) */}
        <button
          onClick={onPrint}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Print QR</span>
        </button>

        {/* Copy & Test Row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleCopyLink}
            className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={onTestQR}
            className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Test QR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

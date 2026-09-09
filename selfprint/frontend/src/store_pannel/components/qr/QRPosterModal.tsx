import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import {
  X,
  Printer,
  FileImage,
  FileText,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRConfig, ExportFormat } from '../../types/qr.types';
import { qrTemplatesList } from '../../data/qrData';

interface QRPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: QRConfig;
}

export const QRPosterModal: React.FC<QRPosterModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [qrSvg, setQrSvg] = useState<string>('');
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const activeTemplate =
    qrTemplatesList.find((t) => t.id === config.template) || qrTemplatesList[0];

  useEffect(() => {
    if (!isOpen) return;

    const fg =
      config.template === 'dark'
        ? activeTemplate.fgColor
        : config.primaryColor || activeTemplate.fgColor;
    const bg = activeTemplate.bgColor;

    QRCode.toString(
      config.storeUrl,
      {
        type: 'svg',
        margin: 1,
        color: {
          dark: fg,
          light: bg
        },
        errorCorrectionLevel: 'H'
      },
      (err, string) => {
        if (!err && string) {
          setQrSvg(string);
        }
      }
    );
  }, [isOpen, config.storeUrl, config.template, config.primaryColor, activeTemplate]);

  if (!isOpen) return null;

  const handleDownload = async (format: ExportFormat) => {
    if (!posterRef.current) return;
    setIsExporting(format);

    try {
      const fileName = `selfprint-poster-${config.storeId.toLowerCase()}.${format}`;
      const element = posterRef.current;

      if (format === 'png') {
        const dataUrl = await toPng(element, { quality: 0.98, pixelRatio: 3 });
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      } else if (format === 'jpg') {
        const dataUrl = await toJpeg(element, { quality: 0.95, pixelRatio: 3 });
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      } else if (format === 'svg') {
        const dataUrl = await toSvg(element);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      } else if (format === 'pdf') {
        const dataUrl = await toPng(element, { quality: 0.98, pixelRatio: 3 });
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        const imgWidth = 210;
        const imgHeight = 297;
        pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`selfprint-standee-${config.storeId.toLowerCase()}.pdf`);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to generate export file. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(config.storeUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
        />

        {/* Modal Dialog Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden z-10"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Store QR Standee Poster Preview
                </h3>
                <p className="text-xs text-slate-500">
                  Ready-to-print A4 Standee & Poster for your shop counter
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body - Split between Preview and Action Controls */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Center Poster Canvas Preview (A4 Ratio Standee) */}
            <div className="lg:col-span-7 flex justify-center">
              <div
                ref={posterRef}
                className="w-full max-w-[380px] bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 flex flex-col justify-between aspect-[1/1.414] text-center relative overflow-hidden select-none"
                style={{
                  background:
                    config.template === 'dark'
                      ? 'linear-gradient(180deg, #0F172A 0%, #020617 100%)'
                      : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                  color: config.template === 'dark' ? '#F8FAFC' : '#0F172A'
                }}
              >
                {/* Decorative Top Accent Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-2.5"
                  style={{
                    backgroundColor: config.primaryColor || '#4F46E5'
                  }}
                />

                {/* Poster Header */}
                <div className="pt-2">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                      style={{
                        backgroundColor: config.primaryColor || '#4F46E5'
                      }}
                    >
                      {config.logoUrl ? (
                        <img
                          src={config.logoUrl}
                          alt="Store Logo"
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <Printer className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-extrabold text-sm tracking-tight">
                      SELF PRINT
                    </span>
                  </div>

                  <h2 className="text-lg font-black tracking-tight mt-1">
                    {config.storeName}
                  </h2>
                  <p className="text-[11px] opacity-70 font-medium">
                    {config.storeLocation}
                  </p>

                  <div className="mt-3 inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Scan &amp; Print Instantly
                  </div>
                </div>

                {/* Center QR Code Container */}
                <div className="my-3 flex flex-col items-center">
                  <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200/80 relative">
                    <div className="w-44 h-44 relative flex items-center justify-center">
                      {qrSvg ? (
                        <div
                          className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: qrSvg }}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 animate-pulse rounded" />
                      )}

                      {/* Center Emblem */}
                      <div
                        className="absolute inset-0 m-auto w-10 h-10 rounded-xl flex items-center justify-center shadow-md border-2 border-white pointer-events-none text-white"
                        style={{
                          backgroundColor: config.primaryColor || '#4F46E5'
                        }}
                      >
                        <Printer className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] mt-2.5 max-w-[260px] opacity-80 leading-snug">
                    {config.welcomeMessage}
                  </p>
                </div>

                {/* 4 Steps Instruction Row */}
                <div className="grid grid-cols-4 gap-1.5 py-2 border-t border-b border-slate-200/60 my-1 text-[10px]">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-1">
                      1
                    </div>
                    <span className="font-bold">Scan</span>
                    <span className="text-[9px] opacity-60">Any camera</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-1">
                      2
                    </div>
                    <span className="font-bold">Upload</span>
                    <span className="text-[9px] opacity-60">PDF &amp; Docs</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-1">
                      3
                    </div>
                    <span className="font-bold">Pay</span>
                    <span className="text-[9px] opacity-60">UPI / Cards</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-1">
                      4
                    </div>
                    <span className="font-bold">Collect</span>
                    <span className="text-[9px] opacity-60">Get prints</span>
                  </div>
                </div>

                {/* Poster Footer */}
                <div className="pt-2 flex items-center justify-between text-[10px] opacity-70">
                  <span>Powered by selfprint.app</span>
                  <span className="font-mono font-bold">ID: {config.storeId}</span>
                </div>
              </div>
            </div>

            {/* Right Export Options & Printing Controls */}
            <div className="lg:col-span-5 space-y-4">
              {/* Quick Actions Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  Export Poster & Standee
                </h4>
                <p className="text-xs text-slate-500">
                  Download high-resolution 300 DPI graphics ready for desktop printing or professional acrylic standee fabrication.
                </p>

                {/* Download Grid Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleDownload('png')}
                    disabled={isExporting !== null}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <FileImage className="w-4 h-4 text-indigo-600" />
                    <span>{isExporting === 'png' ? 'Saving...' : 'PNG Image'}</span>
                  </button>

                  <button
                    onClick={() => handleDownload('jpg')}
                    disabled={isExporting !== null}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <FileImage className="w-4 h-4 text-emerald-600" />
                    <span>{isExporting === 'jpg' ? 'Saving...' : 'JPG Image'}</span>
                  </button>

                  <button
                    onClick={() => handleDownload('svg')}
                    disabled={isExporting !== null}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>{isExporting === 'svg' ? 'Saving...' : 'Vector SVG'}</span>
                  </button>

                  <button
                    onClick={() => handleDownload('pdf')}
                    disabled={isExporting !== null}
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isExporting === 'pdf' ? 'Creating...' : 'PDF (A4)'}</span>
                  </button>
                </div>

                <button
                  onClick={handlePrint}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Directly from Browser</span>
                </button>
              </div>

              {/* Store URL & Copy */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Store Upload Link
                </span>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
                  <span className="truncate flex-1 text-slate-700">
                    {config.storeUrl}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition-colors flex items-center gap-1 shrink-0"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Printing Tips Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1.5 text-slate-700">
                <span className="font-bold text-indigo-900 block">
                  💡 Printing Recommendations:
                </span>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                  <li>Print at 300 DPI for ultra-crisp camera scanning.</li>
                  <li>Do not crop or distort the white quiet zone around the QR.</li>
                  <li>Laminate acrylic standee for durability in high-traffic stores.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

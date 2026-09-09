import React, { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';
import { Download, Upload, Printer, Info } from 'lucide-react';

interface StoreBrandingCardProps {
  storeName?: string;
  storeLocation?: string;
  storeId?: string;
  onOpenQRStandeeModal?: () => void;
}

export const StoreBrandingCard: React.FC<StoreBrandingCardProps> = ({
  storeId = 'SP10239'
}) => {
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [logoUploaded, setLogoUploaded] = useState(false);
  const storeUrl = `https://selfprint.app/store/${storeId}`;

  useEffect(() => {
    QRCodeLib.toString(
      storeUrl,
      {
        type: 'svg',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      },
      (err, svg) => {
        if (!err && svg) {
          setQrSvgString(svg);
        }
      }
    );
  }, [storeUrl]);

  const handleDownloadQR = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Store_QR_${storeId}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLogoUpload = () => {
    setLogoUploaded(true);
    setTimeout(() => setLogoUploaded(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Store Branding &amp; QR
        </h2>
        <p className="text-xs text-slate-500 font-normal mt-0.5 pb-4 border-b border-slate-100">
          Your store logo and QR code for customers
        </p>

        {/* Two Boxes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {/* Box 1: Store Logo Dropzone */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">
              Store Logo
            </span>
            <div
              onClick={handleLogoUpload}
              className="h-44 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2 group-hover:scale-105 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{logoUploaded ? 'Logo Uploaded!' : 'Click to upload'}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG up to 1MB
              </p>
            </div>
          </div>

          {/* Box 2: Store QR Code Preview */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">
              Store QR Code
            </span>
            <div className="h-44 rounded-2xl border border-slate-200 bg-white p-3 flex items-center justify-center relative shadow-sm">
              {qrSvgString ? (
                <div className="w-36 h-36 relative flex items-center justify-center">
                  <div
                    className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: qrSvgString }}
                  />
                  {/* Center emblem */}
                  <div className="absolute inset-0 m-auto w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md border-2 border-white pointer-events-none">
                    <Printer className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 bg-slate-100 animate-pulse rounded-xl" />
              )}
            </div>
          </div>
        </div>

        {/* Action Button: Download QR */}
        <button
          onClick={handleDownloadQR}
          className="w-full mt-4 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Download QR</span>
        </button>
      </div>

      {/* Tip Banner */}
      <div className="mt-4 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
        <span>
          <strong>Tip:</strong> Print this QR code and place it at your store
          for customers to scan and print.
        </span>
      </div>
    </div>
  );
};

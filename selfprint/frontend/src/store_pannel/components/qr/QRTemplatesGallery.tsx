import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { QRTemplateType, QRTemplateOption } from '../../types/qr.types';
import { qrTemplatesList } from '../../data/qrData';

interface QRTemplatesGalleryProps {
  selectedTemplate: QRTemplateType;
  onSelectTemplate: (templateId: QRTemplateType) => void;
  storeUrl: string;
}

export const QRTemplatesGallery: React.FC<QRTemplatesGalleryProps> = ({
  selectedTemplate,
  onSelectTemplate
}) => {
  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          QR Code Templates
        </h2>
        <p className="text-xs text-slate-500 font-normal mt-0.5">
          Choose from pre-designed templates
        </p>
      </div>

      {/* Grid of 6 Templates */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-5">
        {qrTemplatesList.map((tmpl: QRTemplateOption) => {
          const isSelected = selectedTemplate === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className="flex flex-col items-center cursor-pointer group"
            >
              {/* Template Card Container */}
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative w-full aspect-square p-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                  tmpl.id === 'dark' ? 'bg-[#0B1120]' : 'bg-white'
                } ${
                  isSelected
                    ? 'border-2 border-indigo-600 shadow-md shadow-indigo-600/10 ring-2 ring-indigo-500/20'
                    : 'border border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Active Checkmark Pill */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* SVG Visual Representation of Template */}
                <div className="w-20 h-20 relative flex items-center justify-center">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    fill={tmpl.fgColor}
                  >
                    {/* Corner Finders */}
                    {tmpl.id === 'rounded' ? (
                      <>
                        <rect x="8" y="8" width="26" height="26" rx="8" fill={tmpl.primaryColor} />
                        <rect x="13" y="13" width="16" height="16" rx="4" fill={tmpl.bgColor} />
                        <rect x="17" y="17" width="8" height="8" rx="2" fill={tmpl.primaryColor} />

                        <rect x="66" y="8" width="26" height="26" rx="8" fill={tmpl.primaryColor} />
                        <rect x="71" y="13" width="16" height="16" rx="4" fill={tmpl.bgColor} />
                        <rect x="75" y="17" width="8" height="8" rx="2" fill={tmpl.primaryColor} />

                        <rect x="8" y="66" width="26" height="26" rx="8" fill={tmpl.primaryColor} />
                        <rect x="13" y="71" width="16" height="16" rx="4" fill={tmpl.bgColor} />
                        <rect x="17" y="75" width="8" height="8" rx="2" fill={tmpl.primaryColor} />
                      </>
                    ) : tmpl.id === 'minimal' ? (
                      <>
                        <rect x="8" y="8" width="26" height="26" fill="none" stroke={tmpl.fgColor} strokeWidth="2" />
                        <rect x="15" y="15" width="12" height="12" fill={tmpl.fgColor} />

                        <rect x="66" y="8" width="26" height="26" fill="none" stroke={tmpl.fgColor} strokeWidth="2" />
                        <rect x="73" y="15" width="12" height="12" fill={tmpl.fgColor} />

                        <rect x="8" y="66" width="26" height="26" fill="none" stroke={tmpl.fgColor} strokeWidth="2" />
                        <rect x="15" y="73" width="12" height="12" fill={tmpl.fgColor} />
                      </>
                    ) : tmpl.id === 'colorful' ? (
                      <>
                        <rect x="8" y="8" width="26" height="26" rx="4" fill="#3B82F6" />
                        <rect x="13" y="13" width="16" height="16" rx="2" fill="#FFFFFF" />
                        <rect x="17" y="17" width="8" height="8" rx="1" fill="#8B5CF6" />

                        <rect x="66" y="8" width="26" height="26" rx="4" fill="#EC4899" />
                        <rect x="71" y="13" width="16" height="16" rx="2" fill="#FFFFFF" />
                        <rect x="75" y="17" width="8" height="8" rx="1" fill="#EC4899" />

                        <rect x="8" y="66" width="26" height="26" rx="4" fill="#8B5CF6" />
                        <rect x="13" y="71" width="16" height="16" rx="2" fill="#FFFFFF" />
                        <rect x="17" y="75" width="8" height="8" rx="1" fill="#3B82F6" />
                      </>
                    ) : (
                      <>
                        <rect x="8" y="8" width="26" height="26" rx="2" fill={tmpl.primaryColor} />
                        <rect x="13" y="13" width="16" height="16" rx="1" fill={tmpl.bgColor} />
                        <rect x="17" y="17" width="8" height="8" rx="1" fill={tmpl.primaryColor} />

                        <rect x="66" y="8" width="26" height="26" rx="2" fill={tmpl.primaryColor} />
                        <rect x="71" y="13" width="16" height="16" rx="1" fill={tmpl.bgColor} />
                        <rect x="75" y="17" width="8" height="8" rx="1" fill={tmpl.primaryColor} />

                        <rect x="8" y="66" width="26" height="26" rx="2" fill={tmpl.primaryColor} />
                        <rect x="13" y="71" width="16" height="16" rx="1" fill={tmpl.bgColor} />
                        <rect x="17" y="75" width="8" height="8" rx="1" fill={tmpl.primaryColor} />
                      </>
                    )}

                    {/* Data Matrix Dots Pattern */}
                    <circle cx="42" cy="15" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="52" cy="15" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="42" cy="25" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="55" cy="25" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="15" cy="45" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="25" cy="45" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="42" cy="45" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="55" cy="45" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="75" cy="45" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="85" cy="45" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="45" cy="65" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="55" cy="65" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="75" cy="65" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="85" cy="75" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="45" cy="85" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="55" cy="85" r="2.5" fill={tmpl.fgColor} />
                    <circle cx="75" cy="85" r="2.5" fill={tmpl.fgColor} />

                    {/* Center Icon Emblem */}
                    <rect
                      x="40"
                      y="40"
                      width="20"
                      height="20"
                      rx="4"
                      fill={tmpl.primaryColor}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <path
                      d="M45 52 H55 M46 47 H54 M46 54 H54"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </motion.div>

              {/* Template Label */}
              <span
                className={`text-xs font-semibold mt-2.5 transition-colors ${
                  isSelected
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-600 group-hover:text-slate-900'
                }`}
              >
                {tmpl.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

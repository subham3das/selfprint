import React from 'react';
import { X, Check, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrintPaperSize } from '../types/userPrint.types';

interface PaperSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize: PrintPaperSize;
  onSelect: (size: PrintPaperSize) => void;
}

export const PaperSizeModal: React.FC<PaperSizeModalProps> = ({
  isOpen,
  onClose,
  selectedSize,
  onSelect
}) => {
  if (!isOpen) return null;

  const sizes: { id: PrintPaperSize; name: string; dims: string; desc: string }[] = [
    {
      id: 'A4',
      name: 'A4 (Standard)',
      dims: '210 × 297 mm',
      desc: 'Standard paper for documents, reports & notes'
    },
    {
      id: 'A3',
      name: 'A3 (Large Poster)',
      dims: '297 × 420 mm',
      desc: 'Large architectural drawings & posters'
    },
    {
      id: 'Letter',
      name: 'US Letter',
      dims: '216 × 279 mm',
      desc: 'Standard North American format'
    },
    {
      id: 'Legal',
      name: 'Legal Document',
      dims: '216 × 356 mm',
      desc: 'Extended length for contracts & agreements'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <File className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Select Paper Size
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-2 text-xs">
            {sizes.map((s) => {
              const isSelected = selectedSize === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelect(s.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {s.dims} &bull; {s.desc}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

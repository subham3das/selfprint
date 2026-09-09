import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Layers, AlertCircle } from 'lucide-react';
import { UploadedFileInfo } from '../types/userPrint.types';
import { usePdfThumbnailGenerator } from '../hooks/usePdfThumbnailGenerator';

interface PdfPageThumbnailGalleryProps {
  file: UploadedFileInfo | null;
  selectedPages: number[];
  onTogglePage: (pageNum: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSelectOdd: () => void;
  onSelectEven: () => void;
  onReverseSelection: () => void;
}

export const PdfPageThumbnailGallery: React.FC<PdfPageThumbnailGalleryProps> = ({
  file,
  selectedPages,
  onTogglePage,
  onSelectAll,
  onClearAll,
  onSelectOdd,
  onSelectEven,
  onReverseSelection
}) => {
  const { thumbnails } = usePdfThumbnailGenerator(file);
  const totalPages = file?.totalPages || 12;
  const pageList = Array.from({ length: totalPages }, (_, i) => i + 1);
  const selectedSet = new Set(selectedPages);

  if (!file) return null;

  return (
    <div className="w-full pt-3 space-y-3 select-none">
      {/* Header & Live Summary Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Select Pages to Print
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Tap any page thumbnail to toggle
            </p>
          </div>
        </div>

        {/* Selected Counter Badge */}
        <div className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-600 font-mono shrink-0">
          Selected: {selectedPages.length} of {totalPages}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
        <button
          onClick={onSelectAll}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-semibold border border-slate-200/60 transition-colors whitespace-nowrap active:scale-95 shadow-2xs"
        >
          Select All
        </button>
        <button
          onClick={onClearAll}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold border border-slate-200/60 transition-colors whitespace-nowrap active:scale-95 shadow-2xs"
        >
          Clear All
        </button>
        <button
          onClick={onSelectOdd}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-semibold border border-slate-200/60 transition-colors whitespace-nowrap active:scale-95 shadow-2xs"
        >
          Odd Pages
        </button>
        <button
          onClick={onSelectEven}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-semibold border border-slate-200/60 transition-colors whitespace-nowrap active:scale-95 shadow-2xs"
        >
          Even Pages
        </button>
        <button
          onClick={onReverseSelection}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-semibold border border-slate-200/60 transition-colors whitespace-nowrap active:scale-95 shadow-2xs"
        >
          Invert
        </button>
      </div>

      {/* Horizontal Thumbnail Gallery Carousel */}
      <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory py-2 px-1 scroll-smooth no-scrollbar">
        {pageList.map((pageNum) => {
          const isSelected = selectedSet.has(pageNum);
          const thumbUrl = thumbnails[pageNum];

          return (
            <motion.div
              key={pageNum}
              whileTap={{ scale: 0.96 }}
              onClick={() => onTogglePage(pageNum)}
              className={`relative snap-start shrink-0 w-24 sm:w-28 aspect-[3/4] rounded-2xl cursor-pointer overflow-hidden transition-all duration-200 ${
                isSelected
                  ? 'border-2 border-indigo-600 ring-2 ring-indigo-500/20 shadow-md scale-[1.02] bg-white'
                  : 'border border-slate-200/80 opacity-60 hover:opacity-100 bg-slate-50'
              }`}
            >
              {/* Top-Right Circular Checkbox */}
              <div className="absolute top-2 right-2 z-10">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white/90 border border-slate-300 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              {/* Page Thumbnail Preview */}
              <div className="w-full h-full flex items-center justify-center bg-white p-1">
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={`Page ${pageNum}`}
                    className="w-full h-full object-contain rounded-xl"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" />
                )}
              </div>

              {/* Bottom Page Number Badge */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-tight shadow-xs ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/80 text-slate-200'
                  }`}
                >
                  Page {pageNum}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State Alert */}
      <AnimatePresence>
        {selectedPages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2 text-xs"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Please select at least one page to print.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

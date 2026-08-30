import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Palette,
  FileText,
  Check
} from 'lucide-react';
import {
  UploadedFileInfo,
  PagePrintConfig,
  StoreKioskInfo
} from '../types/userPrint.types';
import { usePdfThumbnailGenerator } from '../hooks/usePdfThumbnailGenerator';

export interface PageState {
  page: number;
  selected: boolean; // true if Color (ticked), false if B&W (unticked)
  mode: 'bw' | 'color';
}

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: UploadedFileInfo | null;
  store: StoreKioskInfo;
  initialPageConfigs?: Record<number, PagePrintConfig>;
  initialCopies: number;
  onApply: (
    updatedConfigs: Record<number, PagePrintConfig>,
    updatedCopies: number
  ) => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  initialPageConfigs,
  initialCopies,
  onApply
}) => {
  const { thumbnails } = usePdfThumbnailGenerator(file);
  const totalPages = file?.totalPages || 12;

  // Currently viewed page (1-indexed)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingByButtonRef = useRef<boolean>(false);

  // Complete reactive state array: pages = [{ page: 1, selected: true, mode: "color" }, ...]
  const [pages, setPages] = useState<PageState[]>([]);

  const prevIsOpenRef = useRef<boolean>(false);

  // Initialize fresh from initialPageConfigs ONLY when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setCurrentPage(1);

      const initialPagesList: PageState[] = Array.from(
        { length: totalPages },
        (_, i) => {
          const pageNum = i + 1;
          const savedMode = initialPageConfigs?.[pageNum]?.mode || 'bw';
          const isColor = savedMode === 'color';
          return {
            page: pageNum,
            selected: isColor, // Ticked if Color, unticked if B&W
            mode: savedMode
          };
        }
      );
      setPages(initialPagesList);

      // Smooth scroll to page 1 on initial open
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = 0;
        }
      }, 50);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, totalPages, initialPageConfigs]);


  // Sync to parent helper
  const syncToParent = useCallback(
    (currentPagesList: PageState[]) => {
      const updatedConfigs: Record<number, PagePrintConfig> = {};
      currentPagesList.forEach((p) => {
        updatedConfigs[p.page] = {
          pageNum: p.page,
          mode: p.mode,
          isSelected: true
        };
      });
      onApply(updatedConfigs, initialCopies || 1);
    },
    [initialCopies, onApply]
  );

  // Count color pages
  const colorCount = pages.filter((p) => p.mode === 'color').length;

  // Toggle Page Color / Tick:
  // Click on a Color page (ticked) -> tick disappears, becomes B&W
  // Click on a B&W page (unticked) -> tick appears, becomes Color
  const handleTogglePageColor = (pageNum: number) => {
    setPages((prev) => {
      const updated = prev.map((item) => {
        if (item.page === pageNum) {
          const nextIsColor = item.mode !== 'color';
          return {
            ...item,
            mode: nextIsColor ? ('color' as const) : ('bw' as const),
            selected: nextIsColor
          };
        }
        return item;
      });
      syncToParent(updated);
      return updated;
    });
  };

  // Apply Color Mode: saves selected Color pages (unticked stay B&W by default) and closes modal
  const handleApplyColor = () => {
    setPages((prev) => {
      const hasColor = prev.some((p) => p.mode === 'color');
      const updated = hasColor
        ? prev
        : prev.map((item) =>
            item.page === currentPage
              ? { ...item, mode: 'color' as const, selected: true }
              : item
          );
      syncToParent(updated);
      return updated;
    });
    onClose();
  };


  // Smooth scroll to a specific page
  const scrollToPage = useCallback((pageNum: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isScrollingByButtonRef.current = true;
    const targetLeft = (pageNum - 1) * el.clientWidth;
    el.scrollTo({
      left: targetLeft,
      behavior: 'smooth'
    });
    setCurrentPage(pageNum);
    setTimeout(() => {
      isScrollingByButtonRef.current = false;
    }, 350);
  }, []);

  // Listen to native snap scroll
  const handleScroll = () => {
    if (isScrollingByButtonRef.current) return;
    const el = scrollContainerRef.current;
    if (!el || el.clientWidth === 0) return;

    const pageIndex = Math.round(el.scrollLeft / el.clientWidth) + 1;
    if (pageIndex >= 1 && pageIndex <= totalPages && pageIndex !== currentPage) {
      setCurrentPage(pageIndex);
    }
  };

  // Navigation Buttons
  const handlePrevPage = () => {
    if (currentPage > 1) {
      scrollToPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      scrollToPage(currentPage + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevPage();
      if (e.key === 'ArrowRight') handleNextPage();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, totalPages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative w-full max-w-2xl h-[94vh] sm:h-[90vh] bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden border border-slate-200/80 z-10"
          >
            {/* TOP: PDF Information Bar */}
            <div className="w-full px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                    {file?.name || 'Document.pdf'}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    {file?.formattedSize || '1.2 MB'} &bull; {totalPages} Pages
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors active:scale-95 shrink-0 cursor-pointer"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Note: Select pages for Color print */}
            <div className="w-full px-4 py-2 bg-indigo-50/80 border-b border-indigo-100/60 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-indigo-900 font-medium shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 animate-pulse" />
              <span>Select pages you want to <strong>Color Print</strong> (other pages remain Black & White)</span>
            </div>

            {/* CENTER: Main Document Reading View (Fluid Native Snap Carousel) */}
            <div className="flex-1 w-full bg-[#F8FAFC] flex flex-col items-center justify-between p-3 sm:p-5 overflow-hidden relative">

              {/* Native Snap Carousel Track */}
              <div className="relative flex-1 w-full max-w-md flex items-center justify-center overflow-hidden my-auto py-1">
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar overscroll-x-contain scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {pages.map((p) => {
                    const thumbUrl = thumbnails[p.page];
                    const isColor = p.mode === 'color'; // Tick is present when Color

                    return (
                      <div
                        key={p.page}
                        className="w-full shrink-0 h-full snap-center flex items-center justify-center p-1.5"
                      >
                        <div
                          onClick={() => handleTogglePageColor(p.page)}
                          className={`relative w-full aspect-[1/1.414] max-h-[64vh] sm:max-h-[66vh] bg-white rounded-2xl sm:rounded-3xl shadow-xl flex flex-col items-center justify-between p-3 sm:p-4 cursor-pointer transition-all duration-200 ${
                            isColor
                              ? 'border-2 border-indigo-600 ring-4 ring-indigo-500/15 shadow-indigo-500/15 scale-[1.01]'
                              : 'border-2 border-slate-200 shadow-slate-400/10'
                          }`}
                        >
                          {/* Top Badges & Selection Checkbox */}
                          <div className="w-full flex items-center justify-between z-10 pointer-events-auto">
                            {/* Mode Badge */}
                            <span
                              className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs transition-colors ${
                                isColor
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {isColor ? (
                                <>
                                  <Palette className="w-3 h-3 text-purple-600" />
                                  <span>Color</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                                  <span>B&W</span>
                                </>
                              )}
                            </span>

                            {/* Top-Right Circular Selection Button (Tick represents Color) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePageColor(p.page);
                              }}
                              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                                isColor
                                  ? 'bg-indigo-600 text-white scale-110 shadow-indigo-600/30'
                                  : 'bg-white border-2 border-slate-300 text-transparent hover:border-indigo-400'
                              }`}
                              aria-label={`Toggle color for page ${p.page}`}
                            >
                              {isColor && (
                                <Check className="w-4 h-4 stroke-[3]" />
                              )}
                            </button>
                          </div>

                          {/* Preloaded Document Canvas Image */}
                          <div className="flex-1 w-full flex items-center justify-center p-1 overflow-hidden my-auto pointer-events-none select-none">
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt={`Page ${p.page}`}
                                draggable={false}
                                className="w-full h-full object-contain rounded-lg drop-shadow-xs pointer-events-none select-none"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
                                Rendering Page {p.page}...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Horizontal Navigation (< Previous • Page X of Y • Next >) */}
              <div className="flex items-center justify-center gap-3 shrink-0 pt-1">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="font-mono font-bold text-xs text-slate-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-xs">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* BOTTOM TOOLBAR: Only Single Large Color Print Button */}
            <div className="w-full bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 sm:px-6 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] flex items-center justify-center shrink-0 shadow-lg">
              {/* Single Primary Button: Color Print */}
              <button
                type="button"
                onClick={handleApplyColor}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Palette className="w-4 h-4" />
                <span>Color Print</span>
                {colorCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-mono text-white">
                    {colorCount}
                  </span>
                )}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

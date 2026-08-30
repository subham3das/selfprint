import React, { useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrinterFramePlayer } from '../components/progress/PrinterFramePlayer';
import { PrintProgressCard } from '../components/progress/PrintProgressCard';
import { PrintTimelineCard } from '../components/progress/PrintTimelineCard';
import { PrintJobDetailsCard } from '../components/progress/PrintJobDetailsCard';
import { PrintSuccessView } from '../components/progress/PrintSuccessView';
import { mockStoreKioskInfo } from '../data/userMockData';

export const UserProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId } = useParams<{ storeId?: string }>();

  // Extract navigation state if passed from upload page, else use realistic mock data
  const passedState = location.state as
    | {
        fileName?: string;
        pages?: number;
        copies?: number;
        paperSize?: string;
        colorMode?: string;
        totalPaid?: number;
        jobCode?: string;
      }
    | undefined;

  const fileName = passedState?.fileName || 'Notes.pdf';
  const pagesPerCopy = passedState?.pages || 18;
  const totalCopies = passedState?.copies || 2;
  const totalBillablePages = pagesPerCopy * totalCopies;
  const paperSize = passedState?.paperSize || 'A4';
  const colorMode = passedState?.colorMode || 'Black & White';
  const totalPaid = passedState?.totalPaid || 36.0;
  const jobCode = passedState?.jobCode || 'SP-10239-082';

  const storeInfo = {
    ...mockStoreKioskInfo,
    storeId: storeId || mockStoreKioskInfo.storeId
  };

  // Synchronized Print Progress State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const cycleDurationMs = 2400; // 2.4 seconds per page cycle (300 frames)

  // Current copy number calculation
  const currentCopy = Math.min(
    totalCopies,
    Math.floor((currentPage - 1) / pagesPerCopy) + 1
  );
  const pageInCurrentCopy = ((currentPage - 1) % pagesPerCopy) + 1;

  // Percentage & Estimated Time
  const percent = Math.min(
    100,
    Math.round(((currentPage - 1) / totalBillablePages) * 100) +
      Math.round((1 / totalBillablePages) * 50)
  );
  const secondsRemaining = Math.max(
    0,
    Math.round((totalBillablePages - currentPage + 1) * (cycleDurationMs / 1000))
  );

  // Callback when a 300-frame page cycle completes
  const handlePageCycleFinished = useCallback(
    (finishedPage: number) => {
      if (finishedPage < totalBillablePages) {
        setCurrentPage(finishedPage + 1);
      } else {
        setCurrentPage(totalBillablePages);
      }
    },
    [totalBillablePages]
  );

  // Callback when all pages are finished (after 500ms delay on frame 300)
  const handleAllPagesFinished = useCallback(() => {
    setIsCompleted(true);
  }, []);

  const handlePrintMore = () => {
    navigate(`/store/${storeInfo.storeId}`);
  };

  return (
    <div className="h-[100dvh] w-full bg-[#F8FAFC] flex flex-col justify-center items-center font-sans antialiased text-slate-900 overflow-hidden md:p-4">
      {/* Mobile-first Container */}
      <div className="w-full max-w-md bg-white md:rounded-[32px] md:border md:border-slate-200/80 md:shadow-2xl md:shadow-indigo-500/5 h-full md:h-[92vh] md:max-h-[880px] flex flex-col relative overflow-hidden">
        {/* Header Store Pill */}
        <header className="w-full pt-3 px-4 sm:px-6 pb-2 flex items-center justify-between select-none shrink-0 border-b border-slate-100/80 bg-white/90 backdrop-blur-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-slate-900 leading-tight truncate">
                {storeInfo.storeName}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {storeInfo.branchName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-[10px] sm:text-[11px] font-bold text-emerald-600 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Printer Online</span>
          </div>
        </header>

        {/* Dynamic Scrollable Body Content */}
        <div className="flex-1 w-full px-4 sm:px-6 py-4 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait">
            {!isCompleted ? (
              <motion.div
                key="printing-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Status Title */}
                <div className="text-center space-y-1 pt-1">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Printing Your Documents...
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Printing Page {currentPage} of {totalBillablePages}
                  </p>
                </div>

                {/* Synchronized 300-Frame Loop Printer Player */}
                <PrinterFramePlayer
                  totalPages={totalBillablePages}
                  currentPage={currentPage}
                  isPrinting={!isCompleted}
                  onPageCycleFinished={handlePageCycleFinished}
                  onAllPagesFinished={handleAllPagesFinished}
                  cycleDurationMs={cycleDurationMs}
                />

                {/* Progress Bar & Page Counter Card */}
                <PrintProgressCard
                  fileName={fileName}
                  currentPage={pageInCurrentCopy}
                  totalPages={pagesPerCopy}
                  currentCopy={currentCopy}
                  totalCopies={totalCopies}
                  percent={percent}
                  secondsRemaining={secondsRemaining}
                />

                {/* Print Lifecycle Timeline */}
                <PrintTimelineCard isCompleted={false} />

                {/* Job Specifications Card */}
                <PrintJobDetailsCard
                  fileName={fileName}
                  pages={pagesPerCopy}
                  copies={totalCopies}
                  paperSize={paperSize}
                  colorMode={colorMode}
                  printerName="HP LaserJet Pro M404dn"
                  totalPaid={totalPaid}
                  jobCode={jobCode}
                />
              </motion.div>
            ) : (
              <motion.div
                key="completed-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="py-2"
              >
                {/* Success View with Confetti, Checkmark, Receipt & Countdown */}
                <PrintSuccessView
                  fileName={fileName}
                  pages={pagesPerCopy}
                  copies={totalCopies}
                  totalPaid={totalPaid}
                  jobCode={jobCode}
                  onPrintMore={handlePrintMore}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UserProgressPage;

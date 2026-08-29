import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrinterIllustration } from '../components/progress/PrinterIllustration';
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
  const totalPages = passedState?.pages || 18;
  const totalCopies = passedState?.copies || 2;
  const paperSize = passedState?.paperSize || 'A4';
  const colorMode = passedState?.colorMode || 'Black & White';
  const totalPaid = passedState?.totalPaid || 36.0;
  const jobCode = passedState?.jobCode || 'SP-10239-082';

  const storeInfo = {
    ...mockStoreKioskInfo,
    storeId: storeId || mockStoreKioskInfo.storeId
  };

  // Printing Lifecycle State
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCopy, setCurrentCopy] = useState(1);
  const [percent, setPercent] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);
  const totalBillablePages = totalPages * totalCopies;
  const [secondsRemaining, setSecondsRemaining] = useState(18);

  useEffect(() => {
    let printedPagesCount = 1;
    const intervalTime = 900; // Step every ~900ms for satisfying live progression

    const interval = setInterval(() => {
      printedPagesCount += 1;

      if (printedPagesCount <= totalBillablePages) {
        const activePageInDoc = ((printedPagesCount - 1) % totalPages) + 1;
        const activeCopyNum = Math.floor((printedPagesCount - 1) / totalPages) + 1;
        const currentPct = Math.min(
          99,
          Math.round((printedPagesCount / totalBillablePages) * 100)
        );
        const secsLeft = Math.max(
          1,
          Math.round((totalBillablePages - printedPagesCount) * 0.9)
        );

        setCurrentPage(activePageInDoc);
        setCurrentCopy(activeCopyNum);
        setPercent(currentPct);
        setSecondsRemaining(secsLeft);
      } else {
        setPercent(100);
        setSecondsRemaining(0);
        clearInterval(interval);
        setTimeout(() => {
          setIsCompleted(true);
        }, 600);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [totalPages, totalCopies, totalBillablePages]);

  const handlePrintMore = () => {
    navigate(`/store/${storeInfo.storeId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-start items-center font-sans antialiased text-slate-900 overflow-x-hidden md:py-8">
      {/* Mobile-first Container */}
      <div className="w-full max-w-md bg-white md:rounded-[32px] md:border md:border-slate-200/80 md:shadow-2xl md:shadow-indigo-500/5 min-h-screen md:min-h-0 flex flex-col justify-between p-4 sm:p-6 overflow-hidden relative">
        {/* Header Store Pill */}
        <header className="w-full pt-1 sm:pt-2 pb-2 flex items-center justify-between select-none">
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


        {/* Dynamic Body Content */}
        <div className="py-2 flex-1 flex flex-col justify-center">
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
                    Please wait while your documents are being printed.
                  </p>
                </div>

                {/* Animated Printer Illustration with Paper Output Loop */}
                <PrinterIllustration
                  isPrinting={true}
                  currentPage={currentPage}
                  totalPages={totalPages}
                />

                {/* Progress Bar & Page Counter Card */}
                <PrintProgressCard
                  fileName={fileName}
                  currentPage={currentPage}
                  totalPages={totalPages}
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
                  pages={totalPages}
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
              >
                {/* Success View with Confetti, Checkmark, Receipt & Countdown */}
                <PrintSuccessView
                  fileName={fileName}
                  pages={totalPages}
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

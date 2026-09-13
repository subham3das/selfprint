import { getSocket } from '@/lib/socket';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { Printer, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrinterFramePlayer } from '../components/progress/PrinterFramePlayer';
import { PrintProgressCard } from '../components/progress/PrintProgressCard';
import { PrintTimelineCard } from '../components/progress/PrintTimelineCard';
import { PrintJobDetailsCard } from '../components/progress/PrintJobDetailsCard';
import { PrintSuccessView } from '../components/progress/PrintSuccessView';
import { userPublicService } from '../services/userPublic.service';
import { mockStoreKioskInfo } from '../data/userMockData';

export const UserProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeId } = useParams<{ storeId?: string }>();
  const [searchParams] = useSearchParams();

  const passedState = location.state as
    | {
        jobId?: string;
        jobCode?: string;
        fileName?: string;
        pages?: number;
        copies?: number;
        paperSize?: string;
        colorMode?: string;
        totalPaid?: number;
        queuePosition?: number;
        estimatedWaitMinutes?: number;
      }
    | undefined;

  const targetJobId =
    searchParams.get('jobId') ||
    passedState?.jobId ||
    passedState?.jobCode ||
    'DEFAULT';

  // Live order telemetry state
  const [liveJob, setLiveJob] = useState<any>(null);
  const [liveQueue, setLiveQueue] = useState<{ queuePosition: number; estimatedWaitMinutes: number }>({
    queuePosition: passedState?.queuePosition ?? 1,
    estimatedWaitMinutes: passedState?.estimatedWaitMinutes ?? 2
  });
  const [liveStore, setLiveStore] = useState<any>(null);
  const [livePrinter, setLivePrinter] = useState<any>(null);

  // Poll order status every 2 seconds
  useEffect(() => {
    let isMounted = true;
    if (targetJobId === 'DEFAULT') return;

    const pollJob = async () => {
      try {
        const data = await userPublicService.trackOrder(targetJobId);
        if (isMounted && data) {
          if (data.job) setLiveJob(data.job);
          if (data.queue) setLiveQueue(data.queue);
          if (data.store) setLiveStore(data.store);
          if (data.printer) setLivePrinter(data.printer);
        }
      } catch (err) {
        console.error('Error tracking live order:', err);
      }
    };

    pollJob();

    try {
      const socket = getSocket();
      if (socket && targetJobId) {
        socket.emit('join_job', targetJobId);

        const handleJobUpdate = (data: any) => {
          console.log('[Progress] Live update received from socket:', data);
          if (isMounted) {
            if (data?.job) setLiveJob(data.job);
            if (data?.status) setLiveJob((prev: any) => ({ ...prev, status: data.status }));
            if (data?.queue) setLiveQueue(data.queue);
          }
        };

        const handleOrderCompleted = (data: any) => {
          console.log('[Progress] Order completed event received:', data);
          if (isMounted) {
            setLiveJob((prev: any) => ({
              ...prev,
              status: 'Completed',
              completedAt: data?.completedAt || new Date().toISOString(),
              ...(data?.job || {})
            }));
          }
        };

        socket.on('order_completed', handleOrderCompleted);
        socket.on('job_completed', handleOrderCompleted);
        socket.on('queue:started', handleJobUpdate);
        socket.on('queue:completed', handleOrderCompleted);
        socket.on('queue:failed', handleJobUpdate);
        socket.on('queue:cancelled', handleJobUpdate);
        socket.on('queue:status', handleJobUpdate);
        socket.on('job_status_update', (d: any) => {
          if (d?.status === 'COMPLETED' || d?.status === 'Completed') {
            handleOrderCompleted(d);
          } else {
            handleJobUpdate(d);
          }
        });
        socket.on('PRINT_JOB_STATUS_CHANGED', (d: any) => {
          if (d?.status === 'Completed' || d?.status === 'COMPLETED') {
            handleOrderCompleted(d);
          } else {
            handleJobUpdate(d);
          }
        });

        return () => {
          isMounted = false;
          socket.off('order_completed', handleOrderCompleted);
          socket.off('job_completed', handleOrderCompleted);
          socket.off('queue:started', handleJobUpdate);
          socket.off('queue:completed', handleOrderCompleted);
          socket.off('queue:failed', handleJobUpdate);
          socket.off('queue:cancelled', handleJobUpdate);
          socket.off('queue:status', handleJobUpdate);
          socket.off('job_status_update');
          socket.off('PRINT_JOB_STATUS_CHANGED');
        };
      }
    } catch {}

    return () => {
      isMounted = false;
    };
  }, [targetJobId]);

  const fileName = liveJob?.fileName || passedState?.fileName || 'Document.pdf';
  const pagesPerCopy = liveJob?.pages || passedState?.pages || 1;
  const totalCopies = liveJob?.copies || passedState?.copies || 1;
  const totalBillablePages = liveJob?.totalBillablePages || pagesPerCopy * totalCopies;
  const paperSize = liveJob?.paperSize || passedState?.paperSize || 'A4';
  const colorMode = liveJob?.colorMode || passedState?.colorMode || 'Black & White';
  const totalPaid = liveJob?.totalPaid || passedState?.totalPaid || 2.0;
  const jobCode = liveJob?.jobNumber || passedState?.jobCode || `SP-${targetJobId}`;

  const storeInfo = {
    ...mockStoreKioskInfo,
    storeId: storeId || mockStoreKioskInfo.storeId,
    storeName: liveStore?.name || 'SelfPrint Kiosk',
    branchName: liveStore?.branchName || 'Main Store'
  };

  const status = liveJob?.status || 'Waiting';
  const isCompleted = status === 'Completed' || status === 'COMPLETED';
  const isPrinting = status === 'Printing' || status === 'PRINTING';

  // Progress calculations
  const [currentPage, setCurrentPage] = useState<number>(1);
  const cycleDurationMs = 2400;

  const currentCopy = Math.min(
    totalCopies,
    Math.floor((currentPage - 1) / Math.max(1, pagesPerCopy)) + 1
  );
  const pageInCurrentCopy = ((currentPage - 1) % Math.max(1, pagesPerCopy)) + 1;

  const percent = isCompleted
    ? 100
    : isPrinting
    ? Math.min(95, Math.round(((currentPage - 1) / Math.max(1, totalBillablePages)) * 100) + 30)
    : 10;

  const secondsRemaining = isCompleted
    ? 0
    : liveQueue.estimatedWaitMinutes * 60;

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
            <span>{livePrinter?.name || 'Printer Online'}</span>
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
                {/* Live Queue Position Banner */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                      #{liveQueue.queuePosition}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {isPrinting
                          ? 'Now Printing Your Job'
                          : liveQueue.queuePosition === 1
                          ? 'Next in Queue to Print'
                          : `Queue Position: ${liveQueue.queuePosition}`}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        <span>Estimated Wait: {liveQueue.estimatedWaitMinutes} min</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                    {status}
                  </span>
                </div>

                {/* Status Title */}
                <div className="text-center space-y-1 pt-1">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    {isPrinting ? 'Printing Your Documents...' : 'Your Job is in the Store Queue'}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    {isPrinting
                      ? `Printing Page ${currentPage} of ${totalBillablePages}`
                      : 'Please stand near the printer tray to collect your sheets'}
                  </p>
                </div>

                {/* Synchronized Loop Printer Player */}
                <PrinterFramePlayer
                  totalPages={totalBillablePages}
                  currentPage={currentPage}
                  isPrinting={isPrinting}
                  onPageCycleFinished={(p) => setCurrentPage(Math.min(totalBillablePages, p + 1))}
                  onAllPagesFinished={() => {}}
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
                  printerName={livePrinter?.name || 'Store LaserJet'}
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
                {/* Success View with Confetti, Checkmark, Real Backend Receipt & Countdown */}
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

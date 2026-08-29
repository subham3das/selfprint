import React from 'react';
import { Check, Loader2, Clock } from 'lucide-react';

interface PrintTimelineCardProps {
  isCompleted: boolean;
}

export const PrintTimelineCard: React.FC<PrintTimelineCardProps> = ({
  isCompleted
}) => {
  const steps = [
    {
      id: 1,
      title: 'Payment Received',
      subtitle: 'UPI Transaction Verified',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Document Uploaded',
      subtitle: 'Parsed and Spooled',
      status: 'completed'
    },
    {
      id: 3,
      title: isCompleted ? 'Printing Finished' : 'Printing in Progress',
      subtitle: isCompleted
        ? 'All pages sent to output tray'
        : 'Active hardware feed',
      status: isCompleted ? 'completed' : 'active'
    },
    {
      id: 4,
      title: 'Ready for Collection',
      subtitle: 'Collect printouts at tray',
      status: isCompleted ? 'completed' : 'waiting'
    }
  ];

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-3.5 select-none">
      <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase text-slate-400">
        Live Print Lifecycle
      </h3>

      <div className="space-y-4 pt-1">
        {steps.map((step, idx) => {
          const isDone = step.status === 'completed';
          const isActive = step.status === 'active';
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="flex items-start gap-3.5 relative">
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`absolute left-3.5 top-7 w-0.5 h-6 -translate-x-1/2 ${
                    isDone ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Status Circle */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : isActive
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md animate-pulse'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isActive ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p
                  className={`text-xs font-bold leading-tight ${
                    isDone
                      ? 'text-slate-800'
                      : isActive
                      ? 'text-indigo-600 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

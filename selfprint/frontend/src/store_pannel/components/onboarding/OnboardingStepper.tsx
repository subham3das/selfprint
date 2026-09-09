import React from 'react';
import { Check, Store, Landmark, CheckCircle2 } from 'lucide-react';
import { OnboardingStep } from '../../types/storeOnboarding.types';

interface OnboardingStepperProps {
  currentStep: OnboardingStep;
  onStepClick?: (step: OnboardingStep) => void;
}

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  currentStep,
  onStepClick
}) => {
  const steps = [
    { id: 'store_details' as OnboardingStep, label: 'Store Details', icon: Store, num: 1 },
    { id: 'bank_details' as OnboardingStep, label: 'Bank Details', icon: Landmark, num: 2 },
    { id: 'review' as OnboardingStep, label: 'Finish', icon: CheckCircle2, num: 3 }
  ];

  const getStepStatus = (stepId: OnboardingStep) => {
    if (currentStep === 'success') return 'completed';
    if (currentStep === stepId) return 'active';

    const order: OnboardingStep[] = ['store_details', 'bank_details', 'review'];
    const currentIdx = order.indexOf(currentStep);
    const stepIdx = order.indexOf(stepId);

    if (stepIdx < currentIdx) return 'completed';
    return 'pending';
  };

  return (
    <div className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          const isClickable = onStepClick && status === 'completed';


          return (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <div
                onClick={() => isClickable && onStepClick(step.id)}
                className={`flex items-center gap-2.5 transition-all ${
                  isClickable ? 'cursor-pointer hover:opacity-80' : ''
                }`}
              >
                {/* Badge Number / Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-2xs ${
                    status === 'completed'
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                      : status === 'active'
                      ? 'bg-purple-600 text-white shadow-purple-600/25 ring-4 ring-purple-600/10'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {status === 'completed' ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{step.num}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="hidden sm:block">
                  <p
                    className={`text-xs font-extrabold ${
                      status === 'active'
                        ? 'text-purple-700'
                        : status === 'completed'
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {status === 'completed'
                      ? 'Completed'
                      : status === 'active'
                      ? 'In Progress'
                      : 'Upcoming'}
                  </p>
                </div>
              </div>

              {/* Connecting Line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-3 sm:mx-6 h-0.5 bg-slate-200 relative overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-emerald-500 transition-all duration-300 ${
                      getStepStatus(steps[idx + 1].id) === 'active' ||
                      getStepStatus(steps[idx + 1].id) === 'completed'
                        ? 'w-full'
                        : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

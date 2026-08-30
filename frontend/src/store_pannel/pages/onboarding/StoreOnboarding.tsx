import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer } from 'lucide-react';

import { useStoreOnboarding } from '../../hooks/useStoreOnboarding';
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper';
import { WelcomePage } from './WelcomePage';
import { StoreDetailsPage } from './StoreDetailsPage';
import { BankDetailsPage } from './BankDetailsPage';
import { ReviewPage } from './ReviewPage';
import { SuccessPage } from './SuccessPage';

export const StoreOnboardingPage: React.FC = () => {
  const {
    currentStep,
    storeDetails,
    bankDetails,
    isConfirmed,
    setIsConfirmed,
    isSubmitting,
    errorMessage,
    registrationResult,
    countdown,
    goToStep,
    handleSaveStoreDetails,
    handleSaveBankDetails,
    handleSubmitRegistration,
    handleQuickFillDemo
  } = useStoreOnboarding();

  const showStepper =
    currentStep === 'store_details' ||
    currentStep === 'bank_details' ||
    currentStep === 'review';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-sm tracking-tight">
                  Self Print
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                  PARTNER
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none">
                Store Onboarding
              </p>
            </div>
          </div>

          {/* Right Help / Support Badge */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
              Need help onboarding?
            </span>
            <a
              href="mailto:partner@selfprint.com"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </header>

      {/* Progress Stepper (Sticky on steps 1, 2, 3) */}
      {showStepper && (
        <OnboardingStepper
          currentStep={currentStep}
          onStepClick={(step) => goToStep(step)}
        />
      )}

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <WelcomePage onStart={() => goToStep('store_details')} />
            </motion.div>
          )}

          {currentStep === 'store_details' && (
            <motion.div
              key="store_details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <StoreDetailsPage
                initialValues={storeDetails}
                onSave={handleSaveStoreDetails}
                onBack={() => goToStep('welcome')}
                onQuickFill={handleQuickFillDemo}
              />
            </motion.div>
          )}

          {currentStep === 'bank_details' && (
            <motion.div
              key="bank_details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <BankDetailsPage
                initialValues={bankDetails}
                ownerName={storeDetails.ownerName}
                onSave={handleSaveBankDetails}
                onBack={() => goToStep('store_details')}
              />
            </motion.div>
          )}

          {currentStep === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ReviewPage
                storeDetails={storeDetails}
                bankDetails={bankDetails}
                isConfirmed={isConfirmed}
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
                onConfirmChange={setIsConfirmed}
                onEditStore={() => goToStep('store_details')}
                onEditBank={() => goToStep('bank_details')}
                onBack={() => goToStep('bank_details')}
                onSubmit={handleSubmitRegistration}
              />
            </motion.div>
          )}

          {currentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <SuccessPage
                registrationResult={registrationResult}
                countdown={countdown}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-400 font-medium">
        <p>
          <strong className="text-slate-600">Self Print Partner</strong> • Automated Cloud Printing & Instant Digital Payments
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          © {new Date().getFullYear()} Self Print Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default StoreOnboardingPage;

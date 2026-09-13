import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  MapPin,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Download,
  Check,
  RefreshCw,
  ShieldCheck,
  PlusCircle,
  Smartphone,
  Activity as ActivityIcon,
  Layers,
  FileText
} from 'lucide-react';
import {
  AdminStoreItem,
  StoreBankDetails,
  SettlementSummaryData,
  SettlementRecord
} from '../types/store.types';
import { StoreStatusBadge } from './StoreStatusBadge';
import { StorePlanBadge } from './StorePlanBadge';
import { adminStoresService } from '../services/stores.service';

interface StoreViewModalProps {
  store: AdminStoreItem | null;
  onClose: () => void;
  onEdit: (store: AdminStoreItem) => void;
}

type TabType = 'store' | 'owner' | 'settlement' | 'connector' | 'activity';

export const StoreViewModal: React.FC<StoreViewModalProps> = ({
  store,
  onClose,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('store');

  const [bankDetails, setBankDetails] = useState<StoreBankDetails | null>(null);
  const [settlementSummary, setSettlementSummary] = useState<SettlementSummaryData | null>(null);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isSettlementsLoading, setIsSettlementsLoading] = useState(false);

  const [isAccountRevealed, setIsAccountRevealed] = useState(false);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isRevealingLoading, setIsRevealingLoading] = useState(false);
  const [isMarkSettledOpen, setIsMarkSettledOpen] = useState(false);
  const [isSubmittingSettlement, setIsSubmittingSettlement] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const [settleAmount, setSettleAmount] = useState<string>('');
  const [settleUtr, setSettleUtr] = useState<string>('');
  const [settleMethod, setSettleMethod] = useState<string>('Bank Transfer');
  const [settleNotes, setSettleNotes] = useState<string>('');
  const [settleError, setSettleError] = useState<string | null>(null);
  const [settleSuccess, setSettleSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!store?.id) return;
    loadBankData();
  }, [store?.id]);

  const loadBankData = async () => {
    if (!store?.id) return;
    setIsSummaryLoading(true);
    setIsSettlementsLoading(true);
    setIsAccountRevealed(false);

    try {
      const [bank, summary, list] = await Promise.all([
        adminStoresService.fetchStoreBankDetails(store.id, false).catch(() => null),
        adminStoresService.fetchSettlementSummary(store.id).catch(() => null),
        adminStoresService.fetchStoreSettlements(store.id).catch(() => [])
      ]);
      setBankDetails(bank);
      setSettlementSummary(summary);
      setSettlements(list || []);
      if (summary) {
        setSettleAmount(summary.pendingSettlement > 0 ? summary.pendingSettlement.toString() : '');
      }
    } finally {
      setIsSummaryLoading(false);
      setIsSettlementsLoading(false);
    }
  };

  const handleConfirmReveal = async () => {
    if (!store?.id) return;
    setIsRevealingLoading(true);
    try {
      const unmasked = await adminStoresService.fetchStoreBankDetails(store.id, true);
      setBankDetails(unmasked);
      setIsAccountRevealed(true);
      setIsRevealModalOpen(false);
    } catch (err) {
      console.error('Failed to reveal bank details:', err);
    } finally {
      setIsRevealingLoading(false);
    }
  };

  const handleHideAccount = async () => {
    if (!store?.id) return;
    const masked = await adminStoresService.fetchStoreBankDetails(store.id, false);
    setBankDetails(masked);
    setIsAccountRevealed(false);
  };

  const handleCopyBankDetails = async () => {
    if (!bankDetails) return;
    const text = [
      `Store: ${bankDetails.storeName || store?.name}`,
      `Account Holder: ${bankDetails.accountHolderName}`,
      `Bank Name: ${bankDetails.bankName}`,
      `Account Number: ${bankDetails.accountNumber}`,
      `IFSC Code: ${bankDetails.ifscCode}`,
      `UPI ID: ${bankDetails.upiId || 'N/A'}`,
      `Settlement Method: ${bankDetails.settlementMethod || 'Bank Transfer'}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      if (store?.id) {
        adminStoresService.logBankDetailsAccess(store.id, 'COPY_BANK_DETAILS').catch(() => {});
      }
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleDownloadStatement = async () => {
    if (!store?.id) return;
    if (store?.id) {
      adminStoresService.logBankDetailsAccess(store.id, 'DOWNLOAD_STATEMENT').catch(() => {});
    }

    const headers = ['Date', 'Reference No (UTR)', 'Method', 'Amount (INR)', 'Commission (INR)', 'Status', 'Processed By', 'Notes'];
    const rows = settlements.map((s) => [
      s.date ? new Date(s.date).toLocaleDateString('en-GB') : 'N/A',
      s.referenceNo || s.transactionReference || 'N/A',
      s.paymentMethod || 'Bank Transfer',
      s.amount || 0,
      s.commission || 0,
      s.status || 'Completed',
      s.processedBy || 'Administrator',
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `settlement_statement_${store.storeIdCode || store.id}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;

    const amt = parseFloat(settleAmount);
    if (isNaN(amt) || amt <= 0) {
      setSettleError('Please enter a valid settlement amount greater than 0.');
      return;
    }
    if (!settleUtr.trim()) {
      setSettleError('Transaction Reference (UTR) is required.');
      return;
    }

    setSettleError(null);
    setIsSubmittingSettlement(true);
    try {
      await adminStoresService.createSettlement(store.id, {
        amount: amt,
        transactionReference: settleUtr.trim(),
        paymentMethod: settleMethod,
        notes: settleNotes.trim()
      });

      const [newSummary, newList] = await Promise.all([
        adminStoresService.fetchSettlementSummary(store.id),
        adminStoresService.fetchStoreSettlements(store.id)
      ]);
      setSettlementSummary(newSummary);
      setSettlements(newList);

      setSettleSuccess(`Settlement of ₹${amt.toLocaleString('en-IN')} recorded successfully!`);
      setTimeout(() => {
        setIsMarkSettledOpen(false);
        setSettleSuccess(null);
        setSettleUtr('');
        setSettleNotes('');
      }, 1500);
    } catch (err: any) {
      setSettleError(err.response?.data?.message || err.message || 'Failed to process settlement.');
    } finally {
      setIsSubmittingSettlement(false);
    }
  };

  if (!store) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col max-h-[92vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl ${store.logoBgColor} flex items-center justify-center font-black text-sm text-white shadow-md`}>
              {store.logoText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">{store.name}</h3>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {store.storeIdCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{store.email} &bull; {store.city}, {store.state}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <StoreStatusBadge status={store.status} />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'store' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Store Information</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('owner')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'owner' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Owner Information</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settlement')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'settlement' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Settlement Details</span>
            {settlementSummary && settlementSummary.pendingSettlement > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('connector')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'connector' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Connector Information</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'activity' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ActivityIcon className="w-3.5 h-3.5" />
            <span>Activity</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 bg-[#F8FAFC]/50">
          {activeTab === 'store' && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{store.revenueFormatted}</p>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Commission</span>
                  <p className="text-xl font-black text-indigo-600 mt-1">{store.commissionFormatted}</p>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{store.ordersCount.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plan</span>
                  <div className="mt-1.5 flex items-center"><StorePlanBadge plan={store.plan} /></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-xs flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>Store Location</span>
                  </h4>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">{store.fullAddress}</p>
                  <div className="mt-auto pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                    <span>PIN: {store.pincode || '781001'}</span>
                    <span>{store.city}, {store.state}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 shadow-xs flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Printer className="w-4 h-4 text-indigo-600" />
                    <span>Kiosk Hardware</span>
                  </h4>
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Connected Printers:</span>
                    <span className="font-bold text-slate-800">{store.printerCount} Units Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1.5">
                    <span className="text-slate-500">QR Standee:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready & Deployed</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'owner' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Primary Store Owner & Contact Details</span>
                </h4>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
                  Verified Merchant
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Full Name</span>
                  <span className="font-bold text-slate-800 text-sm">{store.ownerName}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Phone Number</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">{store.ownerPhone}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Email Address</span>
                  <span className="font-bold text-slate-800 text-sm">{store.ownerEmail || store.email}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Merchant Joined</span>
                  <span className="font-bold text-slate-800 text-sm">{store.joinedDate}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settlement' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Settlement Actions:</span>
                  {copiedNotification && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 animate-fade-in">
                      <Check className="w-3 h-3" />
                      <span>Copied to clipboard</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyBankDetails}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Bank Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadStatement}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download Statement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (settlementSummary) {
                        setSettleAmount(settlementSummary.pendingSettlement > 0 ? settlementSummary.pendingSettlement.toString() : '');
                      }
                      setIsMarkSettledOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-indigo-600/25"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Mark as Settled</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Settlement Financial Summary</span>
                  </h4>
                  <button
                    type="button"
                    onClick={loadBankData}
                    disabled={isSummaryLoading}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSummaryLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Stats</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
                    <p className="text-base font-black text-slate-900 mt-1">
                      {settlementSummary?.totalOrders?.toLocaleString() || store.ordersCount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Revenue</span>
                    <p className="text-base font-black text-slate-900 mt-1">
                      ₹{(settlementSummary?.totalRevenue || store.revenueRaw || 45200).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Commission</span>
                    <p className="text-base font-black text-indigo-600 mt-1">
                      ₹{(settlementSummary?.commission || store.commissionRaw || 4520).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 shadow-xs">
                    <span className="text-[10px] font-bold text-amber-700 uppercase">Pending Settlement</span>
                    <p className="text-base font-black text-amber-700 mt-1">
                      ₹{(settlementSummary?.pendingSettlement ?? 12340).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 shadow-xs">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Already Settled</span>
                    <p className="text-base font-black text-emerald-700 mt-1">
                      ₹{(settlementSummary?.alreadySettled ?? 28340).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Next Settlement</span>
                    <p className="text-xs font-bold text-slate-800 mt-1 leading-tight">
                      {settlementSummary?.nextSettlementDate || '18 September 2026'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Merchant Bank Details
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {bankDetails?.verificationStatus === 'Rejected' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Rejected</span>
                      </span>
                    ) : bankDetails?.verificationStatus === 'Pending' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span>Pending Verification</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Bank Account</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {bankDetails?.settlementMethod === 'UPI' ? (
                        <>
                          <Smartphone className="w-3 h-3 text-indigo-600" />
                          <span>UPI</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3 h-3 text-indigo-600" />
                          <span>Bank Transfer</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="flex flex-col gap-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Bank Account Holder</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {bankDetails?.accountHolderName || store.ownerName || 'Subham Das'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Bank Name</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {bankDetails?.bankName || 'State Bank of India'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center justify-between">
                      <span>Account Number</span>
                      {isAccountRevealed ? (
                        <span className="text-[10px] text-indigo-600 font-bold">Revealed</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">Masked (Last 4)</span>
                      )}
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="font-mono font-bold text-slate-800 text-sm tracking-wider">
                        {bankDetails?.accountNumber || 'XXXXXX4321'}
                      </span>
                      {isAccountRevealed ? (
                        <button
                          type="button"
                          onClick={handleHideAccount}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <EyeOff className="w-3 h-3" />
                          <span>Hide</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsRevealModalOpen(true)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-indigo-600" />
                          <span>Reveal</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">IFSC Code</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {bankDetails?.ifscCode || 'SBIN0001234'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">UPI ID (if provided)</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {bankDetails?.upiId || 'subham@oksbi'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Bank Details Updated</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {bankDetails?.updatedAt
                        ? new Date(bankDetails.updatedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : '12 September 2026'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-500 font-medium border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Security Notice: Bank details are managed exclusively by the store owner and cannot be altered by administrators. All access is audited.
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Settlement Payout History</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-semibold">
                    {settlements.length} Record{settlements.length === 1 ? '' : 's'}
                  </span>
                </div>

                {isSettlementsLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
                    <span className="text-xs">Loading settlement records...</span>
                  </div>
                ) : settlements.length === 0 ? (
                  <div className="py-8 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2">
                    <CreditCard className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-500">
                      No settlement payout records found for this store yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsMarkSettledOpen(true)}
                      className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      + Record First Settlement Payout
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Reference No</th>
                          <th className="py-2.5 px-3">Method</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Processed By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {settlements.map((s, idx) => (
                          <tr key={s.id || idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              {s.date ? new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '12 Sep'}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              ₹{(s.amount || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-700">
                              {s.referenceNo || s.transactionReference || 'UTR938292'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {s.paymentMethod || 'Bank Transfer'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>{s.status || 'Completed'}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 font-medium">
                              {s.processedBy || 'Subham'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'connector' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Connector Hardware & Telemetry</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Active Connector</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Desktop Connector Daemon</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">Online</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">ID: {store.storeIdCode}-DAEMON</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Physical Printers</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{store.printerCount} Configured Units</span>
                    <span className="text-slate-500 text-[11px]">Default: Direct Spooler</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-indigo-600" />
                <span>Store Activity & Audit Events</span>
              </h4>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-slate-800">Store active on network</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{store.lastActive}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="font-medium text-slate-800">Bank details synchronized from MongoDB</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">Today</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(store);
            }}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            Edit Store Details
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isRevealModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reveal Sensitive Bank Account</h3>
                  <p className="text-xs text-slate-400">Security confirmation required</p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                <p className="font-semibold mb-1">Audit Logging Notice:</p>
                Revealing the unmasked merchant account number is an audited administrative action. Your admin identity, timestamp, and IP address will be recorded in the security log.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRevealModalOpen(false)}
                  disabled={isRevealingLoading}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReveal}
                  disabled={isRevealingLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isRevealingLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Confirm & Reveal</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMarkSettledOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Record Merchant Payout Settlement</h3>
                    <p className="text-xs text-slate-400">Store: {store.name} ({store.storeIdCode})</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMarkSettledOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {settleSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{settleSuccess}</span>
                </div>
              )}

              {settleError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{settleError}</span>
                </div>
              )}

              <form onSubmit={handleProcessSettlement} className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Settlement Amount (INR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    placeholder="e.g. 6500"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-hidden font-bold text-slate-900"
                  />
                  {settlementSummary && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Pending Balance: ₹{settlementSummary.pendingSettlement.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Transaction Reference / UTR No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={settleUtr}
                    onChange={(e) => setSettleUtr(e.target.value)}
                    placeholder="e.g. UTR9382928172"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-hidden font-mono text-slate-900 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Payment Method
                  </label>
                  <select
                    value={settleMethod}
                    onChange={(e) => setSettleMethod(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-hidden text-slate-900 bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="UPI">UPI Direct</option>
                    <option value="RazorpayX">RazorpayX Payout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Notes / Reference Details
                  </label>
                  <textarea
                    rows={2}
                    value={settleNotes}
                    onChange={(e) => setSettleNotes(e.target.value)}
                    placeholder="Weekly payout batch reference or remarks..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-600 focus:outline-hidden text-slate-900 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsMarkSettledOpen(false)}
                    disabled={isSubmittingSettlement}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingSettlement}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isSubmittingSettlement ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm & Mark Settled</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoreViewModal;

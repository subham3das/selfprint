import React from 'react';
import { Tag, FileText, Info } from 'lucide-react';
import { UserPriceSummary } from '../types/userPrint.types';

interface PriceCalculationCardProps {
  summary: UserPriceSummary;
}

export const PriceCalculationCard: React.FC<PriceCalculationCardProps> = ({
  summary
}) => {
  return (
    <div className="w-full pt-2 sm:pt-3 space-y-2.5 sm:space-y-3 select-none">
      {/* Price Breakdown Card matching user_ui.png */}
      <div className="w-full rounded-2xl bg-indigo-50/50 border border-indigo-100/60 p-3.5 sm:p-4 space-y-2 text-xs">
        {/* Row 1: Price per page */}
        <div className="flex items-center justify-between text-slate-700">
          <div className="flex items-center gap-2 font-medium">
            <Tag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Price per page</span>
          </div>
          <span className="font-bold text-slate-900 font-mono">
            ₹{summary.pricePerPage.toFixed(2)}
          </span>
        </div>

        {/* Row 2: Total pages */}
        <div className="flex items-center justify-between text-slate-700">
          <div className="flex items-center gap-2 font-medium">
            <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Total pages</span>
          </div>
          <span className="font-bold text-slate-900 font-mono">
            {summary.totalBillablePages}
          </span>
        </div>

        {/* Dotted Divider */}
        <div className="border-t border-dashed border-indigo-200/80 my-1.5 sm:my-2" />

        {/* Row 3: Total Amount */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="font-bold text-indigo-600 text-xs">Total Amount</span>
          <span className="font-bold text-indigo-600 text-sm sm:text-base font-mono">
            ₹{summary.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Info Callout Banner matching user_ui.png */}
      <div className="w-full rounded-2xl bg-indigo-50/40 border border-indigo-100/50 p-3 sm:p-3.5 flex items-start gap-2 sm:gap-2.5 text-[11px] sm:text-xs text-slate-600">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          You will be able to review and pay after your document is sent to the
          printer.
        </span>
      </div>
    </div>
  );
};

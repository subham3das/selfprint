import React from 'react';
import { StorePlan } from '../types/store.types';

interface StorePlanBadgeProps {
  plan: StorePlan;
}

export const StorePlanBadge: React.FC<StorePlanBadgeProps> = ({ plan }) => {
  switch (plan) {
    case 'Pro':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-600 border border-purple-100">
          Pro
        </span>
      );
    case 'Basic':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
          Basic
        </span>
      );
    case 'Enterprise':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          Enterprise
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
          {plan}
        </span>
      );
  }
};

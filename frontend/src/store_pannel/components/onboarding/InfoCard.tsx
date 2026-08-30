import React from 'react';
import { Key } from 'lucide-react';


interface InfoCardProps {
  email?: string;
  phone?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ email, phone }) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 border border-purple-200/80 rounded-2xl p-4 shadow-2xs">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
          <Key className="w-4 h-4" />
        </div>

        <div className="text-xs space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-extrabold text-purple-950 text-xs">
              Default Login Credentials Rule
            </h4>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-200/70 text-purple-800">
              FIRST LOGIN
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
            By default your <strong className="text-slate-900 font-bold">Login ID</strong> will be your{' '}
            <span className="text-purple-700 font-bold font-mono">
              {email || 'Email Address'}
            </span>{' '}
            and your <strong className="text-slate-900 font-bold">Default Password</strong> will be your{' '}
            <span className="text-purple-700 font-bold font-mono">
              {phone || 'Phone Number'}
            </span>
            . You can customize or reset your password at any time in Store Settings.
          </p>
        </div>
      </div>
    </div>
  );
};

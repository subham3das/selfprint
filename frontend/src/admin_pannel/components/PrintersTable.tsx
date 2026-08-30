import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { AdminPrinterItem } from '../types/printer.types';
import { PrinterStatusBadge } from './PrinterStatusBadge';
import { PrinterActionMenu } from './PrinterActionMenu';

interface PrintersTableProps {
  printers: AdminPrinterItem[];
  onViewPrinter: (p: AdminPrinterItem) => void;
  onEditPrinter: (p: AdminPrinterItem) => void;
  onRestartPrinter: (id: string) => void;
  onTestPrint: (p: AdminPrinterItem) => void;
  onTogglePause: (id: string) => void;
  onDeletePrinter: (id: string) => void;
}

export const PrintersTable: React.FC<PrintersTableProps> = ({
  printers,
  onViewPrinter,
  onEditPrinter,
  onRestartPrinter,
  onTestPrint,
  onTogglePause,
  onDeletePrinter
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getHealthBadge = (health: number) => {
    if (health >= 85) {
      return {
        bg: 'border-emerald-500 text-emerald-600 bg-emerald-50/50',
        stroke: '#10B981'
      };
    }
    if (health >= 60) {
      return {
        bg: 'border-amber-500 text-amber-600 bg-amber-50/50',
        stroke: '#F59E0B'
      };
    }
    return {
      bg: 'border-rose-500 text-rose-600 bg-rose-50/50',
      stroke: '#EF4444'
    };
  };

  if (printers.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-xs">
        <p className="text-sm font-semibold text-slate-500">
          No printers match the selected filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-bold text-slate-400">
              <th className="py-3 pl-5 pr-3">Printer</th>
              <th className="py-3 px-3">Store</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Prints (This Month)</th>
              <th className="py-3 px-3">Last Printed</th>
              <th className="py-3 px-3 text-center">Health</th>
              <th className="py-3 pr-5 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {printers.map((p) => {
              const healthMeta = getHealthBadge(p.healthPercent);

              return (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* 1. Printer Column (Thumbnail + Name + ID) */}
                  <td className="py-3.5 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnailUrl}
                        alt={p.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-2xs"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[170px]">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-400">
                            {p.printerId}
                          </span>
                          <button
                            type="button"
                            title="Copy Printer ID"
                            onClick={() => handleCopyId(p.printerId)}
                            className="text-slate-300 hover:text-indigo-600 transition-colors p-0.5 cursor-pointer"
                          >
                            {copiedId === p.printerId ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Store Column (Logo + Name + City) */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full ${p.storeLogoBg} flex items-center justify-center font-black text-[10px] shrink-0 shadow-2xs`}
                      >
                        {p.storeLogoText}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                          {p.storeName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {p.city}, {p.state}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 3. Location Column (Area + Floor) */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <p className="font-semibold text-slate-800 text-xs">
                      {p.locationArea}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {p.locationFloor}
                    </p>
                  </td>

                  {/* 4. Type Column (Laser / Inkjet Pill) */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.type === 'Laser'
                          ? 'bg-purple-50 text-purple-600 border border-purple-200/60'
                          : 'bg-sky-50 text-sky-600 border border-sky-200/60'
                      }`}
                    >
                      {p.type}
                    </span>
                  </td>

                  {/* 5. Status Column */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <PrinterStatusBadge status={p.status} />
                  </td>

                  {/* 6. Prints (This Month) */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <p className="font-bold text-slate-900 font-mono text-xs">
                      {p.printsThisMonth.toLocaleString()}
                    </p>
                    {p.printsTrend !== '—' && (
                      <p
                        className={`text-[10px] font-semibold ${
                          p.printsTrend.startsWith('↑')
                            ? 'text-emerald-600'
                            : 'text-rose-500'
                        }`}
                      >
                        {p.printsTrend}
                      </p>
                    )}
                  </td>

                  {/* 7. Last Printed */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {p.lastPrinted === '-' ? (
                      <span className="text-slate-400 text-xs">-</span>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="font-medium text-slate-800 text-[11px]">
                            {p.lastPrinted}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono pl-2.5">
                          {p.lastPrintedTime}
                        </p>
                      </>
                    )}
                  </td>

                  {/* 8. Health Circle Badge */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center justify-center">
                      <div
                        className={`w-8 h-8 rounded-full border-2 ${healthMeta.bg} flex items-center justify-center font-bold text-[11px] font-mono`}
                      >
                        {p.healthPercent}%
                      </div>
                    </div>
                  </td>

                  {/* 9. Actions Column */}
                  <td className="py-3.5 pr-5 pl-3 text-right whitespace-nowrap">
                    <PrinterActionMenu
                      printer={p}
                      onView={onViewPrinter}
                      onEdit={onEditPrinter}
                      onRestart={onRestartPrinter}
                      onTestPrint={onTestPrint}
                      onTogglePause={onTogglePause}
                      onDelete={onDeletePrinter}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

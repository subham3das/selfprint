import React, { useState } from 'react';
import {
  Activity,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Play,
  RotateCcw,
  Printer,
  FileText
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ActivityEvent } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const ActivityPage: React.FC = () => {
  const activities = useAppStore((s) => s.activities);
  const showToast = useAppStore((s) => s.showToast);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filtered = activities.filter((act) => {
    if (filterType !== 'ALL' && act.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return act.title.toLowerCase().includes(q) || act.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(activities, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selfprint-activity-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('Activity Exported', 'Downloaded activity log as JSON.', 'success');
  };

  const handleExportCsv = () => {
    const headers = 'ID,Type,Title,Description,Timestamp\n';
    const rows = activities
      .map(
        (a) =>
          `"${a.id}","${a.type}","${a.title.replace(/"/g, '""')}","${a.description.replace(/"/g, '""')}","${a.timestamp}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selfprint-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Activity Exported', 'Downloaded activity log as CSV.', 'success');
  };

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'PRINTING':
      case 'PRINT_STARTED':
        return <Play className="w-4 h-4 text-blue-400" />;
      case 'RESTARTED':
        return <RotateCcw className="w-4 h-4 text-purple-400" />;
      case 'PRINTER_CONNECTED':
      case 'PRINTER_REMOVED':
        return <Printer className="w-4 h-4 text-emerald-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Hardware Activity Log
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of hardware connections, print executions, and spooler cycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportJson}
          >
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<FileText className="w-3.5 h-3.5" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity events..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs overflow-x-auto">
          {['ALL', 'COMPLETED', 'PRINTING', 'PRINTER_CONNECTED', 'ERROR', 'RESTARTED'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline View */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No Activity Found</h3>
          <p className="text-xs text-slate-400 mt-1">No recorded events match your current search or category filter.</p>
        </Card>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-800 space-y-4 my-2">
          {filtered.map((act) => (
            <div key={act.id} className="relative group">
              {/* Dot on Timeline */}
              <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-blue-500 group-hover:scale-125 transition-transform" />

              <Card hover className="p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">{getEventIcon(act.type)}</div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{act.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" size="sm">
                      {act.type}
                    </Badge>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Filter
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { NotificationSeverity } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const NotificationsPage: React.FC = () => {
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);
  const deleteNotification = useAppStore((s) => s.deleteNotification);
  const clearNotifications = useAppStore((s) => s.clearNotifications);

  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = notifications.filter((n) => {
    if (filterSeverity !== 'all' && n.severity !== filterSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const severityIcon = (sev: NotificationSeverity) => {
    switch (sev) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Notification Center
            {unreadCount > 0 && (
              <Badge variant="danger" size="sm">
                {unreadCount} Unread
              </Badge>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Realtime alerts from cloud backend, local spooler, and hardware sensors.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<CheckCheck className="w-3.5 h-3.5" />}
            onClick={markAllNotificationsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={clearNotifications}
            disabled={notifications.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Severity Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {['all', 'info', 'warning', 'error', 'success'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg capitalize text-xs font-medium transition-colors ${
                filterSeverity === sev
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No Notifications</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery || filterSeverity !== 'all'
              ? 'No notifications match your search/filter criteria.'
              : 'You have zero unread alerts. Everything is running smoothly!'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => (
            <Card
              key={n.id}
              hover
              onClick={() => markNotificationRead(n.id)}
              className={`cursor-pointer transition-all flex items-start gap-3.5 p-4 ${
                !n.read ? 'border-blue-500/30 bg-slate-900/90' : 'opacity-85'
              }`}
            >
              <div className="mt-0.5">{severityIcon(n.severity)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-semibold ${!n.read ? 'text-slate-100' : 'text-slate-300'}`}>
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{n.message}</p>
              </div>

              {/* Delete Single */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n.id);
                }}
                className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Delete Notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

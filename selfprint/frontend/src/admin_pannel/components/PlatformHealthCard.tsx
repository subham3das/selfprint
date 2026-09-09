import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Server, Database, HardDrive, Wifi, AlertTriangle } from 'lucide-react';
import { PlatformHealthMetric } from '../types/analytics.types';

interface PlatformHealthCardProps {
  health: PlatformHealthMetric;
}

export const PlatformHealthCard: React.FC<PlatformHealthCardProps> = ({ health }) => {
  const safeHealth = health || {
    overallHealthPercent: 100,
    serverHealth: 99,
    apiStatus: 'Online',
    databaseStatus: 'Healthy',
    storageUsedPercent: 42,
    activeConnections: 1,
    todaysErrors: 0
  };

  const healthPercent = Math.min(100, Math.max(0, safeHealth.overallHealthPercent ?? 100));

  // Gauge dimensions
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (healthPercent / 100) * circumference;

  const isHealthy = healthPercent >= 90;
  const isWarning = healthPercent >= 70 && healthPercent < 90;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full hover:shadow-md transition-shadow"
    >
      {/* 1. Header with Live Status Indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-none">Platform Health</h3>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 inline-block">
              Live hardware & node telemetry
            </span>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
            isHealthy
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              : isWarning
              ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
              : 'bg-rose-50 text-rose-700 border border-rose-200/80'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isHealthy ? 'bg-emerald-500 animate-pulse' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
            }`}
          />
          {isHealthy ? 'Operational' : isWarning ? 'Degraded' : 'Attention'}
        </span>
      </div>

      {/* 2. Main Visual Gauge & Compact Metrics Section */}
      <div className="flex flex-col sm:flex-row items-center gap-5 my-3">
        {/* Animated Radial Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="transform -rotate-90 overflow-visible">
            <defs>
              <linearGradient id="healthGlowGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="60%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#0EA5E9" />
              </linearGradient>
            </defs>

            {/* Background Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />

            {/* Foreground Value Ring */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="url(#healthGlowGrad)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
              {healthPercent}%
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              Health
            </span>
          </div>
        </div>

        {/* Structured Health Items Grid */}
        <div className="flex flex-col gap-2.5 flex-1 w-full text-xs">
          {/* Server Health Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Server className="w-3 h-3 text-indigo-500" />
                Server Health
              </span>
              <span className="font-mono text-slate-900 font-bold">{safeHealth.serverHealth}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${safeHealth.serverHealth}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-indigo-600 h-full rounded-full"
              />
            </div>
          </div>

          {/* Storage Used Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-600">
                <HardDrive className="w-3 h-3 text-sky-500" />
                Storage Used
              </span>
              <span className="font-mono text-slate-900 font-bold">{safeHealth.storageUsedPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${safeHealth.storageUsedPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                className="bg-sky-500 h-full rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Status Badges Row (4 Key Status Chips) */}
      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 text-[11px]">
        {/* API Status */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            API
          </span>
          <span className="font-bold text-emerald-600">
            {safeHealth.apiStatus}
          </span>
        </div>

        {/* Database Status */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-500" />
            Database
          </span>
          <span className="font-bold text-emerald-600">
            {safeHealth.databaseStatus}
          </span>
        </div>

        {/* Active Connections */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Wifi className="w-3 h-3 text-indigo-500" />
            Active
          </span>
          <span className="font-mono font-bold text-slate-900">
            {safeHealth.activeConnections.toLocaleString()}
          </span>
        </div>

        {/* Today's Errors */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <AlertTriangle className={`w-3 h-3 ${safeHealth.todaysErrors > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
            Errors
          </span>
          <span className={`font-mono font-bold ${safeHealth.todaysErrors > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
            {safeHealth.todaysErrors}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PlatformHealthCard;

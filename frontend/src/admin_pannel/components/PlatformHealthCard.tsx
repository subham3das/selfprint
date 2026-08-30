import React from 'react';
import { PlatformHealthMetric } from '../types/analytics.types';

interface PlatformHealthCardProps {
  health: PlatformHealthMetric;
}

export const PlatformHealthCard: React.FC<PlatformHealthCardProps> = ({ health }) => {
  // SVG Donut calculation for 98%
  const size = 130;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (health.overallHealthPercent / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <h3 className="text-sm font-bold text-slate-900">Platform Health</h3>

      {/* Main Content: Circular Progress on Left, Metrics Breakdown on Right */}
      <div className="flex flex-col sm:flex-row items-center gap-4 my-2">
        {/* Circular Progress Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 overflow-visible"
          >
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="healthRingGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#0EA5E9" />
              </linearGradient>
            </defs>
            {/* Value ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="url(#healthRingGrad)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {health.overallHealthPercent}%
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Overall Health
            </span>
          </div>
        </div>

        {/* Metrics Breakdown List */}
        <div className="flex flex-col gap-2.5 flex-1 w-full text-xs">
          {/* Server Health */}
          <div className="space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span>Server Health</span>
              <span className="font-mono text-slate-900">{health.serverHealth}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${health.serverHealth}%` }}
              />
            </div>
          </div>

          {/* API Status */}
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-semibold">API Status</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {health.apiStatus}
            </span>
          </div>

          {/* Database */}
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-semibold">Database</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {health.databaseStatus}
            </span>
          </div>

          {/* Storage Used */}
          <div className="space-y-1">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span>Storage Used</span>
              <span className="font-mono text-slate-900">{health.storageUsedPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${health.storageUsedPercent}%` }}
              />
            </div>
          </div>

          {/* Active Connections */}
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-semibold">Active Connections</span>
            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {health.activeConnections.toLocaleString()}
            </span>
          </div>

          {/* Today's Errors */}
          <div className="flex items-center justify-between text-slate-700">
            <span className="font-semibold">Today's Errors</span>
            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-900">
              {health.todaysErrors}
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

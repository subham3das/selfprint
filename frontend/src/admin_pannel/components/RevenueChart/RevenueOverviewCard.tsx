import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { RevenueOverviewData } from '../../types/admin.types';

interface RevenueOverviewCardProps {
  data: RevenueOverviewData;
  period: 'This Week' | 'This Month' | 'This Year';
  onPeriodChange: (p: 'This Week' | 'This Month' | 'This Year') => void;
}

export const RevenueOverviewCard: React.FC<RevenueOverviewCardProps> = ({
  data,
  period,
  onPeriodChange
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const periods: ('This Week' | 'This Month' | 'This Year')[] = [
    'This Week',
    'This Month',
    'This Year'
  ];

  // SVG Chart Geometry Calculations
  const chartWidth = 500;
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxRevenue = 40000;
  const minRevenue = 0;

  const points = data.points.map((pt, i) => {
    const x = paddingLeft + (i / (data.points.length - 1)) * innerWidth;
    const y =
      paddingTop +
      (1 - (pt.revenue - minRevenue) / (maxRevenue - minRevenue)) * innerHeight;
    return { ...pt, x, y };
  });

  // Generate smooth cubic bezier SVG path
  const makeSmoothPath = (pts: typeof points) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = makeSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    paddingTop + innerHeight
  } L ${points[0].x} ${paddingTop + innerHeight} Z`;

  const yLabels = [
    { label: '₹40K', val: 40000 },
    { label: '₹30K', val: 30000 },
    { label: '₹20K', val: 20000 },
    { label: '₹10K', val: 10000 },
    { label: '₹0', val: 0 }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Revenue Overview</h2>

        {/* Period Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            <span>{period}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1"
              >
                {periods.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      onPeriodChange(p);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                      period === p
                        ? 'bg-indigo-50 text-indigo-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Metric Section */}
      <div className="mt-2 flex items-baseline gap-2.5">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {data.totalRevenue}
        </span>
        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
          <span>{data.changePercentage} {data.comparisonPeriod}</span>
        </span>
      </div>
      <p className="text-xs text-slate-400 font-medium">Total Revenue</p>

      {/* SVG Interactive Smooth Line Chart */}
      <div className="relative w-full mt-3 h-[200px] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="purpleAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-Axis labels */}
          {yLabels.map((yl) => {
            const y =
              paddingTop +
              (1 - (yl.val - minRevenue) / (maxRevenue - minRevenue)) *
                innerHeight;
            return (
              <g key={yl.label}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {yl.label}
                </text>
              </g>
            );
          })}

          {/* Area Fill Gradient */}
          <path d={areaPath} fill="url(#purpleAreaGradient)" />

          {/* Line Stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#6366F1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X-Axis labels & interactive data points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <g key={pt.date}>
                {/* X-Axis Label */}
                <text
                  x={pt.x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fill={isHovered ? '#4F46E5' : '#94A3B8'}
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontSize="10"
                >
                  {pt.displayDate}
                </text>

                {/* Data Dot Point */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#6366F1"
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute z-10 -top-2 bg-slate-900 text-white rounded-xl px-3 py-1.5 shadow-xl text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ left: `${(points[hoveredIndex].x / chartWidth) * 100}%` }}
          >
            <div className="font-bold text-[11px] text-slate-300">
              {points[hoveredIndex].displayDate}
            </div>
            <div className="font-black text-sm text-indigo-300">
              ₹{points[hoveredIndex].revenue.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {points[hoveredIndex].orders} Orders
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

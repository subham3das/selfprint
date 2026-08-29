import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { DailyIncomePoint } from '../../types/transaction.types';

interface DailyIncomeChartProps {
  data: DailyIncomePoint[];
  period: string;
  onPeriodChange: (period: string) => void;
}

export const DailyIncomeChart: React.FC<DailyIncomeChartProps> = ({
  data,
  period,
  onPeriodChange
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const maxY = 1000;
  const chartHeight = 180;
  const chartWidth = 540;
  const paddingX = 40;
  const paddingY = 20;

  // Calculate points
  const points = data.map((item, index) => {
    const x =
      paddingX +
      (index / (data.length - 1 || 1)) * (chartWidth - paddingX * 2);
    const y =
      chartHeight -
      paddingY -
      (item.revenue / maxY) * (chartHeight - paddingY * 2);
    return { x, y, ...item };
  });

  // Construct SVG path for smooth line
  const createSmoothPath = () => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  // Construct SVG path for area gradient fill
  const createAreaPath = () => {
    if (points.length === 0) return '';
    const linePath = createSmoothPath();
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const bottomY = chartHeight - paddingY;
    return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
  };

  const yLabels = [1000, 750, 500, 250, 0];

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Daily Income Overview
        </h2>

        {/* Period Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            <span>{period}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                showDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-1 text-xs space-y-0.5">
              {['Last 7 Days', 'Last 30 Days', 'This Month'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onPeriodChange(opt);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    period === opt
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="relative mt-4">
        <div className="flex">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between text-[11px] font-mono text-slate-400 pr-3 select-none h-[180px] py-1 text-right w-14 shrink-0">
            {yLabels.map((val) => (
              <span key={val}>₹{val.toLocaleString()}</span>
            ))}
          </div>

          {/* SVG Chart Area */}
          <div className="flex-1 relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-[180px] overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="incomeGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              {yLabels.map((val) => {
                const y =
                  chartHeight -
                  paddingY -
                  (val / maxY) * (chartHeight - paddingY * 2);
                return (
                  <line
                    key={val}
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Area Gradient Fill */}
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                d={createAreaPath()}
                fill="url(#incomeGradient)"
              />

              {/* Line Stroke */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                d={createSmoothPath()}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data Points */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === idx ? 6 : 4}
                    className="fill-indigo-600 stroke-white stroke-2 cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {/* Invisible larger hover hit area */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={18}
                    className="fill-transparent cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.1 }}
                className="absolute z-20 bg-slate-900 text-white text-[11px] rounded-xl px-3 py-1.5 shadow-xl pointer-events-none -translate-x-1/2 -translate-y-full -mt-2 whitespace-nowrap"
                style={{
                  left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
                  top: `${(points[hoveredIndex].y / chartHeight) * 100}%`
                }}
              >
                <p className="font-bold text-white">
                  ₹{points[hoveredIndex].revenue.toFixed(2)}
                </p>
                <p className="text-[10px] text-slate-300">
                  {points[hoveredIndex].fullDate} &bull; {points[hoveredIndex].transactionsCount} jobs
                </p>
                {/* Little triangle arrow */}
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
              </motion.div>
            )}

          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between text-[11px] font-medium text-slate-500 pl-16 pr-6 pt-2 select-none">
          {data.map((item) => (
            <span key={item.date}>{item.date}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

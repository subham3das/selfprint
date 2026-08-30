import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RevenueChartPoint, RevenuePeriod } from '../types/revenue.types';

interface RevenueOverviewChartProps {
  points: RevenueChartPoint[];
  period: RevenuePeriod;
  onPeriodChange: (p: RevenuePeriod) => void;
}

export const RevenueOverviewChart: React.FC<RevenueOverviewChartProps> = ({
  points,
  period,
  onPeriodChange
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG Chart Geometry
  const width = 640;
  const height = 240;
  const paddingLeft = 46;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 32;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxRevenue = 80000;

  const coords = points.map((p, i) => {
    const x =
      paddingLeft + (i / Math.max(1, points.length - 1)) * chartWidth;
    const y =
      paddingTop + chartHeight - (p.revenue / maxRevenue) * chartHeight;
    return { x, y, ...p };
  });

  // Generate smooth cubic bezier SVG path
  const createSmoothPath = (pts: typeof coords) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(coords);
  const areaPath = `${linePath} L ${coords[coords.length - 1]?.x || chartWidth} ${
    paddingTop + chartHeight
  } L ${coords[0]?.x || paddingLeft} ${paddingTop + chartHeight} Z`;

  const yLabels = [
    { val: 80000, label: '₹80K' },
    { val: 60000, label: '₹60K' },
    { val: 40000, label: '₹40K' },
    { val: 20000, label: '₹20K' },
    { val: 0, label: '₹0' }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header with Title and Segmented Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Revenue Overview</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400 font-medium">Total Revenue</span>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              ₹25,68,450
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
              ↑ 18.7% vs last month
            </span>
          </div>
        </div>

        {/* Daily / Weekly / Monthly Tabs */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {(['daily', 'weekly', 'monthly'] as RevenuePeriod[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onPeriodChange(tab)}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all capitalize cursor-pointer ${
                period === tab
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Curve Chart */}
      <div className="relative mt-4 w-full h-[240px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueOverviewGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#818CF8" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {yLabels.map((item) => {
            const yPos =
              paddingTop + chartHeight - (item.val / maxRevenue) * chartHeight;
            return (
              <g key={item.val}>
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={width - paddingRight}
                  y2={yPos}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={yPos + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-medium fill-slate-400 font-mono"
                >
                  {item.label}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#revenueOverviewGrad)" />

          {/* Main Curve Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#6366F1"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {coords.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill="#6366F1"
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="transition-all duration-150 shadow-md"
                />
                {/* Invisible larger hit target */}
                <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {coords.map((pt, idx) => {
            if (period === 'daily' && idx % 2 !== 0 && idx !== coords.length - 1)
              return null;
            return (
              <text
                key={`label-${idx}`}
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] font-medium fill-slate-400 font-sans"
              >
                {pt.label}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredIdx !== null && coords[hoveredIdx] && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-slate-700"
            style={{
              left: `${((coords[hoveredIdx].x - paddingLeft) / chartWidth) * 92 + 4}%`,
              top: `${Math.max(10, (coords[hoveredIdx].y / height) * 100 - 30)}%`
            }}
          >
            <p className="text-[10px] text-slate-400 font-medium">
              {coords[hoveredIdx].label} 2025
            </p>
            <p className="font-bold text-emerald-400 text-sm mt-0.5">
              {coords[hoveredIdx].revenueFormatted}
            </p>
            <p className="text-[10px] text-slate-300">
              {coords[hoveredIdx].orders} Orders Processed
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

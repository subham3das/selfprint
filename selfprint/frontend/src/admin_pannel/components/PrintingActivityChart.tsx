import React, { useState } from 'react';
import { AnalyticsPeriod, PrintingActivityDataPoint } from '../types/analytics.types';

interface PrintingActivityChartProps {
  data: PrintingActivityDataPoint[];
  period: AnalyticsPeriod;
  onPeriodChange: (p: AnalyticsPeriod) => void;
}

export const PrintingActivityChart: React.FC<PrintingActivityChartProps> = ({
  data,
  period,
  onPeriodChange
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsPeriod>(period);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const periods: AnalyticsPeriod[] = ['Day', 'Week', 'Month', 'Year'];

  const handleTabChange = (p: AnalyticsPeriod) => {
    setActiveTab(p);
    onPeriodChange(p);
  };

  // Dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const rawData = data && data.length > 0 ? data : [];

  // Max values for scaling
  const maxPages = Math.max(10, ...rawData.map((d) => d.pagesPrinted || 0));
  const maxOrders = Math.max(5, ...rawData.map((d) => d.orders || 0));
  const maxRevenue = Math.max(50, ...rawData.map((d) => d.revenue || 0));

  // Compute points
  const points = rawData.map((d, idx) => {
    const divisor = Math.max(1, rawData.length - 1);
    const x = paddingLeft + (idx / divisor) * chartW;
    const yPages = paddingTop + chartH - ((d.pagesPrinted || 0) / maxPages) * chartH;
    const yOrders = paddingTop + chartH - ((d.orders || 0) / maxOrders) * chartH;
    const yRevenue = paddingTop + chartH - ((d.revenue || 0) / maxRevenue) * chartH;
    return { ...d, x, yPages, yOrders, yRevenue };
  });

  // Smooth SVG Curve helper
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const pagesPath = createSmoothPath(points.map((p) => ({ x: p.x, y: p.yPages })));
  const ordersPath = createSmoothPath(points.map((p) => ({ x: p.x, y: p.yOrders })));
  const revenuePath = createSmoothPath(points.map((p) => ({ x: p.x, y: p.yRevenue })));

  const pagesArea =
    points.length > 0
      ? `${pagesPath} L ${points[points.length - 1].x} ${
          paddingTop + chartH
        } L ${points[0].x} ${paddingTop + chartH} Z`
      : '';
  const revenueArea =
    points.length > 0
      ? `${revenuePath} L ${points[points.length - 1].x} ${
          paddingTop + chartH
        } L ${points[0].x} ${paddingTop + chartH} Z`
      : '';

  const hoveredPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full relative">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h3 className="text-sm font-bold text-slate-900">Printing Activity</h3>

        {/* Segmented Period Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          {periods.map((p) => {
            const isActive = activeTab === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handleTabChange(p)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <span>Pages Printed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span>Orders</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Revenue (₹)</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full relative select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="actPagesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="actRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + ratio * chartH;
            const leftVal = Math.round((1 - ratio) * maxPages);
            const rightVal = Math.round((1 - ratio) * maxRevenue);

            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Left Y Axis */}
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {leftVal >= 1000 ? `${(leftVal / 1000).toFixed(1)}k` : leftVal}
                </text>
                {/* Right Y Axis */}
                <text
                  x={svgWidth - paddingRight + 8}
                  y={y + 3}
                  textAnchor="start"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {rightVal >= 1000 ? `₹${(rightVal / 1000).toFixed(1)}k` : `₹${rightVal}`}
                </text>
              </g>
            );
          })}

          {/* Axis Titles */}
          <text
            x={paddingLeft}
            y={paddingTop - 6}
            textAnchor="start"
            className="text-[9px] fill-slate-400 font-bold"
          >
            Pages / Orders
          </text>
          <text
            x={svgWidth - paddingRight}
            y={paddingTop - 6}
            textAnchor="end"
            className="text-[9px] fill-slate-400 font-bold"
          >
            Revenue (₹)
          </text>

          {/* Gradient Areas */}
          {pagesArea && <path d={pagesArea} fill="url(#actPagesGrad)" />}
          {revenueArea && <path d={revenueArea} fill="url(#actRevGrad)" />}

          {/* Lines */}
          {pagesPath && (
            <path
              d={pagesPath}
              fill="none"
              stroke="#6366F1"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}
          {ordersPath && (
            <path
              d={ordersPath}
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
          {revenuePath && (
            <path
              d={revenuePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* X Axis Labels & Interactive Column triggers */}
          {points.map((p, idx) => (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <text
                x={p.x}
                y={svgHeight - 8}
                textAnchor="middle"
                className={`text-[10px] font-medium transition-colors ${
                  hoveredIndex === idx
                    ? 'fill-indigo-600 font-bold'
                    : 'fill-slate-400'
                }`}
              >
                {p.date}
              </text>

              {/* Dots on nodes */}
              <circle cx={p.x} cy={p.yPages} r="3" fill="#6366F1" />
              <circle cx={p.x} cy={p.yOrders} r="3" fill="#0EA5E9" />
              <circle cx={p.x} cy={p.yRevenue} r="3" fill="#10B981" />

              {/* Invisible full-height hit area */}
              <rect
                x={p.x - 20}
                y={paddingTop}
                width="40"
                height={chartH}
                fill="transparent"
              />
            </g>
          ))}

          {/* Vertical Guide Line on Hover */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={paddingTop}
              x2={hoveredPoint.x}
              y2={paddingTop + chartH}
              stroke="#6366F1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="pointer-events-none"
            />
          )}
        </svg>

        {/* Floating Tooltip Box */}
        {hoveredPoint && (
          <div
            className="absolute z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 shadow-xl text-xs space-y-1 min-w-[170px] pointer-events-none transition-all duration-150"
            style={{
              left: `calc(${(hoveredPoint.x / svgWidth) * 100}% - 85px)`,
              top: '15px'
            }}
          >
            <p className="font-bold text-slate-800 border-b border-slate-100 pb-1">
              {hoveredPoint.date}
            </p>
            <div className="flex items-center justify-between text-slate-600 gap-3">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Pages Printed
              </span>
              <span className="font-mono font-bold text-slate-900">
                {hoveredPoint.pagesPrintedFormatted}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 gap-3">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Orders
              </span>
              <span className="font-mono font-bold text-slate-900">
                {hoveredPoint.orders.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 gap-3">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Revenue
              </span>
              <span className="font-mono font-bold text-slate-900">
                {hoveredPoint.revenueFormatted}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

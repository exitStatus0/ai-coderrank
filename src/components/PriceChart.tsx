'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartDataPoint } from '@/lib/types';

interface PriceChartProps {
  data: ChartDataPoint[];
}

// Custom colors for bars
const COLORS = {
  input: '#00f5ff',   // Cyan
  output: '#b829dd',  // Purple
};

// Gradient colors for different ranks
const RANK_COLORS = [
  '#FFD700', // Gold - 1st
  '#C0C0C0', // Silver - 2nd
  '#CD7F32', // Bronze - 3rd
  '#00f5ff', // Cyan
  '#b829dd', // Purple
  '#ff2d7a', // Pink
  '#39ff14', // Green
  '#ff6b2b', // Orange
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
  payload: ChartDataPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0]?.payload;
  
  return (
    <div className="glass-card p-4 min-w-[200px]">
      <p className="text-[var(--accent-cyan)] font-semibold mb-2">
        #{data.rank} {label}
      </p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Score:</span>
          <span className="text-[var(--text-primary)] font-mono">{data.score}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: COLORS.input }}>Input:</span>
          <span className="text-[var(--text-primary)] font-mono">
            ${data.inputPrice.toFixed(2)}/M
          </span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: COLORS.output }}>Output:</span>
          <span className="text-[var(--text-primary)] font-mono">
            ${data.outputPrice.toFixed(2)}/M
          </span>
        </div>
        <div className="border-t border-white/10 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Total (1:1):</span>
            <span className="text-[var(--accent-green)] font-mono font-semibold">
              ${(data.inputPrice + data.outputPrice).toFixed(2)}/M
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PriceChart({ data }: PriceChartProps) {
  // Sort by total price for the chart
  const sortedData = [...data]
    .filter(d => d.inputPrice > 0 || d.outputPrice > 0)
    .sort((a, b) => (a.inputPrice + a.outputPrice) - (b.inputPrice + b.outputPrice));
  
  if (sortedData.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-[var(--text-muted)]">No pricing data available</p>
      </div>
    );
  }
  
  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
          Price Comparison
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          USD per 1M tokens • Sorted by total cost (lowest first)
        </p>
      </div>
      
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 140, bottom: 20 }}
            barSize={24}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              type="number"
              tickFormatter={(value) => `$${value}`}
              stroke="var(--text-muted)"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              stroke="var(--text-muted)"
              fontSize={11}
              width={130}
              tickFormatter={(value) => value.length > 20 ? value.slice(0, 20) + '...' : value}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {value}
                </span>
              )}
            />
            <Bar
              dataKey="inputPrice"
              name="Input Price"
              stackId="price"
              radius={[0, 0, 0, 0]}
            >
              {sortedData.map((_, index) => (
                <Cell key={`input-${index}`} fill={COLORS.input} fillOpacity={0.8} />
              ))}
            </Bar>
            <Bar
              dataKey="outputPrice"
              name="Output Price"
              stackId="price"
              radius={[0, 4, 4, 0]}
            >
              {sortedData.map((_, index) => (
                <Cell key={`output-${index}`} fill={COLORS.output} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

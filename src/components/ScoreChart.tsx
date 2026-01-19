'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartDataPoint } from '@/lib/types';

interface ScoreChartProps {
  data: ChartDataPoint[];
}

// Gradient colors based on rank
const RANK_COLORS = [
  '#FFD700', // Gold - 1st
  '#E8E8E8', // Silver - 2nd
  '#CD7F32', // Bronze - 3rd
  '#00f5ff', // Cyan
  '#00d4e0', // Lighter cyan
  '#00b8c4', // Even lighter
  '#009ca8', // Teal
  '#00808c', // Darker teal
  '#006470', // Even darker
  '#004854', // Darkest
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

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="glass-card p-4 min-w-[180px]">
      <p className="text-[var(--accent-cyan)] font-semibold mb-2">
        #{data.rank} {data.displayName}
      </p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Arena Score:</span>
          <span className="text-[var(--accent-green)] font-mono font-semibold">
            {data.score}
          </span>
        </div>
        {data.inputPrice > 0 && (
          <div className="flex justify-between text-xs text-[var(--text-muted)]">
            <span>Price:</span>
            <span className="font-mono">
              ${data.inputPrice}/${data.outputPrice}/M
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScoreChart({ data }: ScoreChartProps) {
  // Sort by rank (score is already reflected in rank)
  const sortedData = [...data].sort((a, b) => a.rank - b.rank);
  
  // Find min score for better visualization (don't start at 0)
  const minScore = Math.min(...sortedData.map(d => d.score));
  const domainMin = Math.floor(minScore * 0.95);
  
  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
          Arena Scores
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          LMArena ELO-style rating • Higher is better
        </p>
      </div>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="displayName"
              stroke="var(--text-muted)"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={80}
              tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + '...' : value}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={12}
              domain={[domainMin, 'auto']}
              tickFormatter={(value) => value.toString()}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar
              dataKey="score"
              radius={[4, 4, 0, 0]}
            >
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={RANK_COLORS[index] || RANK_COLORS[RANK_COLORS.length - 1]}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

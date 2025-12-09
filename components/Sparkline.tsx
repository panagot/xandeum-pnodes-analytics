'use client';

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  showTooltip?: boolean;
}

export default function Sparkline({ 
  data, 
  color = '#8b5cf6', 
  height = 40,
  showTooltip = false 
}: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 text-white/20 text-xs">
        No data
      </div>
    );
  }

  const chartData = data.map((value, index) => ({ value, index }));
  const min = Math.min(...data);
  const max = Math.max(...data);
  const trend = data[data.length - 1] > data[0] ? 'up' : data[data.length - 1] < data[0] ? 'down' : 'flat';

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 15, 15, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '4px 8px',
              }}
              labelStyle={{ color: '#fff', fontSize: '11px' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      {trend !== 'flat' && (
        <div className={`absolute top-0 right-0 text-[10px] ${
          trend === 'up' ? 'text-green-400' : 'text-red-400'
        }`}>
          {trend === 'up' ? '↗' : '↘'}
        </div>
      )}
    </div>
  );
}


'use client';

import { HistoricalDataPoint } from '@/lib/history';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartsProps {
  history: HistoricalDataPoint[];
  currentStats: {
    total: number;
    online: number;
    offline: number;
    syncing: number;
    totalStorage: number;
    usedStorage: number;
  };
}

const COLORS = {
  online: '#10b981',
  offline: '#ef4444',
  syncing: '#f59e0b',
  primary: '#8b5cf6',
  purple: '#a78bfa',
  pink: '#ec4899',
};

export function StatusChart({ currentStats }: { currentStats: ChartsProps['currentStats'] }) {
  const data = [
    { name: 'Online', value: currentStats.online, color: COLORS.online },
    { name: 'Syncing', value: currentStats.syncing, color: COLORS.syncing },
    { name: 'Offline', value: currentStats.offline, color: COLORS.offline },
  ].filter(item => item.value > 0);

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
      <h3 className="text-lg font-display font-bold text-white mb-4">
        Node Status Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NodeCountChart({ history }: { history: HistoricalDataPoint[] }) {
  const chartData = history.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    total: point.totalNodes,
    online: point.onlineNodes,
    offline: point.offlineNodes,
    syncing: point.syncingNodes,
  }));

  if (chartData.length === 0) {
    return (
      <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
        <h3 className="text-lg font-display font-bold text-white mb-4">
          Node Count Over Time
        </h3>
        <p className="text-white/60 text-center py-8">
          No historical data yet. Data will appear after a few updates.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
      <h3 className="text-lg font-display font-bold text-white mb-4">
        Node Count Over Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255, 255, 255, 0.4)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.4)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 15, 15, 0.95)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#fff'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke={COLORS.primary} 
            strokeWidth={2}
            name="Total Nodes"
          />
          <Line 
            type="monotone" 
            dataKey="online" 
            stroke={COLORS.online} 
            strokeWidth={2}
            name="Online"
          />
          <Line 
            type="monotone" 
            dataKey="syncing" 
            stroke={COLORS.syncing} 
            strokeWidth={2}
            name="Syncing"
          />
          <Line 
            type="monotone" 
            dataKey="offline" 
            stroke={COLORS.offline} 
            strokeWidth={2}
            name="Offline"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StorageChart({ history }: { history: HistoricalDataPoint[] }) {
  const chartData = history.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    used: Math.round(point.usedStorage / 1000000), // Convert to GB
    total: Math.round(point.totalStorage / 1000000), // Convert to GB
    available: Math.round((point.totalStorage - point.usedStorage) / 1000000),
  }));

  if (chartData.length === 0) {
    return (
      <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
        <h3 className="text-lg font-display font-bold text-white mb-4">
          Storage Usage Over Time
        </h3>
        <p className="text-white/60 text-center py-8">
          No historical data yet. Data will appear after a few updates.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
      <h3 className="text-lg font-display font-bold text-white mb-4">
        Storage Usage Over Time (GB)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255, 255, 255, 0.4)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.4)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 15, 15, 0.95)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#fff'
            }}
          />
          <Legend />
          <Bar dataKey="used" stackId="a" fill="#ef4444" name="Used Storage" />
          <Bar dataKey="available" stackId="a" fill="#10b981" name="Available Storage" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StorageUsageChart({ currentStats }: { currentStats: ChartsProps['currentStats'] }) {
  const usedPercent = currentStats.totalStorage > 0 
    ? (currentStats.usedStorage / currentStats.totalStorage) * 100 
    : 0;
  const availablePercent = 100 - usedPercent;

  const data = [
    { name: 'Used', value: usedPercent, color: '#ef4444' },
    { name: 'Available', value: availablePercent, color: '#10b981' },
  ];

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
      <h3 className="text-lg font-display font-bold text-white mb-4">
        Total Storage Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-white/60">
        <p>
          Used: {(currentStats.usedStorage / 1000000).toFixed(2)} GB / {' '}
          {(currentStats.totalStorage / 1000000).toFixed(2)} GB
        </p>
      </div>
    </div>
  );
}


'use client';

import { PNode } from '@/lib/prpc';
import { Activity, CheckCircle, AlertCircle, TrendingUp, Zap } from 'lucide-react';

interface NetworkHealthProps {
  nodes: PNode[];
}

export default function NetworkHealth({ nodes }: NetworkHealthProps) {
  const total = nodes.length;
  const online = nodes.filter(n => n.status === 'online').length;
  const syncing = nodes.filter(n => n.status === 'syncing').length;
  const offline = nodes.filter(n => n.status === 'offline').length;

  const onlinePercentage = total > 0 ? (online / total) * 100 : 0;
  
  // Calculate average latency
  const nodesWithLatency = nodes.filter(n => n.latency !== undefined);
  const avgLatency = nodesWithLatency.length > 0
    ? nodesWithLatency.reduce((sum, n) => sum + (n.latency || 0), 0) / nodesWithLatency.length
    : 0;

  // Calculate storage efficiency
  const totalStorage = nodes.reduce((sum, n) => sum + (n.storageCapacity || 0), 0);
  const usedStorage = nodes.reduce((sum, n) => sum + (n.storageUsed || 0), 0);
  const storageEfficiency = totalStorage > 0 ? ((totalStorage - usedStorage) / totalStorage) * 100 : 0;

  // Calculate overall health score
  const healthScore = Math.round(
    (onlinePercentage * 0.4) + // 40% weight on online percentage
    (avgLatency < 100 ? 30 : avgLatency < 200 ? 20 : 10) + // 30% weight on latency
    (storageEfficiency * 0.3) // 30% weight on storage efficiency
  );

  const getHealthStatus = () => {
    if (healthScore >= 80) return { label: 'Excellent', color: 'text-green-400', bg: 'from-green-500 to-emerald-500' };
    if (healthScore >= 60) return { label: 'Good', color: 'text-blue-400', bg: 'from-blue-500 to-cyan-500' };
    if (healthScore >= 40) return { label: 'Fair', color: 'text-yellow-400', bg: 'from-yellow-500 to-amber-500' };
    return { label: 'Poor', color: 'text-red-400', bg: 'from-red-500 to-rose-500' };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-display font-bold text-white">Network Health</h3>
      </div>

      {/* Health Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Overall Health Score</span>
          <span className={`text-2xl font-bold ${healthStatus.color}`}>
            {healthScore}/100
          </span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${healthStatus.bg} rounded-full transition-all duration-500`}
            style={{ width: `${healthScore}%` }}
          />
        </div>
        <p className={`text-sm mt-2 ${healthStatus.color} font-medium`}>
          {healthStatus.label} - Network is operating {healthStatus.label.toLowerCase()}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/60">Online</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{online}</p>
          <p className="text-xs text-white/60">{onlinePercentage.toFixed(1)}%</p>
        </div>

        <div className="glass rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-white/60">Syncing</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{syncing}</p>
          <p className="text-xs text-white/60">{total > 0 ? ((syncing / total) * 100).toFixed(1) : 0}%</p>
        </div>

        <div className="glass rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white/60">Avg Latency</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {avgLatency > 0 ? `${avgLatency.toFixed(0)}ms` : 'N/A'}
          </p>
          <p className="text-xs text-white/60">
            {avgLatency < 100 ? 'Excellent' : avgLatency < 200 ? 'Good' : 'Needs attention'}
          </p>
        </div>

        <div className="glass rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-white/60">Storage Free</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{storageEfficiency.toFixed(1)}%</p>
          <p className="text-xs text-white/60">
            {((totalStorage - usedStorage) / 1000000).toFixed(1)} GB available
          </p>
        </div>
      </div>
    </div>
  );
}


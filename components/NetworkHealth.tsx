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
    if (healthScore >= 80) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (healthScore >= 60) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    if (healthScore >= 40) return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { label: 'Poor', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className={`p-2 ${healthStatus.bg} rounded-lg`}>
          <Activity className={`w-5 h-5 ${healthStatus.color}`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network Health</h3>
      </div>

      <div className="space-y-4">
        {/* Health Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Health Score</span>
            <span className={`text-2xl font-bold ${healthStatus.color}`}>
              {healthScore}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                healthScore >= 80 ? 'bg-green-500' :
                healthScore >= 60 ? 'bg-blue-500' :
                healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Status: <span className={healthStatus.color}>{healthStatus.label}</span>
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Online</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{onlinePercentage.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Latency</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{avgLatency.toFixed(0)}ms</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Storage Free</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{storageEfficiency.toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

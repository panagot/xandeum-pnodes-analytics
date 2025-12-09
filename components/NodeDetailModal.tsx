'use client';

import { PNode } from '@/lib/prpc';
import { X, Activity, HardDrive, Clock, MapPin, Wifi, Server, Cpu, Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import Sparkline from './Sparkline';
import { HistoricalDataPoint } from '@/lib/history';

interface NodeDetailModalProps {
  node: PNode;
  history: HistoricalDataPoint[];
  onClose: () => void;
}

export default function NodeDetailModal({ node, history, onClose }: NodeDetailModalProps) {
  const storagePercent = node.storageCapacity 
    ? ((node.storageUsed || 0) / node.storageCapacity) * 100 
    : 0;

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(2)} TB`;
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(2)} GB`;
    if (bytes >= 1000) return `${(bytes / 1000).toFixed(2)} MB`;
    return `${bytes} B`;
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusConfig = () => {
    const configs = {
      online: {
        color: 'from-green-500 to-emerald-500',
        bg: 'from-green-500/20 to-emerald-500/20',
        border: 'border-green-500/50',
        text: 'text-green-400',
        icon: CheckCircle,
        label: 'Online',
      },
      offline: {
        color: 'from-red-500 to-rose-500',
        bg: 'from-red-500/20 to-rose-500/20',
        border: 'border-red-500/50',
        text: 'text-red-400',
        icon: AlertCircle,
        label: 'Offline',
      },
      syncing: {
        color: 'from-yellow-500 to-amber-500',
        bg: 'from-yellow-500/20 to-amber-500/20',
        border: 'border-yellow-500/50',
        text: 'text-yellow-400',
        icon: Activity,
        label: 'Syncing',
      },
    };
    return configs[node.status || 'offline'];
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Get node-specific history if available
  const nodeHistory = history.slice(-20);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 glass-strong border-b border-white/10 p-6 backdrop-blur-xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-gradient-to-br ${statusConfig.bg} rounded-xl`}>
                <Server className={`w-6 h-6 ${statusConfig.text}`} />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold gradient-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {node.id}
                </h2>
                <p className="text-sm text-white/60 mt-1 font-mono">{node.address}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className={`glass rounded-xl p-4 border ${statusConfig.border} ${statusConfig.bg}`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
              <div>
                <p className="text-sm text-white/60">Status</p>
                <p className={`font-semibold ${statusConfig.text}`}>{statusConfig.label}</p>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-white/60 uppercase">Version</span>
              </div>
              <p className="text-lg font-bold text-white">{node.version || 'N/A'}</p>
            </div>

            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-white/60 uppercase">Uptime</span>
              </div>
              <p className="text-lg font-bold text-white">{formatUptime(node.uptime)}</p>
            </div>

            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-white/60 uppercase">Latency</span>
              </div>
              <p className="text-lg font-bold text-white">{node.latency ? `${node.latency}ms` : 'N/A'}</p>
            </div>

            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-xs text-white/60 uppercase">Location</span>
              </div>
              <p className="text-lg font-bold text-white">{node.location || 'Unknown'}</p>
            </div>
          </div>

          {/* Storage Details */}
          <div className="glass rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-display font-bold text-white">Storage</h3>
              </div>
              <span className="text-sm text-white/60">{storagePercent.toFixed(1)}% used</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Used</span>
                  <span className="text-white font-medium">{formatBytes(node.storageUsed)}</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                      storagePercent > 90 ? 'from-red-500 to-rose-500' :
                      storagePercent > 70 ? 'from-yellow-500 to-amber-500' : 
                      'from-green-500 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min(storagePercent, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-white/60 mb-1">Total Capacity</p>
                  <p className="text-lg font-bold text-white">{formatBytes(node.storageCapacity)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">Available</p>
                  <p className="text-lg font-bold text-white">
                    {formatBytes((node.storageCapacity || 0) - (node.storageUsed || 0))}
                  </p>
                </div>
              </div>

              {nodeHistory.length > 1 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/60 mb-2">Storage Trend (Last 20 Updates)</p>
                  <Sparkline 
                    data={nodeHistory.map(h => Math.round((h.usedStorage / h.totalStorage) * 100))}
                    color="#3b82f6"
                    height={40}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Network Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4 border border-white/10">
              <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Network Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Status</span>
                  <span className={statusConfig.text}>{statusConfig.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Last Seen</span>
                  <span className="text-white">
                    {node.lastSeen ? new Date(node.lastSeen).toLocaleString() : 'N/A'}
                  </span>
                </div>
                {node.latency && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Latency</span>
                    <span className={`font-medium ${
                      node.latency < 50 ? 'text-green-400' :
                      node.latency < 100 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {node.latency}ms
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-white/10">
              <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Performance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Uptime</span>
                  <span className="text-white">{formatUptime(node.uptime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Version</span>
                  <span className="text-white font-mono">{node.version || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Location</span>
                  <span className="text-white">{node.location || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Public Key & Address */}
          <div className="glass rounded-xl p-4 border border-white/10">
            <h4 className="text-sm font-semibold text-white/60 mb-3">Technical Details</h4>
            <div className="space-y-3">
              {node.pubkey && (
                <div>
                  <p className="text-xs text-white/60 mb-1">Public Key</p>
                  <p className="text-sm font-mono text-white break-all bg-white/5 p-2 rounded">
                    {node.pubkey}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-white/60 mb-1">Full Address</p>
                <p className="text-sm font-mono text-white break-all bg-white/5 p-2 rounded">
                  {node.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


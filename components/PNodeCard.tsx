'use client';

import { PNode } from '@/lib/prpc';
import { Activity, HardDrive, Clock, MapPin, Wifi, WifiOff, Loader, Copy, Check, Coins, Vote, Database, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { calculateMonthlyXANDRewards } from '@/lib/rewards';
import { formatDistanceToNow } from 'date-fns';

interface PNodeCardProps {
  node: PNode;
  onClick?: () => void;
}

export default function PNodeCard({ node, onClick }: PNodeCardProps) {
  const [copied, setCopied] = useState(false);

  const copyGossipString = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const gossipString = node.address || node.id;
    try {
      await navigator.clipboard.writeText(gossipString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  const statusConfig = {
    online: {
      color: 'from-green-500 to-emerald-500',
      bg: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/50',
      icon: Wifi,
      text: 'text-green-400',
    },
    offline: {
      color: 'from-red-500 to-rose-500',
      bg: 'from-red-500/20 to-rose-500/20',
      border: 'border-red-500/50',
      icon: WifiOff,
      text: 'text-red-400',
    },
    syncing: {
      color: 'from-yellow-500 to-amber-500',
      bg: 'from-yellow-500/20 to-amber-500/20',
      border: 'border-yellow-500/50',
      icon: Loader,
      text: 'text-yellow-400',
    },
  };

  const status = node.status || 'offline';
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const storagePercent = node.storageCapacity 
    ? ((node.storageUsed || 0) / node.storageCapacity) * 100 
    : 0;
  
  // Calculate XAND rewards
  const estimatedRewards = calculateMonthlyXANDRewards(node);

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
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        // Right-click to add to comparison (if implemented)
      }}
      className={`relative group glass rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 p-6 ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-display font-bold text-white truncate flex-1">
              {node.id}
            </h3>
            <button
              onClick={copyGossipString}
              className="p-1.5 glass rounded-lg border border-white/10 hover:border-purple-500/50 text-white/60 hover:text-white transition-all flex-shrink-0"
              title="Copy gossip string"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-white/40 font-mono truncate">
            {node.address}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <div className={`relative w-3 h-3 rounded-full bg-gradient-to-br ${config.color}`}>
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} animate-ping opacity-75`} />
          </div>
          <StatusIcon className={`w-4 h-4 ${config.text} ${status === 'syncing' ? 'animate-spin' : ''}`} />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {node.version && (
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 bg-white/5 rounded-lg">
              <Activity className="w-3 h-3 text-white/60" />
            </div>
            <span className="text-white/80 font-medium">v{node.version}</span>
          </div>
        )}

        {node.storageCapacity && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-white/5 rounded-lg">
                  <HardDrive className="w-3 h-3 text-white/60" />
                </div>
                <span className="text-white/60">Storage</span>
              </div>
              <span className="text-sm font-medium text-white">
                {formatBytes(node.storageUsed)} / {formatBytes(node.storageCapacity)}
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                  storagePercent > 90 ? 'from-red-500 to-rose-500' :
                  storagePercent > 70 ? 'from-yellow-500 to-amber-500' : 
                  'from-green-500 to-emerald-500'
                }`}
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-white/40 mt-1">{storagePercent.toFixed(1)}% used</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
          {node.uptime !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-white/5 rounded-lg">
                <Clock className="w-3 h-3 text-white/60" />
              </div>
              <span className="text-white/80">
                {formatUptime(node.uptime)}
              </span>
            </div>
          )}
          
          {node.location && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-white/5 rounded-lg">
                <MapPin className="w-3 h-3 text-white/60" />
              </div>
              <span className="text-white/80 truncate">
                {node.location}
              </span>
            </div>
          )}

          {node.latency !== undefined && (
            <div className="flex items-center gap-2 text-sm col-span-2">
              <span className="text-white/60">Latency:</span>
              <span className="text-white font-medium">{node.latency}ms</span>
            </div>
          )}
        </div>

        {/* XAND Rewards */}
        {estimatedRewards > 0 && (
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-lg">
                  <Coins className="w-3 h-3 text-yellow-400" />
                </div>
                <span className="text-white/60">Est. Monthly Rewards</span>
              </div>
              <span className="text-white font-bold text-yellow-400">
                {estimatedRewards.toFixed(2)} XAND
              </span>
            </div>
          </div>
        )}

        {/* Consensus & Storage Metrics */}
        {(node.lastVote || node.lastBlockStored || node.blocksBehind !== undefined) && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            {node.lastVote && (
              <div className="flex items-center gap-2 text-xs">
                <Vote className="w-3 h-3 text-white/40" />
                <span className="text-white/60">Last Vote:</span>
                <span className="text-white/80">
                  {formatDistanceToNow(new Date(node.lastVote), { addSuffix: true })}
                </span>
              </div>
            )}
            {node.lastBlockStored && (
              <div className="flex items-center gap-2 text-xs">
                <Database className="w-3 h-3 text-white/40" />
                <span className="text-white/60">Last Block:</span>
                <span className="text-white/80">
                  {formatDistanceToNow(new Date(node.lastBlockStored), { addSuffix: true })}
                </span>
              </div>
            )}
            {node.blocksBehind !== undefined && (
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle className={`w-3 h-3 ${node.blocksBehind > 100 ? 'text-red-400' : node.blocksBehind > 10 ? 'text-yellow-400' : 'text-green-400'}`} />
                <span className="text-white/60">Blocks Behind:</span>
                <span className={`font-medium ${node.blocksBehind > 100 ? 'text-red-400' : node.blocksBehind > 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {node.blocksBehind}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

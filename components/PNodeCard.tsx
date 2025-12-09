'use client';

import { PNode } from '@/lib/prpc';
import { HardDrive, Clock, MapPin, Wifi, WifiOff, Loader, Copy, Check, Coins, Vote, Database, AlertCircle, TrendingUp } from 'lucide-react';
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
      badge: 'badge-success',
      icon: Wifi,
      color: 'text-green-600 dark:text-green-400',
    },
    offline: {
      badge: 'badge-error',
      icon: WifiOff,
      color: 'text-red-600 dark:text-red-400',
    },
    syncing: {
      badge: 'badge-warning',
      icon: Loader,
      color: 'text-yellow-600 dark:text-yellow-400',
    },
  };

  const status = node.status || 'offline';
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const storagePercent = node.storageCapacity 
    ? ((node.storageUsed || 0) / node.storageCapacity) * 100 
    : 0;
  
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
      className="card-hover p-5 cursor-pointer fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {node.id}
            </h3>
            <span className={config.badge}>
              <StatusIcon className={`w-3 h-3 ${config.color}`} />
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
            {node.address}
          </p>
        </div>
        <button
          onClick={copyGossipString}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
          title="Copy gossip string"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <HardDrive className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Storage</span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatBytes(node.storageUsed)} / {formatBytes(node.storageCapacity)}
          </p>
          <div className="mt-1.5 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                storagePercent > 90 ? 'bg-red-500' :
                storagePercent > 70 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Uptime</span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatUptime(node.uptime)}
          </p>
        </div>

        {node.location && (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Location</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {node.location}
            </p>
          </div>
        )}

        {node.latency !== undefined && (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Latency</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {node.latency}ms
            </p>
          </div>
        )}
      </div>

      {/* XAND Rewards */}
      {estimatedRewards > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Est. Monthly</span>
            </div>
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              {estimatedRewards.toFixed(2)} XAND
            </span>
          </div>
        </div>
      )}

      {/* Consensus Metrics */}
      {(node.lastVote || node.blocksBehind !== undefined) && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
          {node.lastVote && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <Vote className="w-3 h-3" />
                <span>Last Vote</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                {formatDistanceToNow(new Date(node.lastVote), { addSuffix: true })}
              </span>
            </div>
          )}
          {node.blocksBehind !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <Database className="w-3 h-3" />
                <span>Blocks Behind</span>
              </div>
              <span className={`font-medium ${
                node.blocksBehind > 100 ? 'text-red-600 dark:text-red-400' : 
                node.blocksBehind > 10 ? 'text-yellow-600 dark:text-yellow-400' : 
                'text-green-600 dark:text-green-400'
              }`}>
                {node.blocksBehind}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

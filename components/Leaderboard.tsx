'use client';

import { PNode } from '@/lib/prpc';
import { Trophy, Medal, Award, TrendingUp, Zap, HardDrive, Clock } from 'lucide-react';
import { useState } from 'react';

interface LeaderboardProps {
  nodes: PNode[];
  onNodeClick?: (node: PNode) => void;
}

type SortMetric = 'uptime' | 'storage' | 'latency' | 'health';

export default function Leaderboard({ nodes, onNodeClick }: LeaderboardProps) {
  const [sortMetric, setSortMetric] = useState<SortMetric>('health');

  const calculateHealthScore = (node: PNode): number => {
    let score = 0;
    
    // Status (40 points)
    if (node.status === 'online') score += 40;
    else if (node.status === 'syncing') score += 20;
    else score += 0;
    
    // Uptime (30 points) - normalize to 30 days
    if (node.uptime) {
      const uptimeDays = node.uptime / 86400;
      score += Math.min(30, (uptimeDays / 30) * 30);
    }
    
    // Storage efficiency (20 points) - lower usage is better
    if (node.storageCapacity) {
      const usagePercent = (node.storageUsed || 0) / node.storageCapacity;
      score += (1 - usagePercent) * 20;
    }
    
    // Latency (10 points) - lower is better
    if (node.latency) {
      if (node.latency < 50) score += 10;
      else if (node.latency < 100) score += 7;
      else if (node.latency < 200) score += 4;
      else score += 1;
    }
    
    return Math.round(score);
  };

  const rankedNodes = nodes
    .map(node => ({
      node,
      score: sortMetric === 'health' 
        ? calculateHealthScore(node)
        : sortMetric === 'uptime'
        ? node.uptime || 0
        : sortMetric === 'storage'
        ? node.storageCapacity || 0
        : node.latency ? 10000 - node.latency : 0, // Invert latency (lower is better)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-white/40 font-bold">#{rank + 1}</span>;
  };

  const formatValue = (node: PNode, metric: SortMetric) => {
    switch (metric) {
      case 'health':
        return `${calculateHealthScore(node)}/100`;
      case 'uptime':
        const days = Math.floor((node.uptime || 0) / 86400);
        return `${days}d`;
      case 'storage':
        return `${((node.storageCapacity || 0) / 1000000).toFixed(1)} GB`;
      case 'latency':
        return `${node.latency || 'N/A'}ms`;
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-display font-bold text-white">Top Performers</h3>
        </div>
        <div className="flex gap-2 glass rounded-lg p-1 border border-white/10">
          {(['health', 'uptime', 'storage', 'latency'] as SortMetric[]).map((metric) => (
            <button
              key={metric}
              onClick={() => setSortMetric(metric)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                sortMetric === metric
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {rankedNodes.map(({ node, score }, index) => (
          <div
            key={node.id}
            onClick={() => onNodeClick?.(node)}
            className={`glass rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer group ${
              index < 3 ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10">
                {getRankIcon(index)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white truncate">{node.id}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      node.status === 'online' ? 'bg-green-500/20 text-green-400' :
                      node.status === 'syncing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {node.status}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {formatValue(node, sortMetric)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-white/60">
                  {node.uptime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{Math.floor(node.uptime / 86400)}d</span>
                    </div>
                  )}
                  {node.storageCapacity && (
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      <span>{((node.storageCapacity || 0) / 1000000).toFixed(0)} GB</span>
                    </div>
                  )}
                  {node.latency && (
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>{node.latency}ms</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


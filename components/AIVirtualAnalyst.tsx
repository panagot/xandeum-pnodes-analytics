'use client';

import { PNode } from '@/lib/prpc';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Zap } from 'lucide-react';
import { useState } from 'react';

interface AIVirtualAnalystProps {
  nodes: PNode[];
  history: any[];
}

export default function AIVirtualAnalyst({ nodes, history }: AIVirtualAnalystProps) {
  const [expanded, setExpanded] = useState(false);

  const onlineCount = nodes.filter(n => n.status === 'online').length;
  const totalCount = nodes.length;
  const onlinePercentage = totalCount > 0 ? (onlineCount / totalCount) * 100 : 0;

  type InsightType = 'success' | 'warning' | 'info';

  // AI-generated insights
  const insights: Array<{
    type: InsightType;
    icon: typeof TrendingUp;
    title: string;
    message: string;
    action: string;
  }> = [
    {
      type: 'success',
      icon: TrendingUp,
      title: 'Network Health Excellent',
      message: `${onlinePercentage.toFixed(1)}% of nodes are online. Network is operating at optimal capacity.`,
      action: 'View detailed metrics',
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Storage Utilization',
      message: `${nodes.filter(n => {
        if (!n.storageCapacity) return false;
        const usage = (n.storageUsed || 0) / n.storageCapacity;
        return usage > 0.8;
      }).length} nodes are above 80% storage capacity.`,
      action: 'Review storage distribution',
    },
    {
      type: 'info',
      icon: Lightbulb,
      title: 'Performance Tip',
      message: `Average latency is ${Math.round(
        nodes.filter(n => n.latency).reduce((sum, n) => sum + (n.latency || 0), 0) / 
        nodes.filter(n => n.latency).length || 0
      )}ms. Consider optimizing nodes with latency > 200ms.`,
      action: 'View latency analysis',
    },
  ];

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md animate-pulse" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">AI Virtual Analyst</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white/60 hover:text-white transition-colors text-sm"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="space-y-3">
        {insights.slice(0, expanded ? insights.length : 1).map((insight, index) => {
          const Icon = insight.icon;
          const colorClasses: Record<InsightType, string> = {
            success: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
            warning: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
            info: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
          };

          return (
            <div
              key={index}
              className={`glass rounded-xl p-4 border bg-gradient-to-r ${colorClasses[insight.type]} transition-all hover:scale-[1.02] cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'success' ? 'bg-green-500/20' :
                  insight.type === 'warning' ? 'bg-yellow-500/20' :
                  'bg-blue-500/20'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    insight.type === 'success' ? 'text-green-400' :
                    insight.type === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white mb-1">{insight.title}</h4>
                  <p className="text-xs text-white/70 mb-2">{insight.message}</p>
                  <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {insight.action}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!expanded && insights.length > 1 && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-3 text-sm text-white/60 hover:text-white transition-colors w-full text-center"
        >
          + {insights.length - 1} more insights
        </button>
      )}
    </div>
  );
}


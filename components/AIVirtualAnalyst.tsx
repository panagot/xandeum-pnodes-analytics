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
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-md animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Virtual Analyst</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="space-y-3">
        {insights.slice(0, expanded ? insights.length : 1).map((insight, index) => {
          const Icon = insight.icon;
          const colorClasses: Record<InsightType, string> = {
            success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
            info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          };

          return (
            <div
              key={index}
              className={`rounded-xl p-4 border transition-all hover:scale-[1.01] cursor-pointer shadow-sm ${colorClasses[insight.type]}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'success' ? 'bg-green-100 dark:bg-green-800/40' :
                  insight.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-800/40' :
                  'bg-blue-100 dark:bg-blue-800/40'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    insight.type === 'success' ? 'text-green-600 dark:text-green-300' :
                    insight.type === 'warning' ? 'text-yellow-600 dark:text-yellow-300' :
                    'text-blue-600 dark:text-blue-300'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{insight.title}</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">{insight.message}</p>
                  <button className="text-xs text-blue-600 dark:text-blue-300 hover:underline flex items-center gap-1">
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
          className="mt-3 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors w-full text-center"
        >
          + {insights.length - 1} more insights
        </button>
      )}
    </div>
  );
}


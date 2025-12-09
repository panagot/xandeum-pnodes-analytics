'use client';

import { PNode } from '@/lib/prpc';
import { HistoricalDataPoint } from '@/lib/history';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Lightbulb, Zap } from 'lucide-react';
import { useState } from 'react';

interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
  change?: number;
  icon: React.ReactNode;
}

interface InsightsProps {
  nodes: PNode[];
  history: HistoricalDataPoint[];
  stats: {
    total: number;
    online: number;
    offline: number;
    syncing: number;
    totalStorage: number;
    usedStorage: number;
  };
}

export default function Insights({ nodes, history, stats }: InsightsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    // Network health insight
    const onlinePercentage = stats.total > 0 ? (stats.online / stats.total) * 100 : 0;
    if (onlinePercentage >= 90) {
      insights.push({
        id: 'health',
        type: 'positive',
        title: 'Excellent Network Health',
        description: `${onlinePercentage.toFixed(1)}% of nodes are online. Your network is operating at peak performance.`,
        metric: `${onlinePercentage.toFixed(1)}%`,
        icon: <CheckCircle className="w-5 h-5" />,
      });
    } else if (onlinePercentage < 70) {
      insights.push({
        id: 'health',
        type: 'warning',
        title: 'Network Health Concern',
        description: `Only ${onlinePercentage.toFixed(1)}% of nodes are online. Consider investigating offline nodes.`,
        metric: `${onlinePercentage.toFixed(1)}%`,
        icon: <AlertCircle className="w-5 h-5" />,
      });
    }

    // Storage utilization
    const storageUtilization = stats.totalStorage > 0 
      ? (stats.usedStorage / stats.totalStorage) * 100 
      : 0;
    if (storageUtilization > 80) {
      insights.push({
        id: 'storage',
        type: 'warning',
        title: 'High Storage Utilization',
        description: `Network storage is ${storageUtilization.toFixed(1)}% utilized. Consider adding more capacity.`,
        metric: `${storageUtilization.toFixed(1)}%`,
        icon: <AlertCircle className="w-5 h-5" />,
      });
    }

    // Trend analysis
    if (history.length >= 2) {
      const recent = history.slice(-5);
      const nodeTrend = recent[recent.length - 1].totalNodes - recent[0].totalNodes;
      if (Math.abs(nodeTrend) > 0) {
        insights.push({
          id: 'trend',
          type: nodeTrend > 0 ? 'positive' : 'info',
          title: nodeTrend > 0 ? 'Growing Network' : 'Network Change Detected',
          description: nodeTrend > 0
            ? `Network has grown by ${nodeTrend} nodes in recent updates.`
            : `Network size changed by ${Math.abs(nodeTrend)} nodes.`,
          change: nodeTrend,
          icon: nodeTrend > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
        });
      }
    }

    // Syncing nodes
    if (stats.syncing > 0) {
      insights.push({
        id: 'syncing',
        type: 'info',
        title: 'Nodes Synchronizing',
        description: `${stats.syncing} node${stats.syncing > 1 ? 's are' : ' is'} currently syncing. This is normal during network updates.`,
        metric: `${stats.syncing}`,
        icon: <Zap className="w-5 h-5" />,
      });
    }

    // Performance insight
    const avgLatency = nodes
      .filter(n => n.latency !== undefined)
      .reduce((sum, n) => sum + (n.latency || 0), 0) / 
      nodes.filter(n => n.latency !== undefined).length;
    
    if (avgLatency > 0 && avgLatency < 100) {
      insights.push({
        id: 'latency',
        type: 'positive',
        title: 'Optimal Network Latency',
        description: `Average latency is ${avgLatency.toFixed(0)}ms. Network is responding quickly.`,
        metric: `${avgLatency.toFixed(0)}ms`,
        icon: <Zap className="w-5 h-5" />,
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  };

  const insights = generateInsights();

  if (insights.length === 0) {
    return null;
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'positive':
        return {
          bg: 'from-green-500/20 to-emerald-500/20',
          border: 'border-green-500/30',
          icon: 'text-green-400',
          title: 'text-green-300',
        };
      case 'warning':
        return {
          bg: 'from-yellow-500/20 to-amber-500/20',
          border: 'border-yellow-500/30',
          icon: 'text-yellow-400',
          title: 'text-yellow-300',
        };
      default:
        return {
          bg: 'from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-500/30',
          icon: 'text-blue-400',
          title: 'text-blue-300',
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-display font-bold text-white">AI Insights</h3>
      </div>
      {insights.map((insight) => {
        const styles = getTypeStyles(insight.type);
        return (
          <div
            key={insight.id}
            className={`glass rounded-xl border ${styles.border} ${styles.bg} p-4 cursor-pointer transition-all hover:scale-[1.02]`}
            onClick={() => setExpanded(expanded === insight.id ? null : insight.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${styles.bg} ${styles.icon}`}>
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-sm font-semibold ${styles.title}`}>
                    {insight.title}
                  </h4>
                  {insight.metric && (
                    <span className="text-xs font-mono text-white/60 bg-white/5 px-2 py-1 rounded">
                      {insight.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  {insight.description}
                </p>
                {expanded === insight.id && insight.change !== undefined && (
                  <div className="mt-2 text-xs text-white/50">
                    Change: {insight.change > 0 ? '+' : ''}{insight.change}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


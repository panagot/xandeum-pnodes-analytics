'use client';

import { HistoricalDataPoint } from '@/lib/history';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityTimelineProps {
  history: HistoricalDataPoint[];
}

export default function ActivityTimeline({ history }: ActivityTimelineProps) {
  if (history.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Activity Timeline
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">No activity data yet</p>
      </div>
    );
  }

  const activities = history.slice(-10).reverse().map((point, index, array) => {
    const prevPoint = index < array.length - 1 ? array[index + 1] : null;
    const nodeChange = prevPoint ? point.totalNodes - prevPoint.totalNodes : 0;
    const onlineChange = prevPoint ? point.onlineNodes - prevPoint.onlineNodes : 0;
    
    return {
      ...point,
      nodeChange,
      onlineChange,
      timestamp: new Date(point.timestamp),
    };
  });

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-white/40" />;
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600" />
        Activity Timeline
      </h3>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.timestamp.getTime()} className="relative">
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div className="absolute left-4 top-8 w-0.5 h-full bg-white/10" />
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="relative z-10 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              </div>

              {/* Content */}
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {activity.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Nodes</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{activity.totalNodes}</p>
                      {activity.nodeChange !== 0 && (
                        <div className="flex items-center gap-1">
                          {getChangeIcon(activity.nodeChange)}
                          <span className={`text-xs font-medium ${
                            activity.nodeChange > 0 ? 'text-green-600 dark:text-green-300' : 'text-red-500 dark:text-red-300'
                          }`}>
                            {Math.abs(activity.nodeChange)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Online</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-green-600 dark:text-green-300">{activity.onlineNodes}</p>
                      {activity.onlineChange !== 0 && (
                        <div className="flex items-center gap-1">
                          {getChangeIcon(activity.onlineChange)}
                          <span className={`text-xs font-medium ${
                            activity.onlineChange > 0 ? 'text-green-600 dark:text-green-300' : 'text-red-500 dark:text-red-300'
                          }`}>
                            {Math.abs(activity.onlineChange)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Syncing</p>
                    <p className="text-lg font-bold text-yellow-600 dark:text-yellow-300">{activity.syncingNodes}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Storage</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {(activity.totalStorage / 1000000).toFixed(1)} GB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


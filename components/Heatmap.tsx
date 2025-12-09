'use client';

import { PNode } from '@/lib/prpc';
import { useState } from 'react';
import { MapPin } from 'lucide-react';

interface HeatmapProps {
  nodes: PNode[];
  onNodeClick?: (node: PNode) => void;
}

export default function Heatmap({ nodes, onNodeClick }: HeatmapProps) {
  const [selectedMetric, setSelectedMetric] = useState<'count' | 'storage' | 'latency'>('count');

  // Group nodes by location
  const locationMap = new Map<string, PNode[]>();
  nodes.forEach(node => {
    const location = node.location || 'Unknown';
    if (!locationMap.has(location)) {
      locationMap.set(location, []);
    }
    locationMap.get(location)!.push(node);
  });

  const getLocationValue = (locationNodes: PNode[]) => {
    switch (selectedMetric) {
      case 'count':
        return locationNodes.length;
      case 'storage':
        return locationNodes.reduce((sum, n) => sum + (n.storageCapacity || 0), 0) / 1000000; // GB
      case 'latency':
        const latencies = locationNodes.filter(n => n.latency !== undefined).map(n => n.latency!);
        return latencies.length > 0 
          ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length 
          : 0;
      default:
        return 0;
    }
  };

  const locations = Array.from(locationMap.entries()).map(([location, locationNodes]) => ({
    location,
    nodes: locationNodes,
    value: getLocationValue(locationNodes),
    online: locationNodes.filter(n => n.status === 'online').length,
    total: locationNodes.length,
  }));

  const maxValue = Math.max(...locations.map(l => l.value), 1);

  const getIntensity = (value: number) => {
    const normalized = value / maxValue;
    if (normalized > 0.8) return 'high';
    if (normalized > 0.5) return 'medium';
    if (normalized > 0.2) return 'low';
    return 'minimal';
  };

  const getColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'from-purple-500 to-pink-500';
      case 'medium': return 'from-blue-500 to-purple-500';
      case 'low': return 'from-cyan-500 to-blue-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Geographic Distribution</h3>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
          {(['count', 'storage', 'latency'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                selectedMetric === metric
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {locations.map(({ location, nodes: locationNodes, value, online, total }) => {
          const intensity = getIntensity(value);
          const color = getColor(intensity);
          
          return (
            <div
              key={location}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => onNodeClick?.(locationNodes[0])}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 pointer-events-none`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 bg-gradient-to-br ${color} rounded-lg text-white`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{location}</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${color}`} />
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {selectedMetric === 'count' && 'Nodes'}
                      {selectedMetric === 'storage' && 'Storage (GB)'}
                      {selectedMetric === 'latency' && 'Avg Latency (ms)'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedMetric === 'latency' 
                        ? value.toFixed(0)
                        : selectedMetric === 'storage'
                        ? value.toFixed(1)
                        : value}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>{online} online</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span>{total} total</span>
                  </div>

                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(value / maxValue) * 100}%`, backgroundImage: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-slate-500 to-slate-600" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}


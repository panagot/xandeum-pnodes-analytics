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
    <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-display font-bold text-white">Geographic Distribution</h3>
        </div>
        <div className="flex gap-2 glass rounded-lg p-1 border border-white/10">
          {(['count', 'storage', 'latency'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                selectedMetric === metric
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
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
              className={`glass rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden`}
              onClick={() => onNodeClick?.(locationNodes[0])}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 bg-gradient-to-br ${color} rounded-lg opacity-80`}>
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">{location}</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${color}`}>
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${color} animate-pulse opacity-75`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-white/60 mb-1">
                      {selectedMetric === 'count' && 'Nodes'}
                      {selectedMetric === 'storage' && 'Storage (GB)'}
                      {selectedMetric === 'latency' && 'Avg Latency (ms)'}
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {selectedMetric === 'latency' 
                        ? value.toFixed(0)
                        : selectedMetric === 'storage'
                        ? value.toFixed(1)
                        : value}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-white/60">{online} online</span>
                    </div>
                    <span className="text-white/40">•</span>
                    <span className="text-white/60">{total} total</span>
                  </div>

                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`}
                      style={{ width: `${(value / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/60">
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


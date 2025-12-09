'use client';

import { PNode } from '@/lib/prpc';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NodeComparisonProps {
  nodes: PNode[];
  selectedNodes: PNode[];
  onNodeSelect: (node: PNode) => void;
  onNodeRemove: (nodeId: string) => void;
  onClear: () => void;
}

export default function NodeComparison({ 
  nodes,
  selectedNodes, 
  onNodeSelect,
  onNodeRemove, 
  onClear 
}: NodeComparisonProps) {


  const compareMetric = (metric: keyof PNode, format?: (val: any) => string) => {
    const values = selectedNodes.map(n => n[metric]);
    const max = Math.max(...values.filter(v => v !== undefined && v !== null) as number[]);
    const min = Math.min(...values.filter(v => v !== undefined && v !== null) as number[]);
    
    return selectedNodes.map(node => {
      const value = node[metric];
      const isBest = value === max && max !== min;
      const isWorst = value === min && max !== min;
      
      return {
        node,
        value: format ? format(value) : value,
        isBest,
        isWorst,
      };
    });
  };

  if (selectedNodes.length === 0) {
    return (
      <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
        <h3 className="text-lg font-display font-bold text-white mb-4">Compare Nodes</h3>
        <p className="text-white/60 text-center mb-6">
          Select up to 4 nodes to compare their metrics side-by-side
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {nodes.map(node => (
            <button
              key={node.id}
              onClick={() => onNodeSelect(node)}
              disabled={selectedNodes.length >= 4}
              className="px-4 py-3 glass rounded-lg border border-white/10 hover:border-purple-500/50 text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium truncate">{node.id}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  node.status === 'online' ? 'bg-green-500/20 text-green-400' :
                  node.status === 'syncing' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {node.status}
                </span>
              </div>
              <div className="text-xs text-white/60">
                {node.location || 'Unknown'}
              </div>
            </button>
          ))}
        </div>
        {selectedNodes.length >= 4 && (
          <p className="text-yellow-400 text-sm text-center mt-4">
            Maximum of 4 nodes can be compared at once
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display font-bold text-white">Node Comparison</h3>
          <p className="text-sm text-white/60 mt-1">
            {selectedNodes.length} of 4 nodes selected
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedNodes.length < 4 && (
            <div className="glass rounded-lg p-2 border border-white/10">
              <select
                onChange={(e) => {
                  const node = nodes.find(n => n.id === e.target.value);
                  if (node && !selectedNodes.find(n => n.id === node.id)) {
                    onNodeSelect(node);
                  }
                  e.target.value = '';
                }}
                className="bg-transparent text-white text-sm border-none outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Add node...</option>
                {nodes
                  .filter(n => !selectedNodes.find(sn => sn.id === n.id))
                  .map(node => (
                    <option key={node.id} value={node.id} className="bg-slate-900">
                      {node.id}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <button
            onClick={onClear}
            className="text-white/60 hover:text-white transition-colors px-3 py-2 glass rounded-lg border border-white/10 hover:border-white/20"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-semibold text-white/60">Metric</th>
              {selectedNodes.map(node => (
                <th key={node.id} className="px-4 py-3 text-left text-xs font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[120px]">{node.id}</span>
                    <button
                      onClick={() => onNodeRemove(node.id)}
                      className="text-white/40 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            <tr>
              <td className="px-4 py-3 text-sm text-white/60">Status</td>
              {selectedNodes.map(node => (
                <td key={node.id} className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    node.status === 'online' ? 'bg-green-500/20 text-green-400' :
                    node.status === 'syncing' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {node.status}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-white/60">Uptime</td>
              {compareMetric('uptime', (val) => {
                if (!val) return 'N/A';
                const days = Math.floor(val / 86400);
                return `${days}d`;
              }).map(({ node, value, isBest, isWorst }) => (
                <td key={node.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white">{value}</span>
                    {isBest && <TrendingUp className="w-4 h-4 text-green-400" />}
                    {isWorst && <TrendingDown className="w-4 h-4 text-red-400" />}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-white/60">Storage Capacity</td>
              {compareMetric('storageCapacity', (val) => {
                if (!val) return 'N/A';
                return `${(val / 1000000).toFixed(1)} GB`;
              }).map(({ node, value, isBest, isWorst }) => (
                <td key={node.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white">{value}</span>
                    {isBest && <TrendingUp className="w-4 h-4 text-green-400" />}
                    {isWorst && <TrendingDown className="w-4 h-4 text-red-400" />}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-white/60">Storage Used</td>
              {compareMetric('storageUsed', (val) => {
                if (!val) return 'N/A';
                return `${(val / 1000000).toFixed(1)} GB`;
              }).map(({ node, value, isBest, isWorst }) => (
                <td key={node.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white">{value}</span>
                    {isBest && <TrendingUp className="w-4 h-4 text-green-400" />}
                    {isWorst && <TrendingDown className="w-4 h-4 text-red-400" />}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-white/60">Latency</td>
              {compareMetric('latency', (val) => {
                if (!val) return 'N/A';
                return `${val}ms`;
              }).map(({ node, value, isBest, isWorst }) => (
                <td key={node.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white">{value}</span>
                    {isBest && <TrendingUp className="w-4 h-4 text-green-400" />}
                    {isWorst && <TrendingDown className="w-4 h-4 text-red-400" />}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-white/60">Version</td>
              {selectedNodes.map(node => (
                <td key={node.id} className="px-4 py-3 text-white font-mono">
                  {node.version || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-white/60">Location</td>
              {selectedNodes.map(node => (
                <td key={node.id} className="px-4 py-3 text-white">
                  {node.location || 'Unknown'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


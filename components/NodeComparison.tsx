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
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Compare Nodes</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
          Select up to 4 nodes to compare their metrics side-by-side
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {nodes.map(node => (
            <button
              key={node.id}
              onClick={() => onNodeSelect(node)}
              disabled={selectedNodes.length >= 4}
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 hover:border-blue-400 dark:hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium truncate">{node.id}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  node.status === 'online' ? 'bg-green-100 text-green-700' :
                  node.status === 'syncing' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {node.status}
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {node.location || 'Unknown'}
              </div>
            </button>
          ))}
        </div>
        {selectedNodes.length >= 4 && (
          <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center mt-4">
            Maximum of 4 nodes can be compared at once
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Node Comparison</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {selectedNodes.length} of 4 nodes selected
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedNodes.length < 4 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
              <select
                onChange={(e) => {
                  const node = nodes.find(n => n.id === e.target.value);
                  if (node && !selectedNodes.find(n => n.id === node.id)) {
                    onNodeSelect(node);
                  }
                  e.target.value = '';
                }}
                className="bg-transparent text-gray-900 dark:text-gray-100 text-sm border-none outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Add node...</option>
                {nodes
                  .filter(n => !selectedNodes.find(sn => sn.id === n.id))
                  .map(node => (
                    <option key={node.id} value={node.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                      {node.id}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <button
            onClick={onClear}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Metric</th>
              {selectedNodes.map(node => (
                <th key={node.id} className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[120px]">{node.id}</span>
                    <button
                      onClick={() => onNodeRemove(node.id)}
                      className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Status</td>
              {selectedNodes.map(node => (
                <td key={node.id} className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    node.status === 'online' ? 'bg-green-100 text-green-700' :
                    node.status === 'syncing' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {node.status}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Uptime</td>
              {compareMetric('uptime', (val) => {
                if (!val) return 'N/A';
                const days = Math.floor(val / 86400);
                return `${days}d`;
              }).map(({ node, value, isBest, isWorst }) => (
                <td key={node.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white">{value}</span>
                    {isBest && <TrendingUp className="w-4 h-4 text-green-600" />}
                    {isWorst && <TrendingDown className="w-4 h-4 text-red-500" />}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Storage Capacity</td>
              {compareMetric('storageCapacity', (val) => {
                if (!val) return 'N/A';
                return `${(val / 1000000).toFixed(1)} GB`;
              }).map(({ node, value, isBest, isWorst }) => (
                <td key={node.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white">{value}</span>
                    {isBest && <TrendingUp className="w-4 h-4 text-green-600" />}
                    {isWorst && <TrendingDown className="w-4 h-4 text-red-500" />}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Storage Used</td>
              {compareMetric('storageUsed', (val) => {
                if (!val) return 'N/A';
                return `${(val / 1000000).toFixed(1)} GB`;
              }).map(({ node, value, isBest, isWorst }) => (
                <td key={node.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white">{value}</span>
                    {isBest && <TrendingUp className="w-4 h-4 text-green-600" />}
                    {isWorst && <TrendingDown className="w-4 h-4 text-red-500" />}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Latency</td>
              {compareMetric('latency', (val) => {
                if (!val) return 'N/A';
                return `${val}ms`;
              }).map(({ node, value, isBest, isWorst }) => (
                <td key={node.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white">{value}</span>
                    {isBest && <TrendingUp className="w-4 h-4 text-green-600" />}
                    {isWorst && <TrendingDown className="w-4 h-4 text-red-500" />}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Version</td>
              {selectedNodes.map(node => (
                <td key={node.id} className="px-4 py-3 text-gray-900 dark:text-white font-mono">
                  {node.version || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">Location</td>
              {selectedNodes.map(node => (
                <td key={node.id} className="px-4 py-3 text-gray-900 dark:text-white">
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


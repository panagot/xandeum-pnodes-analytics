'use client';

import { PNode } from '@/lib/prpc';
import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, GitCompare, Coins, Vote, Database, Search } from 'lucide-react';
import { calculateMonthlyXANDRewards } from '@/lib/rewards';
import { formatDistanceToNow } from 'date-fns';

interface PNodeTableProps {
  nodes: PNode[];
  onNodeClick?: (node: PNode) => void;
  onAddToComparison?: (node: PNode) => void;
  comparisonNodes?: PNode[];
}

type SortField = 'id' | 'status' | 'storageUsed' | 'uptime' | 'latency';
type SortDirection = 'asc' | 'desc';

export default function PNodeTable({ nodes, onNodeClick, onAddToComparison, comparisonNodes = [] }: PNodeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedNodes = nodes
    .filter(node => {
      const matchesSearch = 
        node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.pubkey && node.pubkey.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || node.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'storageUsed') {
        aValue = a.storageUsed || 0;
        bValue = b.storageUsed || 0;
      }
      
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(2)} TB`;
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(2)} GB`;
    return `${(bytes / 1000).toFixed(2)} MB`;
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getStatusBadge = (status?: string) => {
    const config: { [key: string]: { badge: string; label: string } } = {
      online: {
        badge: 'badge-success',
        label: 'Online',
      },
      offline: {
        badge: 'badge-error',
        label: 'Offline',
      },
      syncing: {
        badge: 'badge-warning',
        label: 'Syncing',
      },
    };
    
    const statusConfig = config[status || 'offline'] || config.offline;
    return (
      <span className={statusConfig.badge}>
        {statusConfig.label}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600 dark:text-blue-400" />
    );
  };

  return (
    <div className="card overflow-hidden">
      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="syncing">Syncing</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="data-table">
          <thead>
            <tr>
              <th
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-2">
                  Node ID
                  <SortIcon field="id" />
                </div>
              </th>
              <th>Address</th>
              <th
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th>Version</th>
              <th
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('storageUsed')}
              >
                <div className="flex items-center gap-2">
                  Storage
                  <SortIcon field="storageUsed" />
                </div>
              </th>
              <th
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('uptime')}
              >
                <div className="flex items-center gap-2">
                  Uptime
                  <SortIcon field="uptime" />
                </div>
              </th>
              <th>Location</th>
              <th
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('latency')}
              >
                <div className="flex items-center gap-2">
                  Latency
                  <SortIcon field="latency" />
                </div>
              </th>
              <th>Est. XAND/mo</th>
              <th>Consensus</th>
              {onAddToComparison && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedNodes.length === 0 ? (
              <tr>
                <td colSpan={onAddToComparison ? 11 : 10} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No pNodes found matching your criteria
                </td>
              </tr>
            ) : (
              filteredAndSortedNodes.map((node) => (
                <tr
                  key={node.id}
                  onClick={() => onNodeClick?.(node)}
                  className="cursor-pointer"
                >
                  <td className="font-medium text-gray-900 dark:text-white">
                    {node.id}
                  </td>
                  <td>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-mono truncate max-w-xs">
                      {node.address}
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(node.status)}
                  </td>
                  <td className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {node.version || 'N/A'}
                  </td>
                  <td>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatBytes(node.storageUsed)} / {formatBytes(node.storageCapacity)}
                    </div>
                    {node.storageCapacity && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {((node.storageUsed || 0) / node.storageCapacity * 100).toFixed(1)}% used
                      </div>
                    )}
                  </td>
                  <td className="text-sm text-gray-600 dark:text-gray-400">
                    {formatUptime(node.uptime)}
                  </td>
                  <td className="text-sm text-gray-600 dark:text-gray-400">
                    {node.location || 'N/A'}
                  </td>
                  <td className="text-sm text-gray-600 dark:text-gray-400">
                    {node.latency ? `${node.latency}ms` : 'N/A'}
                  </td>
                  <td>
                    {calculateMonthlyXANDRewards(node) > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          {calculateMonthlyXANDRewards(node).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-col gap-1 text-xs">
                      {node.lastVote && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Vote className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(node.lastVote), { addSuffix: true })}</span>
                        </div>
                      )}
                      {node.blocksBehind !== undefined && (
                        <div className={`flex items-center gap-1 ${
                          node.blocksBehind > 100 ? 'text-red-600 dark:text-red-400' : 
                          node.blocksBehind > 10 ? 'text-yellow-600 dark:text-yellow-400' : 
                          'text-green-600 dark:text-green-400'
                        }`}>
                          <Database className="w-3 h-3" />
                          <span>{node.blocksBehind} behind</span>
                        </div>
                      )}
                    </div>
                  </td>
                  {onAddToComparison && (
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToComparison(node);
                        }}
                        disabled={comparisonNodes.length >= 4 || comparisonNodes.find(n => n.id === node.id) !== undefined}
                        className="px-2 py-1 text-xs btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        title={comparisonNodes.find(n => n.id === node.id) ? 'Already in comparison' : 'Add to comparison'}
                      >
                        <GitCompare className="w-3 h-3" />
                        {comparisonNodes.find(n => n.id === node.id) ? 'Added' : 'Add'}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400 text-center">
        Showing {filteredAndSortedNodes.length} of {nodes.length} pNodes
      </div>
    </div>
  );
}

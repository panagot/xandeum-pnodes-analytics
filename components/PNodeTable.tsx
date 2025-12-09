'use client';

import { PNode } from '@/lib/prpc';
import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, GitCompare, Coins, Vote, Database } from 'lucide-react';
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
    const config = {
      online: {
        bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
        border: 'border-green-500/50',
        text: 'text-green-400',
      },
      offline: {
        bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
        border: 'border-red-500/50',
        text: 'text-red-400',
      },
      syncing: {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
        border: 'border-yellow-500/50',
        text: 'text-yellow-400',
      },
    };
    
    const cfg = config[status as keyof typeof config] || config.offline;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
        {status || 'unknown'}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-white/40" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 text-purple-400" />
      : <ArrowDown className="w-4 h-4 ml-1 text-purple-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by ID, address, or pubkey..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 glass border border-white/10 rounded-xl bg-white/5 text-white placeholder:text-white/40 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-white/40" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 glass border border-white/10 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
          >
            <option value="all" className="bg-slate-900">All Status</option>
            <option value="online" className="bg-slate-900">Online</option>
            <option value="syncing" className="bg-slate-900">Syncing</option>
            <option value="offline" className="bg-slate-900">Offline</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 glass-strong">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th
                className="px-6 py-4 text-left text-xs font-display font-semibold text-white/60 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-2">
                  Node ID
                  <SortIcon field="id" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-display font-semibold text-white/60 uppercase tracking-wider">
                Address
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-display font-semibold text-white/60 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-display font-semibold text-white/60 uppercase tracking-wider">
                Version
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-display font-semibold text-white/60 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => handleSort('storageUsed')}
              >
                <div className="flex items-center gap-2">
                  Storage
                  <SortIcon field="storageUsed" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-display font-semibold text-white/60 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => handleSort('uptime')}
              >
                <div className="flex items-center gap-2">
                  Uptime
                  <SortIcon field="uptime" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-display font-semibold text-white/60 uppercase tracking-wider">
                Location
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-display font-semibold text-white/60 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => handleSort('latency')}
              >
                <div className="flex items-center gap-2">
                  Latency
                  <SortIcon field="latency" />
                </div>
              </th>
              {onAddToComparison && (
                <th className="px-6 py-4 text-left text-xs font-display font-semibold text-white/60 uppercase tracking-wider">
                  Compare
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredAndSortedNodes.length === 0 ? (
              <tr>
                <td colSpan={onAddToComparison ? 11 : 10} className="px-6 py-12 text-center text-white/40">
                  No pNodes found matching your criteria
                </td>
              </tr>
            ) : (
              filteredAndSortedNodes.map((node) => (
                <tr
                  key={node.id}
                  onClick={() => onNodeClick?.(node)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    // Right-click handler for comparison (can be extended)
                  }}
                  className={`hover:bg-white/5 transition-colors ${
                    onNodeClick ? 'cursor-pointer' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {node.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white/60 font-mono truncate max-w-xs">
                      {node.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(node.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                    {node.version || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {formatBytes(node.storageUsed)} / {formatBytes(node.storageCapacity)}
                    </div>
                    {node.storageCapacity && (
                      <div className="text-xs text-white/40 mt-1">
                        {((node.storageUsed || 0) / node.storageCapacity * 100).toFixed(1)}% used
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                    {formatUptime(node.uptime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                    {node.location || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                    {node.latency ? `${node.latency}ms` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {calculateMonthlyXANDRewards(node) > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-400">
                          {calculateMonthlyXANDRewards(node).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-white/40">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-xs">
                      {node.lastVote && (
                        <div className="flex items-center gap-1 text-white/60">
                          <Vote className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(node.lastVote), { addSuffix: true })}</span>
                        </div>
                      )}
                      {node.blocksBehind !== undefined && (
                        <div className={`flex items-center gap-1 ${node.blocksBehind > 100 ? 'text-red-400' : node.blocksBehind > 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                          <Database className="w-3 h-3" />
                          <span>{node.blocksBehind} behind</span>
                        </div>
                      )}
                    </div>
                  </td>
                  {onAddToComparison && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToComparison(node);
                        }}
                        disabled={comparisonNodes.length >= 4 || comparisonNodes.find(n => n.id === node.id) !== undefined}
                        className="px-2 py-1 glass rounded-lg border border-white/10 hover:border-purple-500/50 text-xs text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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

      <div className="text-sm text-white/40 text-center">
        Showing {filteredAndSortedNodes.length} of {nodes.length} pNodes
      </div>
    </div>
  );
}

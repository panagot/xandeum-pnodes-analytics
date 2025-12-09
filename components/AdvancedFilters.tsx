'use client';

import { PNode } from '@/lib/prpc';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface AdvancedFiltersProps {
  nodes: PNode[];
  onFilter: (filteredNodes: PNode[]) => void;
}

export default function AdvancedFilters({ nodes, onFilter }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState({
    status: 'all',
    minUptime: '',
    maxLatency: '',
    minStorage: '',
    location: 'all',
  });

  const locations = Array.from(new Set(nodes.map(n => n.location).filter(Boolean)));

  const applyFilters = () => {
    let filtered = [...nodes];

    if (filters.status !== 'all') {
      filtered = filtered.filter(n => n.status === filters.status);
    }

    if (filters.minUptime) {
      const minUptimeSeconds = parseFloat(filters.minUptime) * 86400; // Convert days to seconds
      filtered = filtered.filter(n => (n.uptime || 0) >= minUptimeSeconds);
    }

    if (filters.maxLatency) {
      filtered = filtered.filter(n => n.latency && n.latency <= parseFloat(filters.maxLatency));
    }

    if (filters.minStorage) {
      const minStorageBytes = parseFloat(filters.minStorage) * 1000000; // Convert GB to bytes
      filtered = filtered.filter(n => (n.storageCapacity || 0) >= minStorageBytes);
    }

    if (filters.location !== 'all') {
      filtered = filtered.filter(n => n.location === filters.location);
    }

    onFilter(filtered);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      minUptime: '',
      maxLatency: '',
      minStorage: '',
      location: 'all',
    });
    onFilter(nodes);
  };

  const activeFilters = Object.values(filters).filter(v => v !== 'all' && v !== '').length;

  return (
    <div className="glass rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/60" />
          <h4 className="text-sm font-semibold text-white">Advanced Filters</h4>
          {activeFilters > 0 && (
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
              {activeFilters} active
            </span>
          )}
        </div>
        {activeFilters > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-white/60 hover:text-white flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setTimeout(applyFilters, 0);
          }}
          className="px-3 py-2 glass border border-white/10 rounded-lg bg-white/5 text-white text-sm focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="all" className="bg-slate-900">All Status</option>
          <option value="online" className="bg-slate-900">Online</option>
          <option value="syncing" className="bg-slate-900">Syncing</option>
          <option value="offline" className="bg-slate-900">Offline</option>
        </select>

        <input
          type="number"
          placeholder="Min Uptime (days)"
          value={filters.minUptime}
          onChange={(e) => {
            setFilters({ ...filters, minUptime: e.target.value });
            setTimeout(applyFilters, 0);
          }}
          className="px-3 py-2 glass border border-white/10 rounded-lg bg-white/5 text-white text-sm placeholder:text-white/40 focus:ring-2 focus:ring-purple-500/50"
        />

        <input
          type="number"
          placeholder="Max Latency (ms)"
          value={filters.maxLatency}
          onChange={(e) => {
            setFilters({ ...filters, maxLatency: e.target.value });
            setTimeout(applyFilters, 0);
          }}
          className="px-3 py-2 glass border border-white/10 rounded-lg bg-white/5 text-white text-sm placeholder:text-white/40 focus:ring-2 focus:ring-purple-500/50"
        />

        <input
          type="number"
          placeholder="Min Storage (GB)"
          value={filters.minStorage}
          onChange={(e) => {
            setFilters({ ...filters, minStorage: e.target.value });
            setTimeout(applyFilters, 0);
          }}
          className="px-3 py-2 glass border border-white/10 rounded-lg bg-white/5 text-white text-sm placeholder:text-white/40 focus:ring-2 focus:ring-purple-500/50"
        />

        <select
          value={filters.location}
          onChange={(e) => {
            setFilters({ ...filters, location: e.target.value });
            setTimeout(applyFilters, 0);
          }}
          className="px-3 py-2 glass border border-white/10 rounded-lg bg-white/5 text-white text-sm focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="all" className="bg-slate-900">All Locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc} className="bg-slate-900">{loc}</option>
          ))}
        </select>
      </div>
    </div>
  );
}


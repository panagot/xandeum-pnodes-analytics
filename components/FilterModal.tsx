'use client';

import { Filter, X } from 'lucide-react';
import { PNode } from '@/lib/prpc';
import { useState } from 'react';

interface FilterModalProps {
  nodes: PNode[];
  onFilter: (filteredNodes: PNode[]) => void;
  onClose: () => void;
}

export default function FilterModal({ nodes, onFilter, onClose }: FilterModalProps) {
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
      const minUptimeSeconds = parseFloat(filters.minUptime) * 86400;
      filtered = filtered.filter(n => (n.uptime || 0) >= minUptimeSeconds);
    }

    if (filters.maxLatency) {
      filtered = filtered.filter(n => n.latency && n.latency <= parseFloat(filters.maxLatency));
    }

    if (filters.minStorage) {
      const minStorageBytes = parseFloat(filters.minStorage) * 1000000;
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
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-20 px-4">
      <div className="bg-black/50 backdrop-blur-sm fixed inset-0" onClick={onClose} />
      <div 
        className="relative bg-white dark:bg-[#131a26] rounded-lg shadow-xl border border-gray-200 dark:border-[#1e293b] w-full max-w-2xl z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Nodes</h3>
            {activeFilters > 0 && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {activeFilters} active
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="syncing">Syncing</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Min Uptime */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Uptime (days)
              </label>
              <input
                type="number"
                placeholder="e.g. 7"
                value={filters.minUptime}
                onChange={(e) => setFilters({ ...filters, minUptime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Max Latency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Latency (ms)
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={filters.maxLatency}
                onChange={(e) => setFilters({ ...filters, maxLatency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Min Storage */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Storage Capacity (GB)
              </label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={filters.minStorage}
                onChange={(e) => setFilters({ ...filters, minStorage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-[#1e293b]">
          <button
            onClick={clearFilters}
            disabled={activeFilters === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear All
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                applyFilters();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


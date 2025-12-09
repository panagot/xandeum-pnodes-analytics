'use client';

import { PNode } from '@/lib/prpc';
import { Download, FileText, Database } from 'lucide-react';
import { useState } from 'react';

interface ExportButtonProps {
  nodes: PNode[];
  filename?: string;
}

export default function ExportButton({ nodes, filename = 'xandeum-pnodes' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    
    const headers = ['ID', 'Address', 'Status', 'Version', 'Uptime (days)', 'Storage Capacity (GB)', 'Storage Used (GB)', 'Storage %', 'Latency (ms)', 'Location'];
    const rows = nodes.map(node => [
      node.id,
      node.address,
      node.status || 'unknown',
      node.version || 'N/A',
      node.uptime ? (node.uptime / 86400).toFixed(2) : 'N/A',
      node.storageCapacity ? (node.storageCapacity / 1000000).toFixed(2) : 'N/A',
      node.storageUsed ? (node.storageUsed / 1000000).toFixed(2) : 'N/A',
      node.storageCapacity ? ((node.storageUsed || 0) / node.storageCapacity * 100).toFixed(2) : 'N/A',
      node.latency || 'N/A',
      node.location || 'Unknown',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setTimeout(() => setIsExporting(false), 500);
  };

  const exportToJSON = () => {
    setIsExporting(true);
    
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalNodes: nodes.length,
      nodes: nodes.map(node => ({
        id: node.id,
        address: node.address,
        pubkey: node.pubkey,
        status: node.status,
        version: node.version,
        uptime: node.uptime,
        storageCapacity: node.storageCapacity,
        storageUsed: node.storageUsed,
        latency: node.latency,
        location: node.location,
        lastSeen: node.lastSeen,
      })),
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    setTimeout(() => setIsExporting(false), 500);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 glass rounded-lg p-1 border border-white/10">
        <button
          onClick={exportToCSV}
          disabled={isExporting}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
          title="Export to CSV"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">CSV</span>
        </button>
        <button
          onClick={exportToJSON}
          disabled={isExporting}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
          title="Export to JSON"
        >
          <Database className="w-4 h-4" />
          <span className="hidden sm:inline">JSON</span>
        </button>
      </div>
    </div>
  );
}


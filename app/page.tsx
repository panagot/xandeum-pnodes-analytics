'use client';

import { useState, useEffect } from 'react';
import { PNode } from '@/lib/prpc';
import PNodeCard from '@/components/PNodeCard';
import PNodeTable from '@/components/PNodeTable';
import { StatusChart, NodeCountChart, StorageChart, StorageUsageChart } from '@/components/Charts';
import { HistoryTracker } from '@/lib/history';
import Sparkline from '@/components/Sparkline';
import Insights from '@/components/Insights';
import FlowDiagram from '@/components/FlowDiagram';
import NodeDetailModal from '@/components/NodeDetailModal';
import Heatmap from '@/components/Heatmap';
import ActivityTimeline from '@/components/ActivityTimeline';
import Leaderboard from '@/components/Leaderboard';
import NodeComparison from '@/components/NodeComparison';
import NetworkHealth from '@/components/NetworkHealth';
import ExportButton from '@/components/ExportButton';
import SmartSearch from '@/components/SmartSearch';
import AIVirtualAnalyst from '@/components/AIVirtualAnalyst';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import FilterModal from '@/components/FilterModal';
import NotificationsPanel from '@/components/NotificationsPanel';
import SettingsPanel from '@/components/SettingsPanel';
import { LayoutGrid, List, Activity, AlertCircle, Network, FileText, BarChart3 } from 'lucide-react';
import { calculateMonthlyXANDRewards } from '@/lib/rewards';

type ViewMode = 'grid' | 'table';
type TabMode = 'overview' | 'nodes' | 'analytics' | 'compare' | 'performance' | 'network' | 'reports';

export default function Home() {
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [tabMode, setTabMode] = useState<TabMode>('overview');
  const [selectedNode, setSelectedNode] = useState<PNode | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [comparisonNodes, setComparisonNodes] = useState<PNode[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filteredNodes, setFilteredNodes] = useState<PNode[]>([]);
  const [dateRange, setDateRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);

  const fetchNodes = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pnodes');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        if (data.data.length === 0) {
          console.warn('⚠️ API returned empty array - this should not happen with mock data fallback');
          setError('No nodes available. Please check pRPC endpoint configuration.');
        } else {
          // Loaded nodes successfully
          
          // Calculate XAND rewards for each node
          const nodesWithRewards = data.data.map((node: PNode) => ({
            ...node,
            estimatedXANDRewards: calculateMonthlyXANDRewards(node),
          }));
          
          setNodes(nodesWithRewards);
          setFilteredNodes(nodesWithRewards);
          setLastUpdate(new Date());
          // Save to history
          HistoryTracker.saveSnapshot(nodesWithRewards);
          setHistory(HistoryTracker.getHistory());
        }
      } else {
        setError(data.error || 'Failed to fetch pNodes');
        console.error('❌ Failed to fetch nodes:', data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pNodes');
      console.error('Error fetching nodes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Load history on client side only
    setHistory(HistoryTracker.getHistory());
    fetchNodes();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNodes, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't open search if already open or if typing in input
      if (showSearch) return;
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  const stats = {
    total: nodes.length,
    online: nodes.filter(n => n.status === 'online').length,
    offline: nodes.filter(n => n.status === 'offline').length,
    syncing: nodes.filter(n => n.status === 'syncing').length,
    totalStorage: nodes.reduce((sum, n) => sum + (n.storageCapacity || 0), 0),
    usedStorage: nodes.reduce((sum, n) => sum + (n.storageUsed || 0), 0),
  };

  const onlinePercentage = stats.total > 0 ? (stats.online / stats.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a]">
      {/* Sidebar */}
      <Sidebar currentTab={tabMode} onTabChange={(tab) => setTabMode(tab as TabMode)} />
      
      {/* Top Bar - Must be above modals */}
      <TopBar 
        onRefresh={fetchNodes} 
        onSearch={() => setShowSearch(true)}
        onFilter={() => setShowFilter(true)}
        onDateRangeChange={(range) => {
          setDateRange(range);
        }}
        onExport={() => {
          // Trigger export using ExportButton logic
          const exportButton = document.querySelector('[data-export-button]');
          if (exportButton) {
            (exportButton as HTMLElement).click();
          } else {
            // Fallback: create temporary export
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
            const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `xandeum-pnodes-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
          }
        }}
        onNotificationsClick={() => setShowNotifications(true)}
        onSettingsClick={() => setShowSettings(true)}
        lastUpdate={lastUpdate}
        refreshing={refreshing}
        currentDateRange={dateRange}
      />

      {/* Main Content */}
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {error && (
            <div className="mb-6 card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-red-700 dark:text-red-400 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {/* Overview Tab */}
          {tabMode === 'overview' && (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="metric-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.total}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Active pNodes</p>
                  {history.length > 1 && (
                    <div className="mt-4">
                      <Sparkline 
                        data={history.slice(-20).map(h => h.totalNodes)} 
                        color="#3b82f6"
                        height={30}
                      />
                    </div>
                  )}
                </div>

                <div className="metric-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Online</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {stats.online}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${onlinePercentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{onlinePercentage.toFixed(0)}%</span>
                  </div>
                  {history.length > 1 && (
                    <div className="mt-2">
                      <Sparkline 
                        data={history.slice(-20).map(h => h.onlineNodes)} 
                        color="#10b981"
                        height={30}
                      />
                    </div>
                  )}
                </div>

                <div className="metric-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Activity className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Syncing</span>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                    {stats.syncing}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nodes synchronizing</p>
                </div>

                <div className="metric-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Storage</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.totalStorage >= 1000000000 
                      ? `${(stats.totalStorage / 1000000000).toFixed(1)} TB`
                      : `${(stats.totalStorage / 1000000).toFixed(0)} GB`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total capacity</p>
                </div>
              </div>

              {/* Network Health & AI Analyst */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <NetworkHealth nodes={nodes} />
                <AIVirtualAnalyst nodes={nodes} history={history} />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
                  <StatusChart currentStats={stats} />
                </div>
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Node Count Trend</h3>
                  <NodeCountChart history={history} />
                </div>
              </div>
            </>
          )}

          {/* Nodes Tab */}
          {tabMode === 'nodes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Nodes</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {nodes.length} total nodes • {stats.online} online • {stats.syncing} syncing
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'table'
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  <ExportButton nodes={filteredNodes.length > 0 ? filteredNodes : nodes} />
                </div>
              </div>

              {loading && nodes.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="relative mb-6">
                      <Activity className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading pNodes...</p>
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(filteredNodes.length > 0 ? filteredNodes : nodes).map((node) => (
                    <PNodeCard 
                      key={node.id} 
                      node={node} 
                      onClick={() => setSelectedNode(node)} 
                    />
                  ))}
                </div>
              ) : (
                <PNodeTable 
                  nodes={filteredNodes.length > 0 ? filteredNodes : nodes}
                  onNodeClick={(node) => setSelectedNode(node)}
                  onAddToComparison={(node) => {
                    if (comparisonNodes.length < 4 && !comparisonNodes.find(n => n.id === node.id)) {
                      setComparisonNodes([...comparisonNodes, node]);
                    }
                  }}
                  comparisonNodes={comparisonNodes}
                />
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {tabMode === 'analytics' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Analytics</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive network analytics and insights</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Distribution</h3>
                  <StorageChart history={history} />
                </div>
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Usage</h3>
                  <StorageUsageChart currentStats={stats} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Heatmap nodes={nodes} onNodeClick={(node) => setSelectedNode(node)} />
                <ActivityTimeline history={history} />
              </div>

              <Leaderboard nodes={nodes} onNodeClick={(node) => setSelectedNode(node)} />
            </div>
          )}

          {/* Compare Tab */}
          {tabMode === 'compare' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Compare Nodes</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Select up to 4 nodes to compare side-by-side</p>
              </div>
              <NodeComparison
                nodes={nodes}
                selectedNodes={comparisonNodes}
                onNodeSelect={(node) => {
                  if (comparisonNodes.length < 4 && !comparisonNodes.find(n => n.id === node.id)) {
                    setComparisonNodes([...comparisonNodes, node]);
                  }
                }}
                onNodeRemove={(nodeId) => {
                  setComparisonNodes(comparisonNodes.filter(n => n.id !== nodeId));
                }}
                onClear={() => setComparisonNodes([])}
              />
            </div>
          )}

          {/* Performance Tab */}
          {tabMode === 'performance' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Performance Analysis</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Deep dive into network performance metrics, benchmarking, and trends</p>
              </div>

              {/* Performance KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(() => {
                  const latencies = nodes.filter(n => n.latency).map(n => n.latency!);
                  const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
                  const sortedLatencies = [...latencies].sort((a, b) => a - b);
                  const p95Latency = sortedLatencies.length > 0 ? sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] : 0;
                  
                  const uptimes = nodes.filter(n => n.uptime).map(n => n.uptime!);
                  const avgUptimeDays = uptimes.length > 0 ? uptimes.reduce((a, b) => a + b, 0) / uptimes.length / 86400 : 0;
                  
                  const storageUsages = nodes.filter(n => n.storageCapacity).map(n => ((n.storageUsed || 0) / n.storageCapacity!) * 100);
                  const avgStorageUsage = storageUsages.length > 0 ? storageUsages.reduce((a, b) => a + b, 0) / storageUsages.length : 0;

                  return (
                    <>
                      <div className="metric-card">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Latency</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {avgLatency.toFixed(0)}ms
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">P95: {p95Latency.toFixed(0)}ms</p>
                      </div>

                      <div className="metric-card">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Uptime</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {avgUptimeDays.toFixed(1)}d
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Network average</p>
                      </div>

                      <div className="metric-card">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Storage Usage</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {avgStorageUsage.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Average utilization</p>
                      </div>

                      <div className="metric-card">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Activity className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance Score</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {Math.round((avgLatency < 100 ? 30 : avgLatency < 200 ? 20 : 10) + (avgUptimeDays / 30 * 40) + ((100 - avgStorageUsage) / 100 * 30))}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Network average</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Performance Leaderboard */}
              <Leaderboard nodes={nodes} onNodeClick={(node) => setSelectedNode(node)} />

              {/* Performance Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trends</h3>
                  <NodeCountChart history={history} />
                </div>
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Trends</h3>
                  <StorageChart history={history} />
                </div>
              </div>

              {/* Bottleneck Analysis */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bottleneck Analysis</h3>
                <div className="space-y-4">
                  {(() => {
                    const slowestNodes = [...nodes]
                      .filter(n => n.latency)
                      .sort((a, b) => (b.latency || 0) - (a.latency || 0))
                      .slice(0, 5);
                    
                    const lowestUptime = [...nodes]
                      .filter(n => n.uptime)
                      .sort((a, b) => (a.uptime || 0) - (b.uptime || 0))
                      .slice(0, 5);

                    return (
                      <>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Slowest Nodes (Highest Latency)</h4>
                          <div className="space-y-2">
                            {slowestNodes.map((node, idx) => (
                              <div key={node.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">#{idx + 1}</span>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">{node.id}</span>
                                </div>
                                <span className="text-sm font-semibold text-red-600 dark:text-red-400">{node.latency}ms</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Lowest Uptime</h4>
                          <div className="space-y-2">
                            {lowestUptime.map((node, idx) => (
                              <div key={node.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">#{idx + 1}</span>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">{node.id}</span>
                                </div>
                                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{Math.floor((node.uptime || 0) / 86400)}d</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Network Tab */}
          {tabMode === 'network' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Network Infrastructure</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive network topology, statistics, and infrastructure health</p>
              </div>

              {/* Network Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="metric-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Network className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Capacity</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.totalStorage >= 1000000000 
                      ? `${(stats.totalStorage / 1000000000).toFixed(2)} TB`
                      : `${(stats.totalStorage / 1000000).toFixed(0)} GB`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Network-wide</p>
                </div>

                <div className="metric-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilization</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.totalStorage > 0 ? ((stats.usedStorage / stats.totalStorage) * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Storage used</p>
                </div>

                <div className="metric-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Network className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Locations</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {new Set(nodes.filter(n => n.location).map(n => n.location)).size}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Geographic regions</p>
                </div>

                <div className="metric-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Activity className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Connections</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {nodes.length > 0 ? Math.round(nodes.length * 0.3) : 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Per node</p>
                </div>
              </div>

              {/* Network Topology */}
              <FlowDiagram nodes={nodes} onNodeClick={(node) => setSelectedNode(node)} />

              {/* Network Health & Geographic Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NetworkHealth nodes={nodes} />
                <Heatmap nodes={nodes} onNodeClick={(node) => setSelectedNode(node)} />
              </div>

              {/* Network Statistics */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Network Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Nodes</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{nodes.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Online Nodes</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.online}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Syncing Nodes</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.syncing}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Offline Nodes</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.offline}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {tabMode === 'reports' && (
            <div className="space-y-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Reports & Exports</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Generate, save, and manage custom reports and data exports</p>
                </div>
                <ExportButton nodes={filteredNodes.length > 0 ? filteredNodes : nodes} />
              </div>

              {/* Quick Reports */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card p-6 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network Summary</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Complete network overview with all key metrics</p>
                  <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Generate Report
                  </button>
                </div>

                <div className="card p-6 cursor-pointer hover:border-green-400 dark:hover:border-green-500 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Report</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Performance metrics, benchmarks, and trends</p>
                  <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Generate Report
                  </button>
                </div>

                <div className="card p-6 cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Network className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network Health</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Network health score and infrastructure status</p>
                  <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Generate Report
                  </button>
                </div>
              </div>

              {/* Report History */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Reports</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Network Summary Report', date: '2 hours ago', type: 'CSV', size: '2.4 MB' },
                    { name: 'Performance Analysis', date: '1 day ago', type: 'JSON', size: '1.8 MB' },
                    { name: 'Network Health Report', date: '3 days ago', type: 'CSV', size: '2.1 MB' },
                  ].map((report, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{report.date} • {report.type} • {report.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          Download
                        </button>
                        <button className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">CSV Export</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Export node data as CSV for spreadsheet analysis</p>
                    <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors">
                      Export CSV
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">JSON Export</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Export node data as JSON for programmatic access</p>
                    <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors">
                      Export JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showSearch && (
        <SmartSearch 
          nodes={nodes} 
          onSelect={(node) => {
            setSelectedNode(node);
            setShowSearch(false);
          }} 
          onClose={() => setShowSearch(false)} 
        />
      )}

      {showFilter && (
        <FilterModal
          nodes={nodes}
          onFilter={(filtered) => {
            setFilteredNodes(filtered);
          }}
          onClose={() => setShowFilter(false)}
        />
      )}

      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {selectedNode && (
        <NodeDetailModal 
          node={selectedNode} 
          history={history} 
          onClose={() => setSelectedNode(null)} 
        />
      )}
    </div>
  );
}

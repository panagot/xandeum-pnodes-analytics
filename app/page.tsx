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
import AdvancedFilters from '@/components/AdvancedFilters';
import ThemeToggle from '@/components/ThemeToggle';
import SmartSearch from '@/components/SmartSearch';
import AIVirtualAnalyst from '@/components/AIVirtualAnalyst';
import { RefreshCw, LayoutGrid, List, BarChart3, Activity, TrendingUp, Zap, Globe, Database, Clock, GitCompare, Search } from 'lucide-react';
import { calculateMonthlyXANDRewards } from '@/lib/rewards';

type ViewMode = 'grid' | 'table';
type TabMode = 'nodes' | 'analytics' | 'compare';

export default function Home() {
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [tabMode, setTabMode] = useState<TabMode>('nodes');
  const [selectedNode, setSelectedNode] = useState<PNode | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [history, setHistory] = useState(HistoryTracker.getHistory());
  const [comparisonNodes, setComparisonNodes] = useState<PNode[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const fetchNodes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pnodes');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        if (data.data.length === 0) {
          console.warn('⚠️ API returned empty array - this should not happen with mock data fallback');
          setError('No nodes available. Please check pRPC endpoint configuration.');
        } else {
          console.log(`✅ Loaded ${data.data.length} nodes`);
          
          // Calculate XAND rewards for each node
          const nodesWithRewards = data.data.map((node: PNode) => ({
            ...node,
            estimatedXANDRewards: calculateMonthlyXANDRewards(node),
          }));
          
          setNodes(nodesWithRewards);
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
    }
  };

  useEffect(() => {
    fetchNodes();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNodes, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 animate-gradient" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="relative glass-strong border-b border-white/10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold gradient-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                  Xandeum pNodes
                </h1>
                <p className="mt-1 text-sm text-white/60 flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  Real-time network analytics & monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdate && (
                <div className="hidden md:flex items-center gap-2 text-sm text-white/60 glass px-4 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>Updated {lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
              <button
                onClick={() => setShowSearch(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 glass rounded-lg border border-white/10 hover:border-purple-500/50 text-white/60 hover:text-white transition-all"
                title="Search nodes (Press /)"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Search</span>
                <kbd className="hidden lg:inline px-1.5 py-0.5 text-xs bg-white/10 rounded border border-white/20">/</kbd>
              </button>
              <ThemeToggle />
              <button
                onClick={fetchNodes}
                disabled={loading}
                className="relative group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-primary hover:glow-secondary"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity -z-10" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 glass-strong border border-red-500/50 rounded-xl p-4 backdrop-blur-xl">
            <p className="text-red-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {/* Network Health Score Hero Widget */}
        <div className="mb-8">
          <NetworkHealth nodes={nodes} />
        </div>

        {/* Hero Stats Section */}
        <div className="mb-12">
          <div className="glass-strong rounded-2xl p-8 backdrop-blur-2xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative glass rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg">
                      <Globe className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Total</span>
                  </div>
                  <p className="text-4xl font-display font-bold text-white mb-2">
                    {stats.total}
                  </p>
                  <p className="text-sm text-white/60 mb-3">Active pNodes</p>
                  {history.length > 1 && (
                    <Sparkline 
                      data={history.slice(-20).map(h => h.totalNodes)} 
                      color="#8b5cf6"
                      height={30}
                    />
                  )}
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative glass rounded-xl p-6 border border-white/10 hover:border-green-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg">
                      <Activity className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Online</span>
                  </div>
                  <p className="text-4xl font-display font-bold text-green-400 mb-2">
                    {stats.online}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${onlinePercentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60">{onlinePercentage.toFixed(0)}%</span>
                  </div>
                  {history.length > 1 && (
                    <Sparkline 
                      data={history.slice(-20).map(h => h.onlineNodes)} 
                      color="#10b981"
                      height={30}
                    />
                  )}
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative glass rounded-xl p-6 border border-white/10 hover:border-yellow-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg">
                      <RefreshCw className="w-6 h-6 text-yellow-400" />
                    </div>
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Syncing</span>
                  </div>
                  <p className="text-4xl font-display font-bold text-yellow-400 mb-2">
                    {stats.syncing}
                  </p>
                  <p className="text-sm text-white/60 mb-3">Nodes synchronizing</p>
                  {history.length > 1 && (
                    <Sparkline 
                      data={history.slice(-20).map(h => h.syncingNodes)} 
                      color="#f59e0b"
                      height={30}
                    />
                  )}
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative glass rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                      <Database className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Storage</span>
                  </div>
                  <p className="text-3xl font-display font-bold text-white mb-2">
                    {stats.totalStorage >= 1000000000 
                      ? `${(stats.totalStorage / 1000000000).toFixed(1)} TB`
                      : `${(stats.totalStorage / 1000000).toFixed(0)} GB`}
                  </p>
                  <p className="text-sm text-white/60 mb-3">Total capacity</p>
                  {history.length > 1 && (
                    <Sparkline 
                      data={history.slice(-20).map(h => Math.round(h.totalStorage / 1000000))} 
                      color="#3b82f6"
                      height={30}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Virtual Analyst & Network Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AIVirtualAnalyst nodes={nodes} history={history} />
          <NetworkHealth nodes={nodes} />
        </div>

        {/* Leaderboard */}
        <div className="mb-8">
          <Leaderboard nodes={nodes} onNodeClick={(node) => setSelectedNode(node)} />
        </div>

        {/* Insights & Flow Diagram - Board Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <Insights nodes={nodes} history={history} stats={stats} />
          </div>
          <div className="lg:col-span-2">
            <FlowDiagram nodes={nodes} onNodeClick={(node) => setSelectedNode(node)} />
          </div>
        </div>

        {/* Heatmap & Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Heatmap nodes={nodes} onNodeClick={(node) => setSelectedNode(node)} />
          <ActivityTimeline history={history} />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 glass rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setTabMode('nodes')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
                  tabMode === 'nodes'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity className="w-4 h-4" />
                Nodes
              </button>
              <button
                onClick={() => setTabMode('analytics')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
                  tabMode === 'analytics'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </button>
              <button
                onClick={() => setTabMode('compare')}
                className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
                  tabMode === 'compare'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                Compare
              </button>
            </div>
            {tabMode === 'nodes' && (
              <ExportButton nodes={nodes} />
            )}
            {tabMode === 'nodes' && (
              <div className="flex items-center gap-2 glass rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-3 rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Content based on tab */}
          {tabMode === 'nodes' ? (
            <>
              {loading && nodes.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-primary rounded-full blur-2xl opacity-50 animate-pulse-slow" />
                      <RefreshCw className="relative w-16 h-16 text-purple-400 animate-spin mx-auto" />
                    </div>
                    <p className="text-white/60 text-lg">Loading pNodes...</p>
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nodes.map((node) => (
                    <div key={node.id} className="relative group">
                      <PNodeCard
                        node={node}
                        onClick={() => setSelectedNode(node)}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (comparisonNodes.length < 4 && !comparisonNodes.find(n => n.id === node.id)) {
                            setComparisonNodes([...comparisonNodes, node]);
                            setTabMode('compare');
                          }
                        }}
                        disabled={comparisonNodes.length >= 4 || comparisonNodes.find(n => n.id === node.id) !== undefined}
                        className="absolute top-2 right-2 px-2 py-1 glass rounded-lg border border-white/10 hover:border-purple-500/50 text-xs text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                        title="Add to comparison"
                      >
                        <GitCompare className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-strong rounded-2xl overflow-hidden border border-white/10">
                  <PNodeTable
                    nodes={nodes}
                    onNodeClick={(node) => setSelectedNode(node)}
                    onAddToComparison={(node) => {
                      if (comparisonNodes.length < 4 && !comparisonNodes.find(n => n.id === node.id)) {
                        setComparisonNodes([...comparisonNodes, node]);
                        setTabMode('compare');
                      }
                    }}
                    comparisonNodes={comparisonNodes}
                  />
                </div>
              )}
            </>
          ) : tabMode === 'analytics' ? (
            <div className="space-y-6">
              {/* Board-like Dashboard Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatusChart currentStats={stats} />
                <StorageUsageChart currentStats={stats} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NodeCountChart history={history} />
                <StorageChart history={history} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
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
        </div>

        {/* Node Detail Modal */}
        {selectedNode && (
          <NodeDetailModal
            node={selectedNode}
            history={history}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </main>

      {/* Smart Search Modal */}
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

      {/* Footer */}
      <footer className="relative mt-12 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60 text-sm">Xandeum pNodes Analytics Platform</p>
          <p className="mt-1 text-white/40 text-xs">
            Built for Xandeum Bounty – Dec 2025 • Built with Next.js, TypeScript, and Tailwind CSS
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <a
              href="https://github.com/yourusername/xandeum-pnodes-analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors text-xs"
            >
              GitHub
            </a>
            <span className="text-white/20">•</span>
            <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors text-xs"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

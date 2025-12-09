'use client';

import { PNode } from '@/lib/prpc';
import { useState } from 'react';
import { Network, Activity } from 'lucide-react';

interface FlowDiagramProps {
  nodes: PNode[];
  onNodeClick?: (node: PNode) => void;
}

export default function FlowDiagram({ nodes, onNodeClick }: FlowDiagramProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Group nodes by status
  const onlineNodes = nodes.filter(n => n.status === 'online');
  const syncingNodes = nodes.filter(n => n.status === 'syncing');
  const offlineNodes = nodes.filter(n => n.status === 'offline');

  // Sample connections (in real app, this would come from network topology)
  const getNodeConnections = (nodeId: string) => {
    const index = nodes.findIndex(n => n.id === nodeId);
    if (index === -1) return [];
    
    // Connect to next 2-3 nodes (simplified)
    const connections = [];
    for (let i = 1; i <= 3 && index + i < nodes.length; i++) {
      connections.push(nodes[index + i].id);
    }
    return connections;
  };

  const NodeCircle = ({ node, x, y, size = 60 }: { node: PNode; x: number; y: number; size?: number }) => {
    const isSelected = selectedNode === node.id;
    const statusColor = {
      online: 'from-green-400 to-emerald-500',
      syncing: 'from-yellow-400 to-amber-500',
      offline: 'from-red-400 to-rose-500',
    }[node.status || 'offline'];

    return (
      <g>
        <circle
          cx={x}
          cy={y}
          r={size / 2}
          fill={`url(#gradient-${node.id})`}
          className={`cursor-pointer transition-all ${isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => {
            setSelectedNode(isSelected ? null : node.id);
            onNodeClick?.(node);
          }}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
        />
        {node.status === 'online' && (
          <circle
            cx={x}
            cy={y}
            r={size / 2}
            fill="none"
            stroke={isSelected ? '#10b981' : 'rgba(16, 185, 129, 0.3)'}
            strokeWidth="2"
            className="animate-pulse"
            style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          />
        )}
        <defs>
          <linearGradient id={`gradient-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={node.status === 'online' ? '#10b981' : node.status === 'syncing' ? '#f59e0b' : '#ef4444'} stopOpacity="0.8" />
            <stop offset="100%" stopColor={node.status === 'online' ? '#059669' : node.status === 'syncing' ? '#d97706' : '#dc2626'} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {(isSelected || hoveredNode === node.id) && (
          <g>
            <rect
              x={x - 40}
              y={y + size / 2 + 5}
              width={80}
              height={20}
              fill="rgba(15, 15, 15, 0.9)"
              rx={4}
              className="backdrop-blur-sm"
            />
            <text
              x={x}
              y={y + size / 2 + 18}
              textAnchor="middle"
              className="fill-white text-xs font-mono"
            >
              {node.id}
            </text>
            {hoveredNode === node.id && (
              <text
                x={x}
                y={y + size / 2 + 35}
                textAnchor="middle"
                className="fill-white/60 text-[10px]"
              >
                {node.status} • {node.latency ? `${node.latency}ms` : 'N/A'}
              </text>
            )}
          </g>
        )}
      </g>
    );
  };

  // Simplified layout - in production, use a proper graph layout algorithm
  const layoutNodes = (nodeList: PNode[], startY: number) => {
    const spacing = 120;
    const startX = 100;
    return nodeList.slice(0, 8).map((node, index) => ({
      node,
      x: startX + (index % 4) * spacing,
      y: startY + Math.floor(index / 4) * spacing,
    }));
  };

  const onlineLayout = layoutNodes(onlineNodes, 80);
  const syncingLayout = layoutNodes(syncingNodes, 250);
  const offlineLayout = layoutNodes(offlineNodes, 420);

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10 backdrop-blur-2xl overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <Network className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-display font-bold text-white">Network Topology</h3>
      </div>
      
      <div className="relative" style={{ height: '500px' }}>
        <svg width="100%" height="100%" className="overflow-visible" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid meet">
          {/* Connections */}
          {onlineLayout.map(({ node, x, y }) => {
            const connections = getNodeConnections(node.id);
            return connections.map(connId => {
              const target = [...onlineLayout, ...syncingLayout].find(l => l.node.id === connId);
              if (!target) return null;
              return (
                <line
                  key={`${node.id}-${connId}`}
                  x1={x}
                  y1={y}
                  x2={target.x}
                  y2={target.y}
                  stroke="rgba(139, 92, 246, 0.3)"
                  strokeWidth="1"
                  className="transition-opacity hover:opacity-100"
                />
              );
            });
          })}

          {/* Legend */}
          <g>
            <rect x="20" y="20" width="12" height="12" fill="#10b981" rx="2" />
            <text x="40" y="31" fill="white" fontSize="12">Online</text>
            
            <rect x="20" y="40" width="12" height="12" fill="#f59e0b" rx="2" />
            <text x="40" y="51" fill="white" fontSize="12">Syncing</text>
            
            <rect x="20" y="60" width="12" height="12" fill="#ef4444" rx="2" />
            <text x="40" y="71" fill="white" fontSize="12">Offline</text>
          </g>

          {/* Online Nodes */}
          {onlineLayout.map(({ node, x, y }) => (
            <NodeCircle key={node.id} node={node} x={x} y={y} />
          ))}

          {/* Syncing Nodes */}
          {syncingLayout.map(({ node, x, y }) => (
            <NodeCircle key={node.id} node={node} x={x} y={y} size={50} />
          ))}

          {/* Offline Nodes */}
          {offlineLayout.map(({ node, x, y }) => (
            <NodeCircle key={node.id} node={node} x={x} y={y} size={40} />
          ))}
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/60">
        <div className="flex items-center gap-4">
          <span>Online: {onlineNodes.length}</span>
          <span>Syncing: {syncingNodes.length}</span>
          <span>Offline: {offlineNodes.length}</span>
        </div>
        <span className="text-white/40">Click nodes to view details</span>
      </div>
    </div>
  );
}


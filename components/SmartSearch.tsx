'use client';

import { PNode } from '@/lib/prpc';
import { Search, X, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface SmartSearchProps {
  nodes: PNode[];
  onSelect: (node: PNode) => void;
  onClose?: () => void;
}

export default function SmartSearch({ nodes, onSelect, onClose }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PNode[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = nodes.filter(node => {
      const searchable = [
        node.id,
        node.address,
        node.status,
        node.version,
        node.location,
      ].join(' ').toLowerCase();
      
      return searchable.includes(searchTerm);
    });

    // Sort by relevance (exact matches first, then partial)
    const sorted = filtered.sort((a, b) => {
      const aExact = a.id.toLowerCase() === searchTerm;
      const bExact = b.id.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    setResults(sorted.slice(0, 8));
    setSelectedIndex(0);
  }, [query, nodes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose?.();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
          e.preventDefault();
          onSelect(results[selectedIndex]);
          setQuery('');
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelect = useCallback((node: PNode) => {
    onSelect(node);
    setQuery('');
    onClose?.();
  }, [onSelect, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-40 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="glass-strong rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-white/60" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes by ID, address, status, location... (Press / to focus)"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-lg"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose?.();
              }}
              className="p-1 text-white/60 hover:text-white transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="max-h-96 overflow-y-auto">
            {results.map((node, index) => (
              <button
                key={node.id}
                onClick={() => handleSelect(node)}
                className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 ${
                  index === selectedIndex ? 'bg-white/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{node.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        node.status === 'online' ? 'bg-green-500/20 text-green-400' :
                        node.status === 'syncing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {node.status}
                      </span>
                    </div>
                    <div className="text-sm text-white/60 truncate">
                      {node.address}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                      {node.location && (
                        <span>{node.location}</span>
                      )}
                      {node.latency && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {node.latency}ms
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {index === selectedIndex && (
                      <div className="text-xs text-white/40">Press Enter</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/60">No nodes found matching &quot;{query}&quot;</p>
          </div>
        )}

        {!query && (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="glass rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-white/60">Quick Actions</span>
                </div>
                <div className="text-white/40 space-y-1">
                  <div>Type to search...</div>
                  <div>Press / to focus</div>
                </div>
              </div>
              <div className="glass rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-white/60">Tips</span>
                </div>
                <div className="text-white/40 space-y-1">
                  <div>Search by ID, status, location</div>
                  <div>Use arrow keys to navigate</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


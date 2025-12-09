'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Network, 
  BarChart3, 
  GitCompare, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Gauge,
  FileText,
  Bell,
  Globe,
  Github
} from 'lucide-react';

interface SidebarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Sidebar({ currentTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'nodes', label: 'Node', icon: Network },
    { id: 'analytics', label: 'Analytic', icon: BarChart3 },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'performance', label: 'Performance', icon: Gauge },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'alerts', label: 'Alerts', icon: Bell },
  ];

  const isActive = (itemId: string) => currentTab === itemId;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-[#131a26] border-r border-gray-200 dark:border-[#1e293b] transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo/Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-[#1e293b]">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Xandeum</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">pNodes Analytics</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg mx-auto">
            <Zap className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-[#1e293b]">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium text-gray-700 dark:text-gray-300">v1.0.0</p>
            <p className="mt-1 mb-2">Xandeum Labs</p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://www.xandeum.network/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Visit Xandeum Network"
                aria-label="Visit Xandeum Network"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/panagot/xandeum-pnodes-analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="View on GitHub"
                aria-label="View on GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

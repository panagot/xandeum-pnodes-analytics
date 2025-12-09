'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Search, 
  Bell, 
  Settings, 
  Moon, 
  Sun,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

interface TopBarProps {
  onRefresh?: () => void;
  onSearch?: () => void;
  onExport?: () => void;
  onDateRangeChange?: (range: string) => void;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  lastUpdate?: Date | null;
  refreshing?: boolean;
}

export default function TopBar({ 
  onRefresh, 
  onSearch, 
  onExport,
  onDateRangeChange,
  onNotificationsClick,
  onSettingsClick,
  lastUpdate, 
  refreshing = false 
}: TopBarProps) {
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white dark:bg-[#131a26] border-b border-gray-200 dark:border-[#1e293b] z-50 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Page Title & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h2>
          {lastUpdate && (
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span>Last updated: {format(lastUpdate, 'HH:mm:ss')}</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <button 
            onClick={() => onDateRangeChange?.('24h')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            title="Select date range"
          >
            <Calendar className="w-4 h-4" />
            <span>Last 24h</span>
          </button>

          {/* Filter */}
          <button className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>

          {/* Search */}
          <button
            onClick={onSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            title="Search (Press /)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden lg:inline ml-1 px-1.5 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">/</kbd>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          {/* Export */}
          <button 
            onClick={onExport}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            title="Export data"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          {/* Notifications */}
          <button 
            onClick={onNotificationsClick}
            className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#131a26]"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Toggle theme"
            suppressHydrationWarning
          >
            {mounted ? (darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <Moon className="w-4 h-4" />}
          </button>

          {/* User Menu */}
          <button 
            onClick={onSettingsClick}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

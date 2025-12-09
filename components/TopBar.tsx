'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Search, 
  Bell, 
  Settings, 
  Moon, 
  Sun,
  Download,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import DateRangePicker from './DateRangePicker';

interface TopBarProps {
  onRefresh?: () => void;
  onSearch?: () => void;
  onExport?: () => void;
  onFilter?: () => void;
  onDateRangeChange?: (range: string) => void;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  lastUpdate?: Date | null;
  refreshing?: boolean;
  currentDateRange?: string;
}

export default function TopBar({ 
  onRefresh, 
  onSearch, 
  onExport,
  onFilter,
  onDateRangeChange,
  onNotificationsClick,
  onSettingsClick,
  lastUpdate, 
  refreshing = false,
  currentDateRange = '24h'
}: TopBarProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    
    setDarkMode(isDark);
    // Apply theme immediately
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Listen for theme changes from other components
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      const isDark = savedTheme === 'dark';
      setDarkMode(isDark);
    };

    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newMode = !darkMode;
    
    // Apply theme change immediately to DOM
    const htmlElement = document.documentElement;
    if (newMode) {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Update state to trigger re-render
    setDarkMode(newMode);
    
    // Force a small delay to ensure DOM update
    requestAnimationFrame(() => {
      // Verify the class was applied
      const isDarkApplied = htmlElement.classList.contains('dark');
      if (isDarkApplied !== newMode) {
        // Re-apply if needed
        if (newMode) {
          htmlElement.classList.add('dark');
        } else {
          htmlElement.classList.remove('dark');
        }
      }
    });
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('themechange'));
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
          <DateRangePicker 
            onRangeChange={(range) => onDateRangeChange?.(range)}
            currentRange={currentDateRange}
          />

          {/* Filter */}
          <button 
            onClick={onFilter}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            title="Filter nodes"
          >
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
            type="button"
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            title="Toggle theme"
            suppressHydrationWarning
            aria-label="Toggle dark mode"
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

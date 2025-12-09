import { PNode } from './prpc';

export interface HistoricalDataPoint {
  timestamp: number;
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  syncingNodes: number;
  totalStorage: number;
  usedStorage: number;
}

export class HistoryTracker {
  private static STORAGE_KEY = 'xandeum_pnodes_history';
  private static MAX_POINTS = 100; // Keep last 100 data points

  static saveSnapshot(nodes: PNode[]): void {
    if (typeof window === 'undefined') return;

    const stats = this.calculateStats(nodes);
    const history = this.getHistory();
    
    history.push({
      timestamp: Date.now(),
      ...stats,
    });

    // Keep only last MAX_POINTS
    if (history.length > this.MAX_POINTS) {
      history.shift();
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  static getHistory(): HistoricalDataPoint[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  static clearHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getRecentHistory(hours: number = 24): HistoricalDataPoint[] {
    const history = this.getHistory();
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return history.filter(point => point.timestamp >= cutoff);
  }

  private static calculateStats(nodes: PNode[]): Omit<HistoricalDataPoint, 'timestamp'> {
    return {
      totalNodes: nodes.length,
      onlineNodes: nodes.filter(n => n.status === 'online').length,
      offlineNodes: nodes.filter(n => n.status === 'offline').length,
      syncingNodes: nodes.filter(n => n.status === 'syncing').length,
      totalStorage: nodes.reduce((sum, n) => sum + (n.storageCapacity || 0), 0),
      usedStorage: nodes.reduce((sum, n) => sum + (n.storageUsed || 0), 0),
    };
  }
}


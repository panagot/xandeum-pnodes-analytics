import { HistoryTracker, HistoricalDataPoint } from '@/lib/history';
import { PNode } from '@/lib/prpc';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('HistoryTracker', () => {
  beforeEach(() => {
    HistoryTracker.clearHistory();
  });

  const createMockNodes = (count: number, onlineCount: number): PNode[] => {
    const nodes: PNode[] = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        id: `node-${i}`,
        address: `address-${i}`,
        status: i < onlineCount ? 'online' : 'offline',
        storageCapacity: 1000,
        storageUsed: 500,
      });
    }
    return nodes;
  };

  describe('saveSnapshot', () => {
    it('should save a snapshot to history', () => {
      const nodes = createMockNodes(10, 8);
      HistoryTracker.saveSnapshot(nodes);
      
      const history = HistoryTracker.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].totalNodes).toBe(10);
      expect(history[0].onlineNodes).toBe(8);
    });

    it('should limit history to MAX_POINTS', () => {
      const nodes = createMockNodes(5, 5);
      
      // Save more than MAX_POINTS
      for (let i = 0; i < 150; i++) {
        HistoryTracker.saveSnapshot(nodes);
      }
      
      const history = HistoryTracker.getHistory();
      expect(history.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = HistoryTracker.getHistory();
      expect(history).toEqual([]);
    });

    it('should return saved history', () => {
      const nodes = createMockNodes(10, 8);
      HistoryTracker.saveSnapshot(nodes);
      
      const history = HistoryTracker.getHistory();
      expect(history.length).toBe(1);
      expect(history[0]).toHaveProperty('timestamp');
      expect(history[0]).toHaveProperty('totalNodes');
    });
  });

  describe('getRecentHistory', () => {
    it('should return history within specified hours', () => {
      const nodes = createMockNodes(10, 8);
      
      // Save multiple snapshots
      HistoryTracker.saveSnapshot(nodes);
      
      // Wait a bit (in real scenario)
      const recent = HistoryTracker.getRecentHistory(24);
      expect(recent.length).toBeGreaterThan(0);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      const nodes = createMockNodes(10, 8);
      HistoryTracker.saveSnapshot(nodes);
      
      expect(HistoryTracker.getHistory().length).toBe(1);
      
      HistoryTracker.clearHistory();
      expect(HistoryTracker.getHistory().length).toBe(0);
    });
  });
});


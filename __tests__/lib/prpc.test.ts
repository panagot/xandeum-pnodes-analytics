import { PRPCClient, PNode } from '@/lib/prpc';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PRPCClient', () => {
  let client: PRPCClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new PRPCClient('https://test-api.xandeum.network');
    // Mock axios to fail so it uses mock data
    mockedAxios.post.mockRejectedValue(new Error('Network error'));
    mockedAxios.get = jest.fn().mockRejectedValue(new Error('Network error'));
  });

  describe('getGossipNodes', () => {
    it('should return an array of nodes', async () => {
      // This will use mock data since the endpoint doesn't exist
      const nodes = await client.getGossipNodes();
      
      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes.length).toBeGreaterThan(0);
    });

    it('should normalize node data correctly', async () => {
      const nodes = await client.getGossipNodes();
      
      if (nodes.length > 0) {
        const node = nodes[0];
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('address');
        expect(['online', 'offline', 'syncing']).toContain(node.status);
      }
    });
  });

  describe('normalizeNode', () => {
    it('should handle nodes with all fields', () => {
      const mockNode = {
        id: 'test-node-1',
        address: 'test-address',
        pubkey: 'test-pubkey',
        version: '1.0.0',
        uptime: 3600,
        storageCapacity: 1000,
        storageUsed: 500,
        status: 'online',
        location: 'US-East',
        latency: 50,
      };

      const nodes = (client as any).normalizeNodes([mockNode]);
      expect(nodes[0]).toEqual(expect.objectContaining({
        id: 'test-node-1',
        address: 'test-address',
        status: 'online',
      }));
    });

    it('should handle nodes with missing fields', () => {
      const mockNode = {
        id: 'test-node-2',
      };

      const nodes = (client as any).normalizeNodes([mockNode]);
      expect(nodes[0]).toHaveProperty('id');
      expect(nodes[0]).toHaveProperty('address');
      expect(nodes[0]).toHaveProperty('status');
    });
  });
});


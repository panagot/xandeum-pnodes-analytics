import axios from 'axios';

export interface PNode {
  id: string;
  address: string;
  pubkey?: string;
  version?: string;
  uptime?: number;
  storageCapacity?: number;
  storageUsed?: number;
  status?: 'online' | 'offline' | 'syncing';
  lastSeen?: number;
  location?: string;
  latency?: number;
  // New fields for enhanced features
  lastVote?: number; // Timestamp of last vote
  lastBlockStored?: number; // Timestamp of last block stored
  blocksBehind?: number; // Number of blocks behind the network
  estimatedXANDRewards?: number; // Estimated monthly XAND rewards
  ipAddress?: string; // IP address for geolocation
  locationData?: {
    country: string;
    region: string;
    city: string;
    lat?: number;
    lon?: number;
  };
  [key: string]: any; // Allow for additional fields from pRPC
}

export interface PNodeGossipResponse {
  nodes: PNode[];
  timestamp: number;
}

/**
 * pRPC Client for interacting with Xandeum pNodes
 * 
 * Note: The exact pRPC endpoint structure may need to be adjusted
 * based on the actual Xandeum pRPC API documentation.
 * Common patterns for RPC calls in blockchain networks:
 * - getClusterNodes() - get all nodes in the cluster
 * - getGossipNodes() - get nodes from gossip protocol
 * - getNodeInfo(address) - get specific node information
 */
export class PRPCClient {
  private baseUrl: string;
  private endpoints: string[];

  constructor(baseUrl: string = 'https://api.xandeum.network') {
    this.baseUrl = baseUrl;
    // Try multiple possible endpoint patterns
    this.endpoints = [
      `${baseUrl}/prpc`,
      `${baseUrl}/rpc`,
      `${baseUrl}/api/v1/nodes`,
      `${baseUrl}/v1/gossip/nodes`,
    ];
  }

  /**
   * Get all pNodes from gossip
   * This is the main method required by the challenge
   * Tries multiple endpoint patterns and methods
   */
  async getGossipNodes(): Promise<PNode[]> {
    // Try real Xandeum DevNet/MainNet endpoints first
    const entrypoints = [
      'https://entrypoint.devnet.xandeum.network:8899',
      'https://entrypoint.mainnet.xandeum.network:8899',
    ];

    for (const url of entrypoints) {
      try {
        const response = await axios.post(
          url,
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'getClusterNodes',
            params: [],
          },
          { timeout: 5000 }
        );

        if (response.data?.result) {
          // If result is an array, use it directly (might already be filtered)
          let nodesToProcess = Array.isArray(response.data.result) 
            ? response.data.result 
            : [];

          // If we have nodes, try to filter for real pNodes, but don't be too strict
          if (nodesToProcess.length > 0) {
            // Try to filter for pNodes, but if filtering removes everything, use all nodes
            const filteredNodes = nodesToProcess.filter(
              (node: any) =>
                node.version?.toLowerCase().includes('xandeum') ||
                node.featureSet > 10000 ||
                node.rpc?.toLowerCase().includes('xandeum') ||
                node.gossip?.toLowerCase().includes('xandeum') ||
                node.pubkey || // If it has a pubkey, likely a node
                node.address // If it has an address, likely a node
            );

            // Use filtered nodes if we have any, otherwise use all nodes
            const finalNodes = filteredNodes.length > 0 ? filteredNodes : nodesToProcess;
            
            if (finalNodes.length > 0) {
              console.log(`Successfully fetched ${finalNodes.length} nodes from ${url}`);
              return this.normalizeNodes(finalNodes);
            }
          }
        }
      } catch (error) {
        // Continue to next endpoint
        continue;
      }
    }

    const methods = ['getGossipNodes', 'getClusterNodes', 'getNodes', 'getAllNodes'];
    
    // Try JSON-RPC style endpoints
    for (const endpoint of this.endpoints) {
      for (const method of methods) {
        try {
          const response = await axios.post(endpoint, {
            jsonrpc: '2.0',
            id: 1,
            method: method,
            params: [],
          }, {
            timeout: 5000,
          });

          if (response.data.error) {
            continue; // Try next method
          }

          // Transform the response to our PNode format
          const nodes = response.data.result || response.data || [];
          if (Array.isArray(nodes) && nodes.length > 0) {
            console.log(`Successfully fetched nodes from ${endpoint} using ${method}`);
            return this.normalizeNodes(nodes);
          }
        } catch (error: any) {
          // Continue to next endpoint/method
          continue;
        }
      }
    }

    // Try REST API style
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/nodes`, {
        timeout: 5000,
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Successfully fetched nodes via REST API');
        return this.normalizeNodes(response.data);
      }
    } catch (error) {
      // Continue to fallback
    }

    // Fallback: Return mock data for development/testing
    // This ensures the UI always has data to display
    console.warn('⚠️ Using mock data - pRPC endpoint not available. This is normal for development.');
    console.log('📊 Generating 35 mock pNodes for demonstration...');
    const mockNodes = this.getMockNodes();
    console.log(`✅ Generated ${mockNodes.length} mock nodes`);
    return mockNodes;
  }

  /**
   * Get detailed information about a specific pNode
   */
  async getNodeInfo(nodeAddress: string): Promise<PNode | null> {
    try {
      const response = await axios.post(`${this.baseUrl}/prpc`, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getNodeInfo',
        params: [nodeAddress],
      });

      if (response.data.error) {
        return null;
      }

      return this.normalizeNode(response.data.result);
    } catch (error) {
      console.error('Error fetching node info:', error);
      return null;
    }
  }

  /**
   * Normalize node data from pRPC response to our PNode format
   */
  private normalizeNodes(nodes: any[]): PNode[] {
    return nodes.map(node => this.normalizeNode(node));
  }

  private normalizeNode(node: any): PNode {
    return {
      id: node.id || node.pubkey || node.address || Math.random().toString(36),
      address: node.address || node.pubkey || node.id || '',
      pubkey: node.pubkey || node.publicKey,
      version: node.version || node.softwareVersion,
      uptime: node.uptime || node.uptimeSeconds,
      storageCapacity: node.storageCapacity || node.capacity,
      storageUsed: node.storageUsed || node.used,
      status: this.determineStatus(node),
      lastSeen: node.lastSeen || Date.now(),
      location: node.location || node.region,
      latency: node.latency || node.ping,
      // New fields
      lastVote: node.lastVote || node.lastVoteTimestamp,
      lastBlockStored: node.lastBlockStored || node.lastBlockTimestamp,
      blocksBehind: node.blocksBehind || node.blocksBehindCount,
      ipAddress: node.ipAddress || node.ip,
      locationData: node.locationData,
      ...node, // Preserve any additional fields
    };
  }

  private determineStatus(node: any): 'online' | 'offline' | 'syncing' {
    if (node.status) {
      return node.status.toLowerCase();
    }
    if (node.isOnline === false || node.offline === true) {
      return 'offline';
    }
    if (node.syncing === true || node.isSyncing === true) {
      return 'syncing';
    }
    return 'online';
  }

  /**
   * Mock data for development/testing
   * Remove this once actual pRPC endpoints are available
   */
  private getMockNodes(): PNode[] {
    const mockNodes: PNode[] = [];
    const statuses: ('online' | 'offline' | 'syncing')[] = ['online', 'online', 'online', 'syncing', 'offline'];
    const locations = ['US-East', 'US-West', 'EU', 'Asia-Pacific', 'South America', 'Africa', 'Unknown'];
    
    // Generate more realistic mock data (45 nodes for better visualization and to fill the page)
    const nodeCount = 45;
    
    for (let i = 0; i < nodeCount; i++) {
      // Use deterministic but varied status distribution
      let status: 'online' | 'offline' | 'syncing';
      if (i < 30) {
        status = 'online'; // First 30 nodes online
      } else if (i < 40) {
        status = 'syncing'; // Next 10 syncing
      } else {
        status = 'offline'; // Last 5 offline
      }
      
      // Storage in bytes (more realistic: 100GB to 10TB)
      const capacityGB = Math.floor(Math.random() * 9900) + 100;
      const capacity = capacityGB * 1000000000; // Convert to bytes (GB * 1e9)
      const used = Math.floor(capacity * (Math.random() * 0.7 + 0.1)); // 10-80% usage
      
      // Generate more realistic addresses
      const nodeId = String(i + 1).padStart(2, '0');
      const randomStr = Math.random().toString(36).substring(2, 15);
      const pubkeyStr = Math.random().toString(36).substring(2, 44);
      
      // Generate mock IP address
      const mockIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      
      // Generate last vote and block timestamps (for online nodes)
      const now = Date.now();
      const lastVote = status === 'online' ? now - Math.floor(Math.random() * 60000) : now - Math.floor(Math.random() * 86400000);
      const lastBlockStored = status === 'online' ? now - Math.floor(Math.random() * 120000) : now - Math.floor(Math.random() * 86400000);
      const blocksBehind = status === 'online' ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 1000);
      
      mockNodes.push({
        id: `pnode-${nodeId}`,
        address: `${randomStr}.xandeum.network:8899`,
        pubkey: pubkeyStr,
        version: `1.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
        uptime: Math.floor(Math.random() * 86400 * 30) + 86400, // 1-30 days
        storageCapacity: capacity,
        storageUsed: used,
        status,
        lastSeen: Date.now() - (status === 'offline' ? Math.floor(Math.random() * 86400000) : Math.floor(Math.random() * 3600000)),
        location: locations[Math.floor(Math.random() * locations.length)],
        latency: status === 'online' ? Math.floor(Math.random() * 150) + 10 : Math.floor(Math.random() * 200) + 100, // 10-160ms for online, 100-300ms for others
        // New fields
        ipAddress: mockIP,
        lastVote,
        lastBlockStored,
        blocksBehind,
      });
    }
    
    return mockNodes;
  }
}

// Export a singleton instance
export const prpcClient = new PRPCClient();


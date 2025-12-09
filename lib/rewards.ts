import { PNode } from './prpc';

/**
 * Calculate estimated monthly XAND rewards for a pNode
 * Based on storage provided and current emission rate
 * 
 * Formula: (Storage Provided in TB * Reward Rate per TB per Month)
 * 
 * Note: These are approximate values. Actual rewards depend on:
 * - Current XAND emission rate
 * - Network participation
 * - Storage utilization
 * - Node uptime and performance
 */
export function calculateMonthlyXANDRewards(node: PNode): number {
  // Base reward rate: ~100 XAND per TB per month (approximate)
  // This is a placeholder - should be fetched from Xandeum program or API
  const REWARD_RATE_PER_TB_PER_MONTH = 100;
  
  // Get storage provided (used storage in TB)
  const storageUsedTB = (node.storageUsed || 0) / (1024 * 1024 * 1024 * 1024); // Convert bytes to TB
  
  // Only calculate for online nodes
  if (node.status !== 'online') {
    return 0;
  }
  
  // Base calculation
  let estimatedRewards = storageUsedTB * REWARD_RATE_PER_TB_PER_MONTH;
  
  // Apply uptime multiplier (nodes with better uptime get more rewards)
  if (node.uptime) {
    const uptimeDays = node.uptime / 86400;
    const uptimeMultiplier = Math.min(1.2, 0.8 + (uptimeDays / 30) * 0.4); // 0.8x to 1.2x based on uptime
    estimatedRewards *= uptimeMultiplier;
  }
  
  // Apply performance multiplier (lower latency = better performance = more rewards)
  if (node.latency && node.latency < 100) {
    estimatedRewards *= 1.1; // 10% bonus for low latency
  }
  
  return Math.round(estimatedRewards * 100) / 100; // Round to 2 decimal places
}

/**
 * Get reward rate information
 */
export function getRewardRateInfo() {
  return {
    ratePerTBPerMonth: 100,
    currency: 'XAND',
    note: 'Estimated based on current network parameters. Actual rewards may vary.',
  };
}


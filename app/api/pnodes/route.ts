import { NextResponse } from 'next/server';
import { prpcClient } from '@/lib/prpc';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const nodes = await prpcClient.getGossipNodes();
    
    // Always ensure we have data - getGossipNodes should always return mock data as fallback
    if (nodes.length === 0) {
      console.error('❌ No nodes returned - this should not happen!');
      return NextResponse.json({
        success: true,
        data: [],
        timestamp: Date.now(),
        count: 0,
        warning: 'No nodes available',
      });
    }
    
    console.log(`✅ API returning ${nodes.length} nodes`);
    
    return NextResponse.json({
      success: true,
      data: nodes,
      timestamp: Date.now(),
      count: nodes.length,
    });
  } catch (error: any) {
    console.error('❌ Error in /api/pnodes:', error);
    
    // Even on error, try to return something
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch pNodes',
        data: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}


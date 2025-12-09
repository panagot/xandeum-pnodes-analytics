import { NextResponse } from 'next/server';
import { getLocationFromIP, extractIPFromAddress } from '@/lib/geolocation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    
    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    const ip = extractIPFromAddress(address);
    if (!ip) {
      return NextResponse.json({
        success: false,
        error: 'Could not extract IP from address',
        data: null,
      });
    }

    const location = await getLocationFromIP(ip);
    
    return NextResponse.json({
      success: true,
      data: location,
      ip,
    });
  } catch (error: any) {
    console.error('Error in /api/geolocation:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get location',
        data: null,
      },
      { status: 500 }
    );
  }
}


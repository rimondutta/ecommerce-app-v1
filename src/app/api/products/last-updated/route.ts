import { NextResponse } from 'next/server';
import { getProductsTimestamp } from '@/lib/lastUpdated';

/**
 * GET /api/products/last-updated
 *
 * Lightweight endpoint polled by the mobile app to detect when products have
 * changed. Returns a Unix millisecond timestamp that is bumped whenever a
 * product is created, updated, or deleted via the API.
 *
 * Mobile: compare the returned timestamp against the last known value;
 * if it changed, call queryClient.invalidateQueries(['products']).
 */
export async function GET() {
  const timestamp = await getProductsTimestamp();

  return NextResponse.json(
    {
      success: true,
      data: {
        timestamp,
        iso: timestamp ? new Date(timestamp).toISOString() : null,
      },
    },
    {
      headers: {
        // Short cache: mobile app polls this frequently, so don't over-cache
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

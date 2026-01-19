import { NextResponse } from 'next/server';
import { loadModelData } from '@/lib/data/storage';

/**
 * GET /api/health
 * 
 * Health check endpoint for Kubernetes probes.
 * Returns 200 if the service is healthy, 503 otherwise.
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Check if we can access data (doesn't need to exist)
    const data = await loadModelData();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      dataAvailable: !!data,
      dataAge: data ? data.fetchedAt : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Service unavailable',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

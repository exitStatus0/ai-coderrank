import { NextResponse } from 'next/server';

// Force dynamic rendering - don't cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/config
 * 
 * Returns runtime configuration including theme setting.
 * This allows the frontend to dynamically adapt based on environment variables.
 */
export async function GET() {
  // Read env var at runtime (not build time)
  const theme = process.env.THEME || 'dark';
  
  return NextResponse.json({
    theme,
    timestamp: new Date().toISOString(),
  });
}

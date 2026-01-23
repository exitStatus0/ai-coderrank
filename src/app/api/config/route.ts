import { NextResponse } from 'next/server';

/**
 * GET /api/config
 * 
 * Returns runtime configuration including theme setting.
 * This allows the frontend to dynamically adapt based on environment variables.
 */
export async function GET() {
  const theme = process.env.THEME || 'dark';
  
  return NextResponse.json({
    theme,
    timestamp: new Date().toISOString(),
  });
}

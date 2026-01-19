import { NextResponse } from 'next/server';
import { loadModelData } from '@/lib/data/storage';
import { getMockLeaderboardData } from '@/lib/fetcher/leaderboard-fetcher';
import { pricingService } from '@/lib/pricing/pricing-service';
import { ApiResponse, RankedModel, ChartDataPoint } from '@/lib/types';

/**
 * GET /api/models
 * 
 * Returns the cached model data with pricing information.
 * Falls back to mock data if no cached data exists.
 * 
 * Response format:
 * {
 *   success: boolean,
 *   data: { models: RankedModel[], chartData: ChartDataPoint[], fetchedAt: string },
 *   timestamp: string
 * }
 */
export async function GET(): Promise<NextResponse<ApiResponse<{
  models: RankedModel[];
  chartData: ChartDataPoint[];
  fetchedAt: string;
}>>> {
  try {
    // Try to load cached data
    let storedData = await loadModelData();
    
    // If no cached data, use mock data as fallback
    if (!storedData || storedData.models.length === 0) {
      console.log('No cached data found, using mock data');
      
      const mockModels = getMockLeaderboardData();
      const now = new Date().toISOString();
      
      const models: RankedModel[] = mockModels.map((m) => ({
        ...m,
        displayName: m.name,
        pricing: pricingService.getPricing(m.name),
        lastUpdated: now,
      }));
      
      storedData = {
        models,
        fetchedAt: now,
        source: 'mock',
        version: '1.0.0',
      };
    }
    
    // Transform to chart-friendly format
    const chartData: ChartDataPoint[] = storedData.models.map((model) => ({
      name: model.name,
      displayName: model.displayName,
      inputPrice: model.pricing.inputPricePerMillion,
      outputPrice: model.pricing.outputPricePerMillion,
      score: model.score,
      rank: model.rank,
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        models: storedData.models,
        chartData,
        fetchedAt: storedData.fetchedAt,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load model data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/models/refresh
 * 
 * Triggers a manual data refresh (for admin use).
 * In production, this would be protected by authentication.
 */
export async function POST(): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  // For now, just return a message indicating refresh should use the cron job
  return NextResponse.json({
    success: true,
    data: {
      message: 'Manual refresh is handled by the cron job. Run: npm run update-data',
    },
    timestamp: new Date().toISOString(),
  });
}

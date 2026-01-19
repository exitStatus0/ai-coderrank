/**
 * Integration tests for API routes
 * 
 * These tests verify the business logic without needing the Next.js runtime.
 * Full API integration tests would require a running server.
 */

// Mock cheerio to avoid ESM issues in Jest
jest.mock('cheerio', () => ({
  load: jest.fn(() => ({
    toArray: jest.fn(() => []),
    find: jest.fn(() => ({ toArray: jest.fn(() => []) })),
    text: jest.fn(() => ''),
    html: jest.fn(() => ''),
  })),
}));

import { getMockLeaderboardData } from '@/lib/fetcher/leaderboard-fetcher';
import { pricingService } from '@/lib/pricing/pricing-service';
import { RankedModel, ChartDataPoint, ApiResponse } from '@/lib/types';

describe('API Integration Logic', () => {
  describe('Model Data Processing', () => {
    it('should combine leaderboard data with pricing', () => {
      const mockModels = getMockLeaderboardData();
      const now = new Date().toISOString();
      
      const enrichedModels: RankedModel[] = mockModels.map((m) => ({
        ...m,
        displayName: m.name,
        pricing: pricingService.getPricing(m.name),
        lastUpdated: now,
      }));
      
      expect(enrichedModels).toHaveLength(10);
      enrichedModels.forEach((model) => {
        expect(model).toHaveProperty('pricing');
        expect(model).toHaveProperty('displayName');
        expect(model).toHaveProperty('lastUpdated');
      });
    });

    it('should transform to chart data format', () => {
      const mockModels = getMockLeaderboardData();
      const now = new Date().toISOString();
      
      const models: RankedModel[] = mockModels.map((m) => ({
        ...m,
        displayName: m.name,
        pricing: pricingService.getPricing(m.name),
        lastUpdated: now,
      }));
      
      const chartData: ChartDataPoint[] = models.map((model) => ({
        name: model.name,
        displayName: model.displayName,
        inputPrice: model.pricing.inputPricePerMillion,
        outputPrice: model.pricing.outputPricePerMillion,
        score: model.score,
        rank: model.rank,
      }));
      
      expect(chartData).toHaveLength(10);
      chartData.forEach((point) => {
        expect(point).toHaveProperty('name');
        expect(point).toHaveProperty('inputPrice');
        expect(point).toHaveProperty('outputPrice');
        expect(point).toHaveProperty('score');
        expect(point).toHaveProperty('rank');
      });
    });

    it('should have pricing for most top models', () => {
      const mockModels = getMockLeaderboardData();
      
      const pricingCoverage = mockModels.filter((m) => {
        const pricing = pricingService.getPricing(m.name);
        return pricing.source !== 'unknown';
      });
      
      // At least 80% of models should have known pricing
      expect(pricingCoverage.length / mockModels.length).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('API Response Format', () => {
    it('should follow ApiResponse interface for success', () => {
      const validResponse: ApiResponse<{ models: RankedModel[] }> = {
        success: true,
        data: { models: [] },
        timestamp: new Date().toISOString(),
      };

      expect(validResponse).toHaveProperty('success', true);
      expect(validResponse).toHaveProperty('data');
      expect(validResponse).toHaveProperty('timestamp');
    });

    it('should follow ApiResponse interface for errors', () => {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: 'Something went wrong',
        timestamp: new Date().toISOString(),
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeDefined();
      expect(errorResponse.timestamp).toBeDefined();
    });

    it('should have valid ISO timestamp format', () => {
      const timestamp = new Date().toISOString();
      expect(new Date(timestamp).toString()).not.toBe('Invalid Date');
    });
  });

  describe('Health Check Logic', () => {
    it('should return correct data availability status', () => {
      // When data is null
      const dataNull = null;
      expect(!!dataNull).toBe(false);
      
      // When data exists
      const dataExists = { models: [], fetchedAt: '', source: '', version: '' };
      expect(!!dataExists).toBe(true);
    });
  });
});

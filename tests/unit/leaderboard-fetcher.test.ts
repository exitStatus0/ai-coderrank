/**
 * Unit tests for leaderboard fetcher
 * 
 * Note: We only test getMockLeaderboardData as the actual fetcher
 * requires network access and is tested via integration tests.
 */

import { LeaderboardModel } from '@/lib/types';

// Mock cheerio to avoid ESM issues in Jest
jest.mock('cheerio', () => ({
  load: jest.fn(() => ({
    toArray: jest.fn(() => []),
    find: jest.fn(() => ({ toArray: jest.fn(() => []) })),
    text: jest.fn(() => ''),
    html: jest.fn(() => ''),
  })),
}));

// Import after mock
import { getMockLeaderboardData } from '@/lib/fetcher/leaderboard-fetcher';

describe('LeaderboardFetcher', () => {
  describe('getMockLeaderboardData', () => {
    let mockData: LeaderboardModel[];

    beforeAll(() => {
      mockData = getMockLeaderboardData();
    });

    it('should return an array of models', () => {
      expect(Array.isArray(mockData)).toBe(true);
      expect(mockData.length).toBeGreaterThan(0);
    });

    it('should return 10 models', () => {
      expect(mockData.length).toBe(10);
    });

    it('should have models with all required fields', () => {
      mockData.forEach((model) => {
        expect(model).toHaveProperty('rank');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('score');
        expect(model).toHaveProperty('organization');
        expect(model).toHaveProperty('license');
        expect(model).toHaveProperty('votes');
      });
    });

    it('should have models sorted by rank', () => {
      for (let i = 0; i < mockData.length - 1; i++) {
        expect(mockData[i].rank).toBeLessThan(mockData[i + 1].rank);
      }
    });

    it('should have consecutive ranks starting from 1', () => {
      mockData.forEach((model, index) => {
        expect(model.rank).toBe(index + 1);
      });
    });

    it('should have positive scores', () => {
      mockData.forEach((model) => {
        expect(model.score).toBeGreaterThan(0);
      });
    });

    it('should have scores in descending order', () => {
      for (let i = 0; i < mockData.length - 1; i++) {
        expect(mockData[i].score).toBeGreaterThanOrEqual(mockData[i + 1].score);
      }
    });

    it('should have non-empty model names', () => {
      mockData.forEach((model) => {
        expect(model.name).toBeTruthy();
        expect(model.name.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty organizations', () => {
      mockData.forEach((model) => {
        expect(model.organization).toBeTruthy();
      });
    });

    it('should include major AI providers', () => {
      const organizations = mockData.map((m) => m.organization);
      expect(organizations).toContain('OpenAI');
      expect(organizations).toContain('Anthropic');
    });

    it('should have non-negative votes', () => {
      mockData.forEach((model) => {
        expect(model.votes).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Model data structure', () => {
    it('should have the correct LeaderboardModel shape', () => {
      const model: LeaderboardModel = {
        rank: 1,
        name: 'Test Model',
        score: 1000,
        organization: 'Test Org',
        license: 'MIT',
        votes: 100,
      };

      expect(model.rank).toBe(1);
      expect(model.name).toBe('Test Model');
      expect(model.score).toBe(1000);
      expect(model.organization).toBe('Test Org');
      expect(model.license).toBe('MIT');
      expect(model.votes).toBe(100);
    });
  });
});

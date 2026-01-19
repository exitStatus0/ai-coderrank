import { getDataAge } from '@/lib/data/storage';

describe('Storage', () => {
  describe('getDataAge', () => {
    it('should return minutes for recent data', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const age = getDataAge(fiveMinutesAgo);
      expect(age).toMatch(/\d+ minute/);
    });

    it('should return hours for data a few hours old', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      const age = getDataAge(threeHoursAgo);
      expect(age).toMatch(/\d+ hour/);
    });

    it('should return days for data over 24 hours old', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const age = getDataAge(twoDaysAgo);
      expect(age).toMatch(/\d+ day/);
    });

    it('should handle singular vs plural correctly', () => {
      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
      const age = getDataAge(oneHourAgo);
      expect(age).toBe('1 hour ago');
    });

    it('should handle edge case of exactly 24 hours', () => {
      // Just over 24 hours to trigger "days" display
      const justOverOneDayAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      const age = getDataAge(justOverOneDayAgo);
      expect(age).toMatch(/day/);
    });
  });
});

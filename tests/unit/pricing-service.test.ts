import { findPricing, normalizeModelName, StaticPricingProvider } from '@/lib/pricing/pricing-service';
import { PRICING_DATABASE, UNKNOWN_PRICING } from '@/lib/pricing/pricing-data';

describe('PricingService', () => {
  describe('normalizeModelName', () => {
    it('should convert to lowercase', () => {
      expect(normalizeModelName('GPT-4O')).toBe('gpt-4o');
    });

    it('should normalize separators', () => {
      expect(normalizeModelName('claude_3_5_sonnet')).toBe('claude-3-5-sonnet');
      expect(normalizeModelName('gpt  4  turbo')).toBe('gpt-4-turbo');
    });

    it('should remove parenthetical info', () => {
      expect(normalizeModelName('GPT-4o (OpenAI)')).toBe('gpt-4o');
    });

    it('should remove common suffixes', () => {
      expect(normalizeModelName('llama-3-70b-instruct')).toBe('llama-3-70b');
      expect(normalizeModelName('mixtral-chat')).toBe('mixtral');
      expect(normalizeModelName('gpt-4-preview')).toBe('gpt-4');
    });

    it('should remove provider prefixes', () => {
      expect(normalizeModelName('openai/gpt-4')).toBe('gpt-4');
      expect(normalizeModelName('anthropic-claude-3')).toBe('claude-3');
    });
  });

  describe('findPricing', () => {
    it('should find exact match pricing', () => {
      const pricing = findPricing('gpt-4o');
      expect(pricing).toEqual(PRICING_DATABASE['gpt-4o']);
      expect(pricing.source).toBe('official');
    });

    it('should find pricing with name variations', () => {
      const pricing = findPricing('GPT-4o (OpenAI)');
      expect(pricing.inputPricePerMillion).toBe(2.50);
      expect(pricing.outputPricePerMillion).toBe(10.00);
    });

    it('should find Claude pricing', () => {
      const pricing = findPricing('Claude 3.5 Sonnet');
      expect(pricing.source).not.toBe('unknown');
      expect(pricing.inputPricePerMillion).toBeGreaterThan(0);
    });

    it('should find Gemini pricing', () => {
      const pricing = findPricing('Gemini 1.5 Pro');
      expect(pricing.source).not.toBe('unknown');
    });

    it('should find DeepSeek pricing', () => {
      const pricing = findPricing('DeepSeek-V3');
      expect(pricing.inputPricePerMillion).toBeGreaterThan(0);
    });

    it('should return unknown pricing for unrecognized models', () => {
      const pricing = findPricing('totally-fake-model-xyz');
      expect(pricing).toEqual(UNKNOWN_PRICING);
      expect(pricing.source).toBe('unknown');
    });

    it('should handle model family matching', () => {
      // GPT-4 family
      expect(findPricing('gpt-4o-2024-08-06').source).not.toBe('unknown');
      
      // Claude family
      expect(findPricing('claude-3-5-sonnet-20241022').source).not.toBe('unknown');
      
      // o1 family
      expect(findPricing('o1-mini').source).not.toBe('unknown');
    });
  });

  describe('StaticPricingProvider', () => {
    const provider = new StaticPricingProvider();

    it('should implement PricingProvider interface', () => {
      expect(typeof provider.getPricing).toBe('function');
    });

    it('should return pricing for known models', () => {
      const pricing = provider.getPricing('gpt-4o');
      expect(pricing.inputPricePerMillion).toBeGreaterThan(0);
    });

    it('should return unknown pricing for unknown models', () => {
      const pricing = provider.getPricing('unknown-model');
      expect(pricing.source).toBe('unknown');
    });
  });

  describe('PricingData integrity', () => {
    it('should have positive prices for all entries', () => {
      Object.entries(PRICING_DATABASE).forEach(([name, pricing]) => {
        expect(pricing.inputPricePerMillion).toBeGreaterThan(0);
        expect(pricing.outputPricePerMillion).toBeGreaterThan(0);
      });
    });

    it('should have valid source values', () => {
      Object.entries(PRICING_DATABASE).forEach(([name, pricing]) => {
        expect(['official', 'estimated', 'unknown']).toContain(pricing.source);
      });
    });

    it('should include major model providers', () => {
      const expectedModels = ['gpt-4o', 'claude-3.5-sonnet', 'gemini-1.5-pro', 'deepseek-v3'];
      expectedModels.forEach((model) => {
        expect(PRICING_DATABASE[model]).toBeDefined();
      });
    });
  });
});

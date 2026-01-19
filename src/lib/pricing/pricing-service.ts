import { ModelPricing, SubscriptionInfo } from '../types';
import { PRICING_DATABASE, UNKNOWN_PRICING, SUBSCRIPTION_DATABASE } from './pricing-data';

/**
 * Pricing Service
 * 
 * Responsible for matching model names to pricing data.
 * Implements fuzzy matching to handle naming variations.
 * 
 * Design: Strategy pattern - can be extended to use different
 * pricing sources (API, database, etc.) without changing interface.
 */

export interface PricingProvider {
  getPricing(modelName: string): ModelPricing;
  getSubscription(organization: string): SubscriptionInfo | undefined;
}

/**
 * Normalizes model names for matching
 * Handles common variations: casing, version suffixes, prefixes
 */
export function normalizeModelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')            // Remove parenthetical info first
    .replace(/[-_\s]+/g, '-')           // Normalize separators
    .replace(/-instruct$/, '')          // Remove common suffixes
    .replace(/-chat$/, '')
    .replace(/-preview$/, '')
    .replace(/-latest$/, '')
    .replace(/^openai[-/]/, '')         // Remove provider prefixes
    .replace(/^anthropic[-/]/, '')
    .replace(/^google[-/]/, '')
    .replace(/^meta[-/]/, '')
    .replace(/-+$/, '')                 // Remove trailing dashes
    .replace(/^-+/, '')                 // Remove leading dashes
    .trim();
}

/**
 * Attempts to find a matching price for a model name
 * Uses progressive matching strategies
 */
export function findPricing(modelName: string): ModelPricing {
  const normalized = normalizeModelName(modelName);
  
  // Strategy 1: Direct match
  if (PRICING_DATABASE[normalized]) {
    return PRICING_DATABASE[normalized];
  }
  
  // Strategy 2: Check if normalized name is contained in any key
  for (const [key, pricing] of Object.entries(PRICING_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return pricing;
    }
  }
  
  // Strategy 3: Partial match on model family
  const familyPatterns = [
    // GPT-5.x family
    { pattern: /gpt-5\.2.*high/, key: 'gpt-5.2-high' },
    { pattern: /gpt-5\.2/, key: 'gpt-5.2' },
    { pattern: /gpt-5.*medium/, key: 'gpt-5-medium' },
    { pattern: /gpt-5/, key: 'gpt-5' },
    // GPT-4.x family
    { pattern: /gpt-4o/, key: 'gpt-4o' },
    { pattern: /gpt-4/, key: 'gpt-4-turbo' },
    // Claude 4.x family (new)
    { pattern: /claude.*opus.*4\.5/, key: 'claude-opus-4.5' },
    { pattern: /claude.*sonnet.*4\.5/, key: 'claude-sonnet-4.5' },
    { pattern: /claude.*opus.*4\.1/, key: 'claude-opus-4.1' },
    { pattern: /claude.*sonnet.*4\.1/, key: 'claude-sonnet-4.1' },
    // Claude 3.x family
    { pattern: /claude.*sonnet/, key: 'claude-3.5-sonnet' },
    { pattern: /claude.*opus/, key: 'claude-3-opus' },
    { pattern: /claude.*haiku/, key: 'claude-3-haiku' },
    // Gemini 3.x family (new)
    { pattern: /gemini.*3.*pro/, key: 'gemini-3-pro' },
    { pattern: /gemini.*3.*flash/, key: 'gemini-3-flash' },
    // Gemini 2.x/1.x family
    { pattern: /gemini.*pro/, key: 'gemini-1.5-pro' },
    { pattern: /gemini.*flash/, key: 'gemini-1.5-flash' },
    // DeepSeek
    { pattern: /deepseek.*coder/, key: 'deepseek-coder' },
    { pattern: /deepseek.*v3/, key: 'deepseek-v3' },
    { pattern: /deepseek.*r1/, key: 'deepseek-r1' },
    // Llama
    { pattern: /llama.*405/, key: 'llama-3.1-405b' },
    { pattern: /llama.*70/, key: 'llama-3.1-70b' },
    // Qwen
    { pattern: /qwen.*coder/, key: 'qwen-2.5-coder' },
    // OpenAI reasoning models
    { pattern: /o1-mini/, key: 'o1-mini' },
    { pattern: /o1/, key: 'o1' },
    { pattern: /o3-mini/, key: 'o3-mini' },
    // Grok 4.x family (new)
    { pattern: /grok.*4\.1.*thinking/, key: 'grok-4.1-thinking' },
    { pattern: /grok.*4\.1/, key: 'grok-4.1-thinking' },
    { pattern: /grok.*4/, key: 'grok-4' },
    { pattern: /grok/, key: 'grok-2' },
    // Chinese models
    { pattern: /ernie.*5/, key: 'ernie-5.0' },
    { pattern: /ernie/, key: 'ernie-4.0' },
    { pattern: /glm.*4\.7/, key: 'glm-4.7' },
    { pattern: /glm/, key: 'glm-4' },
    { pattern: /minimax.*m2|m2\.1/, key: 'minimax-m2.1' },
  ];
  
  for (const { pattern, key } of familyPatterns) {
    if (pattern.test(normalized)) {
      return PRICING_DATABASE[key];
    }
  }
  
  return UNKNOWN_PRICING;
}

/**
 * Finds subscription info for an organization
 */
export function findSubscription(organization: string): SubscriptionInfo | undefined {
  return SUBSCRIPTION_DATABASE[organization];
}

/**
 * Default pricing provider using static database
 */
export class StaticPricingProvider implements PricingProvider {
  getPricing(modelName: string): ModelPricing {
    return findPricing(modelName);
  }
  
  getSubscription(organization: string): SubscriptionInfo | undefined {
    return findSubscription(organization);
  }
}

// Singleton instance for convenience
export const pricingService = new StaticPricingProvider();

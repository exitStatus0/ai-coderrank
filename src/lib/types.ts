/**
 * Core domain types for AI CoderRank
 * 
 * Design Decision: Using interfaces over types for extensibility.
 * All monetary values are in USD per 1M tokens for consistency.
 */

/** Raw model data from leaderboard */
export interface LeaderboardModel {
  rank: number;
  name: string;
  score: number;
  organization: string;
  license: string;
  votes: number;
}

/** Pricing information per model */
export interface ModelPricing {
  inputPricePerMillion: number;  // USD per 1M input tokens
  outputPricePerMillion: number; // USD per 1M output tokens
  source: 'official' | 'estimated' | 'unknown';
}

/** Subscription tier information */
export interface SubscriptionTier {
  name: string;           // e.g., "Free", "Plus", "Pro"
  price: number;          // USD per month (0 for free)
  features: string[];     // Key features
}

/** Subscription information per provider */
export interface SubscriptionInfo {
  provider: string;       // e.g., "OpenAI", "Anthropic"
  webUrl: string;         // URL to the web interface
  tiers: SubscriptionTier[];
  modelAccess: string[];  // Which models are available via subscription
}

/** Combined model data with pricing */
export interface RankedModel {
  rank: number;
  name: string;
  displayName: string;
  score: number;
  organization: string;
  license: string;
  votes: number;
  pricing: ModelPricing;
  subscription?: SubscriptionInfo; // Subscription option if available
  lastUpdated: string; // ISO date
}

/** Stored data structure */
export interface StoredData {
  models: RankedModel[];
  fetchedAt: string;   // ISO date
  source: string;      // Source URL
  version: string;     // Data schema version
}

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/** Chart data point for Recharts */
export interface ChartDataPoint {
  name: string;
  displayName: string;
  inputPrice: number;
  outputPrice: number;
  score: number;
  rank: number;
}

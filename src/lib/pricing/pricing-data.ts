import { ModelPricing, SubscriptionInfo } from '../types';

/**
 * Model Pricing Database
 * 
 * Trade-off: Hardcoded pricing vs API integration
 * - Pros: No external dependency, fast, predictable
 * - Cons: Requires manual updates when prices change
 * 
 * Alternative: Could integrate with a pricing API (e.g., LiteLLM pricing API)
 * Chosen approach: Static data for simplicity; easy to extend to API later
 * 
 * Prices are per 1M tokens in USD as of 2024
 * Sources: Official provider pricing pages
 */

type PricingMap = Record<string, ModelPricing>;

export const PRICING_DATABASE: PricingMap = {
  // OpenAI Models
  'gpt-4o': {
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.00,
    source: 'official',
  },
  'gpt-4o-mini': {
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    source: 'official',
  },
  'gpt-4-turbo': {
    inputPricePerMillion: 10.00,
    outputPricePerMillion: 30.00,
    source: 'official',
  },
  'gpt-4': {
    inputPricePerMillion: 30.00,
    outputPricePerMillion: 60.00,
    source: 'official',
  },
  'o1': {
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 60.00,
    source: 'official',
  },
  'o1-mini': {
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 12.00,
    source: 'official',
  },
  'o1-preview': {
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 60.00,
    source: 'official',
  },
  'o3-mini': {
    inputPricePerMillion: 1.10,
    outputPricePerMillion: 4.40,
    source: 'official',
  },
  
  // Anthropic Models - Claude 4.x series (2025-2026)
  'claude-opus-4.5': {
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 75.00,
    source: 'official',
  },
  'claude-sonnet-4.5': {
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    source: 'official',
  },
  'claude-opus-4.1': {
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 75.00,
    source: 'official',
  },
  'claude-sonnet-4.1': {
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    source: 'official',
  },
  // Anthropic Models - Claude 3.x series (legacy)
  'claude-3.5-sonnet': {
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    source: 'official',
  },
  'claude-3-5-sonnet': {
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    source: 'official',
  },
  'claude-3-5-sonnet-20241022': {
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    source: 'official',
  },
  'claude-3-opus': {
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 75.00,
    source: 'official',
  },
  'claude-3-sonnet': {
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    source: 'official',
  },
  'claude-3-haiku': {
    inputPricePerMillion: 0.25,
    outputPricePerMillion: 1.25,
    source: 'official',
  },
  
  // Google Models - Gemini 3.x series (2025-2026)
  'gemini-3-pro': {
    inputPricePerMillion: 2.00,
    outputPricePerMillion: 8.00,
    source: 'estimated',
  },
  'gemini-3-flash': {
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    source: 'estimated',
  },
  // Google Models - Gemini 2.x series
  'gemini-1.5-pro': {
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    source: 'official',
  },
  'gemini-2.0-flash': {
    inputPricePerMillion: 0.10,
    outputPricePerMillion: 0.40,
    source: 'official',
  },
  'gemini-1.5-flash': {
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.30,
    source: 'official',
  },
  'gemini-pro': {
    inputPricePerMillion: 0.50,
    outputPricePerMillion: 1.50,
    source: 'official',
  },
  'gemini-2.0-flash-thinking': {
    inputPricePerMillion: 0.10,
    outputPricePerMillion: 0.40,
    source: 'estimated',
  },
  
  // DeepSeek Models
  'deepseek-v3': {
    inputPricePerMillion: 0.27,
    outputPricePerMillion: 1.10,
    source: 'official',
  },
  'deepseek-coder': {
    inputPricePerMillion: 0.14,
    outputPricePerMillion: 0.28,
    source: 'official',
  },
  'deepseek-coder-v2': {
    inputPricePerMillion: 0.14,
    outputPricePerMillion: 0.28,
    source: 'official',
  },
  'deepseek-r1': {
    inputPricePerMillion: 0.55,
    outputPricePerMillion: 2.19,
    source: 'official',
  },
  
  // Meta Llama Models (via cloud providers, prices vary)
  'llama-3.1-405b': {
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 3.00,
    source: 'estimated',
  },
  'llama-3.1-70b': {
    inputPricePerMillion: 0.88,
    outputPricePerMillion: 0.88,
    source: 'estimated',
  },
  'llama-3.3-70b': {
    inputPricePerMillion: 0.88,
    outputPricePerMillion: 0.88,
    source: 'estimated',
  },
  'llama-3-70b': {
    inputPricePerMillion: 0.88,
    outputPricePerMillion: 0.88,
    source: 'estimated',
  },
  
  // Mistral Models
  'mistral-large': {
    inputPricePerMillion: 2.00,
    outputPricePerMillion: 6.00,
    source: 'official',
  },
  'mixtral-8x7b': {
    inputPricePerMillion: 0.70,
    outputPricePerMillion: 0.70,
    source: 'official',
  },
  'codestral': {
    inputPricePerMillion: 0.20,
    outputPricePerMillion: 0.60,
    source: 'official',
  },
  
  // Cohere Models
  'command-r-plus': {
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.00,
    source: 'official',
  },
  'command-r': {
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    source: 'official',
  },
  
  // Qwen Models
  'qwen-2.5-coder': {
    inputPricePerMillion: 0.30,
    outputPricePerMillion: 0.60,
    source: 'estimated',
  },
  'qwen-2.5-72b': {
    inputPricePerMillion: 0.90,
    outputPricePerMillion: 0.90,
    source: 'estimated',
  },
  'qwen2.5-coder-32b-instruct': {
    inputPricePerMillion: 0.30,
    outputPricePerMillion: 0.60,
    source: 'estimated',
  },
  
  // xAI Models - Grok 4.x series (2025-2026)
  'grok-4.1-thinking': {
    inputPricePerMillion: 5.00,
    outputPricePerMillion: 25.00,
    source: 'estimated',
  },
  'grok-4': {
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    source: 'estimated',
  },
  'grok-2': {
    inputPricePerMillion: 2.00,
    outputPricePerMillion: 10.00,
    source: 'official',
  },
  'grok-beta': {
    inputPricePerMillion: 5.00,
    outputPricePerMillion: 15.00,
    source: 'estimated',
  },
  
  // OpenAI Models - GPT-5.x series (2025-2026)
  'gpt-5.2-high': {
    inputPricePerMillion: 10.00,
    outputPricePerMillion: 40.00,
    source: 'estimated',
  },
  'gpt-5.2': {
    inputPricePerMillion: 7.50,
    outputPricePerMillion: 30.00,
    source: 'estimated',
  },
  'gpt-5-medium': {
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 12.00,
    source: 'estimated',
  },
  'gpt-5': {
    inputPricePerMillion: 5.00,
    outputPricePerMillion: 20.00,
    source: 'estimated',
  },
  
  // Baidu ERNIE Models (Chinese)
  'ernie-5.0': {
    inputPricePerMillion: 1.50,
    outputPricePerMillion: 6.00,
    source: 'estimated',
  },
  'ernie-4.0': {
    inputPricePerMillion: 1.00,
    outputPricePerMillion: 4.00,
    source: 'estimated',
  },
  
  // Zhipu GLM Models (Chinese)
  'glm-4.7': {
    inputPricePerMillion: 1.00,
    outputPricePerMillion: 4.00,
    source: 'estimated',
  },
  'glm-4': {
    inputPricePerMillion: 0.70,
    outputPricePerMillion: 2.80,
    source: 'estimated',
  },
  
  // MiniMax Models (Chinese)
  'minimax-m2.1': {
    inputPricePerMillion: 0.50,
    outputPricePerMillion: 2.00,
    source: 'estimated',
  },
};

/** Default pricing for unknown models */
export const UNKNOWN_PRICING: ModelPricing = {
  inputPricePerMillion: 0,
  outputPricePerMillion: 0,
  source: 'unknown',
};

/**
 * Subscription Plans Database
 * 
 * Information about web-based subscription options for AI models.
 * Prices are monthly USD as of 2024.
 */
export const SUBSCRIPTION_DATABASE: Record<string, SubscriptionInfo> = {
  'OpenAI': {
    provider: 'OpenAI',
    webUrl: 'https://chat.openai.com',
    tiers: [
      {
        name: 'Free',
        price: 0,
        features: ['GPT-4o mini', 'Limited GPT-4o', 'Basic features'],
      },
      {
        name: 'Plus',
        price: 20,
        features: ['GPT-4o', 'GPT-4o mini', 'o1-mini', 'DALL-E', 'Advanced analysis'],
      },
      {
        name: 'Pro',
        price: 200,
        features: ['Unlimited GPT-4o', 'o1 pro mode', 'Extended thinking', 'Priority access'],
      },
    ],
    modelAccess: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o1-mini'],
  },
  'Anthropic': {
    provider: 'Anthropic',
    webUrl: 'https://claude.ai',
    tiers: [
      {
        name: 'Free',
        price: 0,
        features: ['Claude 3.5 Sonnet', 'Limited messages', 'Basic features'],
      },
      {
        name: 'Pro',
        price: 20,
        features: ['Claude 3.5 Sonnet', 'Claude 3 Opus', '5x more usage', 'Priority access'],
      },
      {
        name: 'Team',
        price: 30,
        features: ['Everything in Pro', 'Higher limits', 'Admin tools', 'Per user/month'],
      },
    ],
    modelAccess: ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
  },
  'Google': {
    provider: 'Google',
    webUrl: 'https://gemini.google.com',
    tiers: [
      {
        name: 'Free',
        price: 0,
        features: ['Gemini 1.5 Flash', 'Basic features', 'Limited usage'],
      },
      {
        name: 'Advanced',
        price: 20,
        features: ['Gemini 1.5 Pro', 'Gemini 2.0', '2TB storage', 'Google One included'],
      },
    ],
    modelAccess: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'],
  },
  'DeepSeek': {
    provider: 'DeepSeek',
    webUrl: 'https://chat.deepseek.com',
    tiers: [
      {
        name: 'Free',
        price: 0,
        features: ['DeepSeek-V3', 'DeepSeek-R1', 'Unlimited messages', 'Full features'],
      },
    ],
    modelAccess: ['deepseek-v3', 'deepseek-r1', 'deepseek-coder'],
  },
  'Alibaba': {
    provider: 'Alibaba',
    webUrl: 'https://tongyi.aliyun.com',
    tiers: [
      {
        name: 'Free',
        price: 0,
        features: ['Qwen models', 'Web interface', 'Basic features'],
      },
    ],
    modelAccess: ['qwen-2.5-coder', 'qwen-2.5-72b'],
  },
  'xAI': {
    provider: 'xAI',
    webUrl: 'https://x.ai',
    tiers: [
      {
        name: 'Free',
        price: 0,
        features: ['Grok via X/Twitter', 'Limited usage', 'Basic features'],
      },
      {
        name: 'Premium+',
        price: 22,
        features: ['Grok 4', 'Unlimited messages', 'Priority access', 'X Premium+ required'],
      },
    ],
    modelAccess: ['grok-4', 'grok-4.1-thinking'],
  },
};

/**
 * Data Update Script
 * 
 * Run daily via Kubernetes CronJob to refresh leaderboard data.
 * This script is designed to be idempotent and safe to run multiple times.
 * 
 * Usage: npx tsx src/scripts/update-data.ts
 * Or via npm: npm run update-data
 */

import { fetchTopCodingModels, getMockLeaderboardData } from '../lib/fetcher/leaderboard-fetcher';
import { pricingService } from '../lib/pricing/pricing-service';
import { saveModelData, loadModelData } from '../lib/data/storage';
import { RankedModel, LeaderboardModel } from '../lib/types';

const TOP_N = 10;
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

/**
 * Enriches leaderboard models with pricing and subscription data
 */
function enrichWithPricing(models: LeaderboardModel[]): RankedModel[] {
  const now = new Date().toISOString();
  
  return models.map((model) => {
    const pricing = pricingService.getPricing(model.name);
    const subscription = pricingService.getSubscription(model.organization);
    
    // Create display-friendly name
    const displayName = model.name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    
    return {
      ...model,
      displayName,
      pricing,
      subscription,
      lastUpdated: now,
    };
  });
}

/**
 * Main update function
 */
async function updateData(): Promise<void> {
  console.log('🚀 Starting data update...');
  console.log(`   Mode: ${USE_MOCK_DATA ? 'MOCK' : 'LIVE'}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  
  try {
    // Fetch leaderboard data
    console.log('\n📊 Fetching leaderboard data...');
    const models = USE_MOCK_DATA 
      ? getMockLeaderboardData()
      : await fetchTopCodingModels(TOP_N);
    
    console.log(`   Found ${models.length} models`);
    
    if (models.length === 0) {
      console.warn('⚠️  No models found, keeping existing data');
      return;
    }
    
    // Enrich with pricing
    console.log('\n💰 Enriching with pricing data...');
    const enrichedModels = enrichWithPricing(models);
    
    // Log pricing coverage
    const knownPricing = enrichedModels.filter(m => m.pricing.source !== 'unknown').length;
    console.log(`   Pricing coverage: ${knownPricing}/${enrichedModels.length} models`);
    
    // Save to storage
    console.log('\n💾 Saving to storage...');
    await saveModelData(enrichedModels);
    
    // Verify save
    const saved = await loadModelData();
    if (saved && saved.models.length === enrichedModels.length) {
      console.log('   ✅ Data saved successfully');
    } else {
      throw new Error('Data verification failed');
    }
    
    // Summary
    console.log('\n✨ Update complete!');
    console.log('   Models saved:');
    enrichedModels.forEach((m, i) => {
      const priceInfo = m.pricing.source !== 'unknown'
        ? `$${m.pricing.inputPricePerMillion}/$${m.pricing.outputPricePerMillion}`
        : 'N/A';
      console.log(`   ${i + 1}. ${m.displayName} (${m.organization}) - Score: ${m.score} - Price: ${priceInfo}`);
    });
    
  } catch (error) {
    console.error('\n❌ Update failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
updateData();

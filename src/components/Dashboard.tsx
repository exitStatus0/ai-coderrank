'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import PriceChart from './PriceChart';
import ScoreChart from './ScoreChart';
import ModelCard from './ModelCard';
import SubscriptionCompare from './SubscriptionCompare';
import { RankedModel, ChartDataPoint, ApiResponse } from '@/lib/types';

type ViewMode = 'cards' | 'price' | 'score' | 'subscriptions';
type PricingMode = 'api' | 'subscription';

interface DashboardData {
  models: RankedModel[];
  chartData: ChartDataPoint[];
  fetchedAt: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [pricingMode, setPricingMode] = useState<PricingMode>('api');
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/models');
        const result: ApiResponse<DashboardData> = await response.json();
        
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to load data');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent animate-spin" />
          <p className="text-[var(--text-muted)]">Loading leaderboard data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Unable to Load Data
          </h2>
          <p className="text-[var(--text-muted)] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-lg bg-[var(--accent-cyan)] text-black font-semibold hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!data) return null;

  // Count models with free web access
  const freeAccessCount = data.models.filter(
    m => m.subscription?.tiers.some(t => t.price === 0)
  ).length;
  
  const ViewToggle = () => (
    <div className="flex gap-2 p-1 rounded-lg bg-[var(--bg-secondary)]">
      {[
        { id: 'cards', label: 'Cards', icon: '▤' },
        { id: 'price', label: 'API Price', icon: '💰' },
        { id: 'subscriptions', label: 'Subscriptions', icon: '📱' },
        { id: 'score', label: 'Score', icon: '📊' },
      ].map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => setViewMode(id as ViewMode)}
          className={`
            px-3 py-2 rounded-md text-sm font-medium transition-all
            ${viewMode === id
              ? 'bg-[var(--accent-cyan)] text-black'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }
          `}
        >
          <span className="mr-1">{icon}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );

  const PricingModeToggle = () => (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-[var(--text-muted)]">Show:</span>
      <button
        onClick={() => setPricingMode('api')}
        className={`px-3 py-1 rounded-md transition-all ${
          pricingMode === 'api'
            ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        API Pricing
      </button>
      <button
        onClick={() => setPricingMode('subscription')}
        className={`px-3 py-1 rounded-md transition-all ${
          pricingMode === 'subscription'
            ? 'bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        Subscriptions
      </button>
    </div>
  );
  
  return (
    <div className="min-h-screen">
      <Header lastUpdated={data.fetchedAt} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-stagger">
          <div className="glass-card p-4 text-center hover-lift">
            <div className="text-3xl font-bold text-[var(--accent-cyan)]">
              {data.models.length}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Top Models</div>
          </div>
          <div className="glass-card p-4 text-center hover-lift">
            <div className="text-3xl font-bold text-[var(--accent-green)]">
              ${Math.min(...data.chartData.filter(d => d.inputPrice > 0).map(d => d.inputPrice + d.outputPrice)).toFixed(2)}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Cheapest API</div>
          </div>
          <div className="glass-card p-4 text-center hover-lift">
            <div className="text-3xl font-bold text-[var(--accent-purple)]">
              {freeAccessCount}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Free Web Access</div>
          </div>
          <div className="glass-card p-4 text-center hover-lift">
            <div className="text-3xl font-bold text-[var(--accent-orange)]">
              {Math.max(...data.models.map(m => m.score))}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Top Score</div>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <ViewToggle />
          {viewMode === 'cards' && <PricingModeToggle />}
        </div>
        
        {/* Content based on view mode */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-stagger">
            {data.models.map((model) => (
              <ModelCard 
                key={model.name} 
                model={model} 
                showSubscription={pricingMode === 'subscription'}
              />
            ))}
          </div>
        )}
        
        {viewMode === 'price' && (
          <PriceChart data={data.chartData} />
        )}

        {viewMode === 'subscriptions' && (
          <SubscriptionCompare models={data.models} />
        )}
        
        {viewMode === 'score' && (
          <ScoreChart data={data.chartData} />
        )}
        
        {/* Footer note */}
        <div className="mt-12 text-center text-sm text-[var(--text-muted)]">
          <p>
            Data sourced from{' '}
            <a
              href="https://lmarena.ai/leaderboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-cyan)] hover:underline"
            >
              LMArena Leaderboard
            </a>
            {' '}• Pricing from official provider pages
          </p>
          <p className="mt-1 text-[var(--text-muted)]/60">
            API prices per 1M tokens • Subscriptions monthly USD • Updated daily
          </p>
        </div>
      </main>
    </div>
  );
}

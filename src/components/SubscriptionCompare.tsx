'use client';

import { RankedModel, SubscriptionInfo } from '@/lib/types';

interface SubscriptionCompareProps {
  models: RankedModel[];
}

// Provider colors
const PROVIDER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'OpenAI': { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  'Anthropic': { bg: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  'Google': { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  'DeepSeek': { bg: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  'Alibaba': { bg: 'from-orange-600/20 to-orange-700/10', border: 'border-orange-600/30', text: 'text-orange-500' },
};

function SubscriptionCard({ subscription, modelsIncluded }: { 
  subscription: SubscriptionInfo; 
  modelsIncluded: RankedModel[];
}) {
  const colors = PROVIDER_COLORS[subscription.provider] || {
    bg: 'from-gray-500/20 to-gray-600/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
  };

  const freeTier = subscription.tiers.find(t => t.price === 0);
  const paidTiers = subscription.tiers.filter(t => t.price > 0);

  return (
    <div className={`glass-card p-6 border ${colors.border} hover-lift`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${colors.text}`} style={{ fontFamily: 'var(--font-display)' }}>
          {subscription.provider}
        </h3>
        <a
          href={subscription.webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--accent-cyan)] hover:underline"
        >
          {subscription.webUrl.replace('https://', '')} →
        </a>
      </div>

      {/* Models included */}
      <div className="mb-4">
        <div className="text-xs text-[var(--text-muted)] mb-2">Top coding models available:</div>
        <div className="flex flex-wrap gap-2">
          {modelsIncluded.map((model) => (
            <span
              key={model.name}
              className="px-2 py-1 text-xs rounded-md bg-white/5 text-[var(--text-secondary)]"
            >
              #{model.rank} {model.displayName}
            </span>
          ))}
        </div>
      </div>

      {/* Tiers */}
      <div className="space-y-3">
        {/* Free tier */}
        {freeTier && (
          <div className="p-3 rounded-lg bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[var(--accent-green)]">
                {freeTier.name}
              </span>
              <span className="text-lg font-bold text-[var(--accent-green)]">
                FREE
              </span>
            </div>
            <ul className="text-xs text-[var(--text-muted)] space-y-1">
              {freeTier.features.map((feature, i) => (
                <li key={i}>• {feature}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Paid tiers */}
        {paidTiers.map((tier) => (
          <div
            key={tier.name}
            className={`p-3 rounded-lg bg-gradient-to-br ${colors.bg} border ${colors.border}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold ${colors.text}`}>
                {tier.name}
              </span>
              <div className="text-right">
                <span className="text-xl font-bold text-[var(--text-primary)]">
                  ${tier.price}
                </span>
                <span className="text-xs text-[var(--text-muted)]">/mo</span>
              </div>
            </div>
            <ul className="text-xs text-[var(--text-muted)] space-y-1">
              {tier.features.map((feature, i) => (
                <li key={i}>• {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SubscriptionCompare({ models }: SubscriptionCompareProps) {
  // Group models by provider and get unique subscriptions
  const subscriptionMap = new Map<string, { subscription: SubscriptionInfo; models: RankedModel[] }>();
  
  models.forEach((model) => {
    if (model.subscription) {
      const existing = subscriptionMap.get(model.subscription.provider);
      if (existing) {
        existing.models.push(model);
      } else {
        subscriptionMap.set(model.subscription.provider, {
          subscription: model.subscription,
          models: [model],
        });
      }
    }
  });

  const subscriptions = Array.from(subscriptionMap.values());

  if (subscriptions.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-[var(--text-muted)]">No subscription data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Subscription Plans Comparison
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Access top coding AI models through web interfaces. Great for individual use, chat, and exploration.
          For building apps and automation, use the API pricing.
        </p>
        
        {/* Quick comparison */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-[var(--accent-green)]">
              {subscriptions.filter(s => s.subscription.tiers.some(t => t.price === 0)).length}
            </div>
            <div className="text-xs text-[var(--text-muted)]">Free Options</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-[var(--accent-purple)]">
              $20
            </div>
            <div className="text-xs text-[var(--text-muted)]">Most Common Price</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-[var(--accent-cyan)]">
              {subscriptions.length}
            </div>
            <div className="text-xs text-[var(--text-muted)]">Providers</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-[var(--accent-orange)]">
              {models.filter(m => m.subscription).length}
            </div>
            <div className="text-xs text-[var(--text-muted)]">Models with Web UI</div>
          </div>
        </div>
      </div>

      {/* Subscription cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {subscriptions.map(({ subscription, models: includedModels }) => (
          <SubscriptionCard
            key={subscription.provider}
            subscription={subscription}
            modelsIncluded={includedModels}
          />
        ))}
      </div>

      {/* Tip */}
      <div className="glass-card p-4 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          💡 <strong className="text-[var(--text-secondary)]">Tip:</strong> DeepSeek offers 
          <span className="text-[var(--accent-green)]"> completely free </span>
          access to their top models. Great for trying out AI coding assistants!
        </p>
      </div>
    </div>
  );
}

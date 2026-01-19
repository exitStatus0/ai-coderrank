'use client';

import { RankedModel } from '@/lib/types';

interface ModelCardProps {
  model: RankedModel;
  showSubscription?: boolean;
}

// Rank badges with special styling for top 3
function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, { bg: string; text: string; glow: string }> = {
    1: { bg: 'bg-gradient-to-br from-yellow-400 to-amber-600', text: 'text-black', glow: 'shadow-yellow-500/50' },
    2: { bg: 'bg-gradient-to-br from-gray-300 to-gray-500', text: 'text-black', glow: 'shadow-gray-400/50' },
    3: { bg: 'bg-gradient-to-br from-amber-600 to-amber-800', text: 'text-white', glow: 'shadow-amber-600/50' },
  };
  
  const style = styles[rank] || { bg: 'bg-[var(--bg-elevated)]', text: 'text-[var(--text-secondary)]', glow: '' };
  
  return (
    <div className={`
      w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg
      ${style.bg} ${style.text} ${style.glow ? `shadow-lg ${style.glow}` : ''}
    `}>
      {rank}
    </div>
  );
}

// Organization badge colors
const ORG_COLORS: Record<string, string> = {
  'OpenAI': 'text-emerald-400 border-emerald-400/30',
  'Anthropic': 'text-orange-400 border-orange-400/30',
  'Google': 'text-blue-400 border-blue-400/30',
  'DeepSeek': 'text-cyan-400 border-cyan-400/30',
  'Meta': 'text-blue-500 border-blue-500/30',
  'Alibaba': 'text-orange-500 border-orange-500/30',
  'Mistral': 'text-purple-400 border-purple-400/30',
};

export default function ModelCard({ model, showSubscription = false }: ModelCardProps) {
  const orgColor = ORG_COLORS[model.organization] || 'text-[var(--text-muted)] border-white/10';
  const hasPricing = model.pricing.source !== 'unknown';
  const totalPrice = model.pricing.inputPricePerMillion + model.pricing.outputPricePerMillion;
  const subscription = model.subscription;
  
  // Find the cheapest paid tier
  const paidTier = subscription?.tiers.find(t => t.price > 0);
  const freeTier = subscription?.tiers.find(t => t.price === 0);
  
  return (
    <div className="glass-card p-5 hover-lift transition-all duration-300 group">
      <div className="flex items-start gap-4">
        {/* Rank */}
        <RankBadge rank={model.rank} />
        
        {/* Model Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-cyan)] transition-colors">
              {model.displayName}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${orgColor}`}>
              {model.organization}
            </span>
          </div>
          
          {/* Score */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--accent-cyan)] font-mono">
              {model.score}
            </span>
            <span className="text-sm text-[var(--text-muted)]">arena score</span>
          </div>
        </div>
        
        {/* Pricing Section */}
        <div className="text-right">
          {showSubscription && subscription ? (
            // Subscription View
            <>
              {freeTier && (
                <div className="text-sm">
                  <span className="text-[var(--accent-green)] font-semibold">Free</span>
                  <span className="text-[var(--text-muted)]"> tier available</span>
                </div>
              )}
              {paidTier && (
                <div className="mt-1">
                  <span className="text-xl font-bold text-[var(--accent-purple)]">
                    ${paidTier.price}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">/month</span>
                </div>
              )}
              {paidTier && (
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  {paidTier.name} plan
                </div>
              )}
              <a
                href={subscription.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-xs text-[var(--accent-cyan)] hover:underline"
              >
                Try it →
              </a>
            </>
          ) : (
            // API Pricing View
            <>
              {hasPricing ? (
                <>
                  <div className="text-sm text-[var(--text-muted)]">
                    <span className="text-[var(--accent-cyan)]">${model.pricing.inputPricePerMillion}</span>
                    <span className="mx-1">/</span>
                    <span className="text-[var(--accent-purple)]">${model.pricing.outputPricePerMillion}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    per 1M tokens
                  </div>
                  <div className="mt-2 text-lg font-semibold text-[var(--accent-green)]">
                    ${totalPrice.toFixed(2)}
                    <span className="text-xs text-[var(--text-muted)] ml-1">total</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] capitalize mt-0.5">
                    {model.pricing.source === 'official' ? '✓ Official' : '~ Estimated'}
                  </div>
                </>
              ) : (
                <div className="text-sm text-[var(--text-muted)]">
                  Price N/A
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Bottom section with license and subscription hint */}
      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
        {model.license && model.license !== 'Unknown' && (
          <span className="text-xs text-[var(--text-muted)]">
            License: <span className="text-[var(--text-secondary)]">{model.license}</span>
          </span>
        )}
        
        {/* Show subscription availability hint in API view */}
        {!showSubscription && subscription && freeTier && (
          <span className="text-xs text-[var(--accent-green)]">
            ✓ Free web access available
          </span>
        )}
        
        {/* Show API pricing hint in subscription view */}
        {showSubscription && hasPricing && (
          <span className="text-xs text-[var(--text-muted)]">
            API: ${totalPrice.toFixed(2)}/1M tokens
          </span>
        )}
      </div>
    </div>
  );
}

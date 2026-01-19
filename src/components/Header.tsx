'use client';

import { useState, useEffect } from 'react';

interface HeaderProps {
  lastUpdated?: string;
}

export default function Header({ lastUpdated }: HeaderProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  
  useEffect(() => {
    if (!lastUpdated) return;
    
    const updateTimeAgo = () => {
      const date = new Date(lastUpdated);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 24) {
        const days = Math.floor(diffHours / 24);
        setTimeAgo(`${days}d ago`);
      } else if (diffHours > 0) {
        setTimeAgo(`${diffHours}h ago`);
      } else {
        setTimeAgo(`${diffMins}m ago`);
      }
    };
    
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [lastUpdated]);
  
  return (
    <header className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Animated logo */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] p-[2px]">
                <div className="w-full h-full rounded-xl bg-[var(--bg-primary)] flex items-center justify-center">
                  <span className="text-2xl font-bold text-gradient font-[var(--font-display)]">
                    AI
                  </span>
                </div>
              </div>
              {/* Pulse effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] animate-ping opacity-20" />
            </div>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                <span className="text-gradient">CODER</span>
                <span className="text-[var(--text-primary)]">RANK</span>
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Top 10 Coding Models × Price Analysis
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                <span className="text-sm text-[var(--text-secondary)]">
                  Updated {timeAgo}
                </span>
              </div>
            )}
            
            <a
              href="https://lmarena.ai/leaderboard"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full glass-card text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors hover-lift"
            >
              Source: LMArena ↗
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

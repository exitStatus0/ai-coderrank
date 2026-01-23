import type { Metadata } from 'next';
import { Orbitron, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI CoderRank | Top Coding Models by Price',
  description: 'Compare the top 10 AI coding models from LMArena leaderboard with their pricing. Find the best value for your AI coding assistant.',
  keywords: ['AI', 'coding', 'models', 'GPT-4', 'Claude', 'DeepSeek', 'pricing', 'comparison'],
  authors: [{ name: 'AI CoderRank' }],
  openGraph: {
    title: 'AI CoderRank | Top Coding Models by Price',
    description: 'Compare the top 10 AI coding models with their pricing',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get theme from environment variable
  const theme = process.env.THEME || 'dark';
  
  return (
    <html 
      lang="en" 
      className={`${orbitron.variable} ${jetbrainsMono.variable}`}
      data-theme={theme}
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

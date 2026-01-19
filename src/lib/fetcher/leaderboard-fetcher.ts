import * as cheerio from 'cheerio';
import { LeaderboardModel } from '../types';

/**
 * Leaderboard Fetcher
 * 
 * Fetches and parses the LMArena leaderboard for coding models.
 * 
 * The LMArena page has a main table (Table 9) with columns:
 * Model | Overall | Expert | Hard Prompts | Coding | Math | Creative Writing | ...
 * 
 * We extract the "Coding" column rank and sort by it.
 */

const LEADERBOARD_URL = 'https://lmarena.ai/leaderboard';
const FETCH_TIMEOUT = 30000;

// Known provider prefixes and their clean names
const PROVIDER_PATTERNS: Array<{ pattern: RegExp; provider: string; remove: boolean }> = [
  { pattern: /^anthropic[-_]?/i, provider: 'Anthropic', remove: true },
  { pattern: /^openai[-_]?/i, provider: 'OpenAI', remove: true },
  { pattern: /^google[-_]?/i, provider: 'Google', remove: true },
  { pattern: /^deepseek[-_]?/i, provider: 'DeepSeek', remove: false },
  { pattern: /^meta[-_]?/i, provider: 'Meta', remove: true },
  { pattern: /^mistral[-_]?/i, provider: 'Mistral', remove: false },
  { pattern: /^alibaba[-_]?|^qwen/i, provider: 'Alibaba', remove: false },
  { pattern: /^xai[-_]?|^grok/i, provider: 'xAI', remove: false },
  { pattern: /^cohere[-_]?/i, provider: 'Cohere', remove: true },
  { pattern: /^baidu[-_]?|^ernie/i, provider: 'Baidu', remove: false },
  { pattern: /^zhipu[-_]?|^glm/i, provider: 'Zhipu', remove: false },
  { pattern: /^minimax[-_]?/i, provider: 'MiniMax', remove: true },
  { pattern: /^01[-_]?ai[-_]?|^yi[-_]?/i, provider: '01.AI', remove: false },
  { pattern: /^bytedance[-_]?|^doubao/i, provider: 'ByteDance', remove: false },
];

// Model name cleanups for display
const MODEL_CLEANUPS: Array<{ pattern: RegExp; replacement: string }> = [
  // Claude models
  { pattern: /claude[-_]?opus[-_]?4[-_.]?5/i, replacement: 'Claude Opus 4.5' },
  { pattern: /claude[-_]?sonnet[-_]?4[-_.]?5/i, replacement: 'Claude Sonnet 4.5' },
  { pattern: /claude[-_]?opus[-_]?4[-_.]?1/i, replacement: 'Claude Opus 4.1' },
  { pattern: /claude[-_]?sonnet[-_]?4[-_.]?1/i, replacement: 'Claude Sonnet 4.1' },
  { pattern: /claude[-_]?3[-_.]?5[-_]?sonnet/i, replacement: 'Claude 3.5 Sonnet' },
  { pattern: /claude[-_]?3[-_]?opus/i, replacement: 'Claude 3 Opus' },
  // GPT models
  { pattern: /gpt[-_]?5[-_.]?2[-_]?high/i, replacement: 'GPT-5.2 High' },
  { pattern: /gpt[-_]?5[-_.]?2\b/i, replacement: 'GPT-5.2' },
  { pattern: /gpt[-_]?5[-_.]?1[-_]?high/i, replacement: 'GPT-5.1 High' },
  { pattern: /gpt[-_]?5[-_]?medium/i, replacement: 'GPT-5 Medium' },
  { pattern: /gpt[-_]?5/i, replacement: 'GPT-5' },
  { pattern: /gpt[-_]?4[-_]?o[-_]?mini/i, replacement: 'GPT-4o Mini' },
  { pattern: /gpt[-_]?4[-_]?o/i, replacement: 'GPT-4o' },
  { pattern: /o1[-_]?mini/i, replacement: 'o1-mini' },
  { pattern: /\bo1\b/i, replacement: 'o1' },
  // Gemini models  
  { pattern: /gemini[-_]?3[-_]?pro/i, replacement: 'Gemini 3 Pro' },
  { pattern: /gemini[-_]?3[-_]?flash/i, replacement: 'Gemini 3 Flash' },
  { pattern: /gemini[-_]?2[-_.]?0[-_]?flash/i, replacement: 'Gemini 2.0 Flash' },
  { pattern: /gemini[-_]?1[-_.]?5[-_]?pro/i, replacement: 'Gemini 1.5 Pro' },
  // Grok models
  { pattern: /grok[-_]?4[-_.]?1[-_]?thinking/i, replacement: 'Grok 4.1 Thinking' },
  { pattern: /grok[-_]?4[-_.]?1/i, replacement: 'Grok 4.1' },
  { pattern: /grok[-_]?4/i, replacement: 'Grok 4' },
  // DeepSeek
  { pattern: /deepseek[-_]?r1/i, replacement: 'DeepSeek-R1' },
  { pattern: /deepseek[-_]?v3/i, replacement: 'DeepSeek-V3' },
  // Chinese models
  { pattern: /ernie[-_]?5[-_.]?0/i, replacement: 'ERNIE 5.0' },
  { pattern: /glm[-_]?4[-_.]?7/i, replacement: 'GLM-4.7' },
  { pattern: /glm[-_]?4/i, replacement: 'GLM-4' },
  { pattern: /minimax[-_]?m2/i, replacement: 'MiniMax M2' },
  { pattern: /qwen[-_]?2[-_.]?5/i, replacement: 'Qwen 2.5' },
  // Llama
  { pattern: /llama[-_]?3[-_.]?3/i, replacement: 'Llama 3.3' },
];

async function fetchLeaderboardHtml(): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  
  try {
    const response = await fetch(LEADERBOARD_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AI-CoderRank/1.0 (Educational Project)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Cleans and normalizes model name, extracts organization
 */
function cleanModelName(rawName: string): { name: string; organization: string } {
  let name = rawName.trim();
  let organization = 'Unknown';
  
  // Check for special variants
  const isThinking = /thinking/i.test(name) && !/minimal/i.test(name);
  const isThinkingMinimal = /thinking[-_]?minimal/i.test(name);
  
  // Remove date stamps and suffixes
  name = name
    .replace(/[-_]?\d{8,}[-_]?/g, '')
    .replace(/[-_]?thinking[-_]?minimal/gi, '')
    .replace(/[-_]?thinking[-_]?\d*k?/gi, '')
    .replace(/[-_]?\d+k$/gi, '')
    .replace(/[-_]?preview$/gi, '')
    .replace(/[-_]?latest$/gi, '')
    .replace(/[-_]?pre$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract provider
  for (const { pattern, provider, remove } of PROVIDER_PATTERNS) {
    if (pattern.test(name)) {
      organization = provider;
      if (remove) {
        name = name.replace(pattern, '').trim();
      }
      break;
    }
  }
  
  // Apply model name cleanups
  for (const { pattern, replacement } of MODEL_CLEANUPS) {
    if (pattern.test(name)) {
      name = replacement;
      break;
    }
  }
  
  // Capitalize if needed
  if (name === name.toLowerCase()) {
    name = name.replace(/\b\w/g, c => c.toUpperCase());
  }
  
  // Infer organization from name
  if (organization === 'Unknown') {
    if (/claude/i.test(name)) organization = 'Anthropic';
    else if (/gpt|o1|o3/i.test(name)) organization = 'OpenAI';
    else if (/gemini/i.test(name)) organization = 'Google';
    else if (/deepseek/i.test(name)) organization = 'DeepSeek';
    else if (/grok/i.test(name)) organization = 'xAI';
    else if (/llama/i.test(name)) organization = 'Meta';
    else if (/qwen/i.test(name)) organization = 'Alibaba';
    else if (/mistral|mixtral/i.test(name)) organization = 'Mistral';
    else if (/ernie/i.test(name)) organization = 'Baidu';
    else if (/glm/i.test(name)) organization = 'Zhipu';
    else if (/minimax/i.test(name)) organization = 'MiniMax';
  }
  
  // Add back thinking variants
  if (isThinkingMinimal) {
    name = name + ' (Thinking Minimal)';
  } else if (isThinking) {
    name = name + ' (Thinking)';
  }
  
  return { name, organization };
}

/**
 * Parse the main leaderboard table and extract Coding rankings
 * 
 * Table structure:
 * Model | Overall | Expert | Hard Prompts | Coding | Math | Creative Writing | ...
 * Index:   0         1        2              3        4      5        6
 */
function parseLeaderboardHtml(html: string): LeaderboardModel[] {
  const $ = cheerio.load(html);
  const models: LeaderboardModel[] = [];
  const seen = new Set<string>();
  
  // Find the main table with "Coding" column header
  const tables = $('table').toArray();
  let mainTable = null;
  let codingColumnIndex = -1;
  
  for (const table of tables) {
    const headers = $(table).find('th').toArray();
    for (let i = 0; i < headers.length; i++) {
      const headerText = $(headers[i]).text().trim().toLowerCase();
      if (headerText === 'coding') {
        mainTable = table;
        codingColumnIndex = i;
        break;
      }
    }
    if (mainTable) break;
  }
  
  if (!mainTable || codingColumnIndex === -1) {
    console.warn('Could not find Coding column in leaderboard');
    return [];
  }
  
  // Parse rows from the main table
  $(mainTable).find('tbody tr').each((_, row) => {
    const cells = $(row).find('td').toArray();
    if (cells.length > codingColumnIndex) {
      const modelCell = $(cells[0]).text().trim();
      const codingRankText = $(cells[codingColumnIndex]).text().trim();
      const codingRank = parseInt(codingRankText);
      
      if (modelCell && codingRank > 0) {
        const { name, organization } = cleanModelName(modelCell);
        
        // Deduplicate
        const key = `${name.toLowerCase()}-${organization.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          models.push({
            rank: codingRank,  // This is the Coding rank from the table
            name,
            score: codingRank, // Using rank as score (lower is better, we'll invert later)
            organization,
            license: organization === 'DeepSeek' ? 'MIT' : 'Proprietary',
            votes: 0,
          });
        }
      }
    }
  });
  
  return models;
}

/**
 * Main entry point: Fetches top N coding models from leaderboard
 */
export async function fetchTopCodingModels(count: number = 10): Promise<LeaderboardModel[]> {
  try {
    const html = await fetchLeaderboardHtml();
    const allModels = parseLeaderboardHtml(html);
    
    // Sort by Coding rank (ascending - rank 1 is best)
    const sorted = allModels
      .sort((a, b) => a.rank - b.rank)
      .slice(0, count);
    
    // Renumber ranks 1-N and convert rank to a display score
    // Higher score = better (for display purposes)
    const maxRank = Math.max(...sorted.map(m => m.rank));
    return sorted.map((model, index) => ({
      ...model,
      rank: index + 1,
      score: Math.round(1500 - (model.score - 1) * 10), // Convert rank to ELO-like score
    }));
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    throw new Error('Unable to fetch leaderboard data. Please try again later.');
  }
}

/**
 * Fallback mock data
 */
export function getMockLeaderboardData(): LeaderboardModel[] {
  return [
    { rank: 1, name: 'Claude Opus 4.5', score: 1500, organization: 'Anthropic', license: 'Proprietary', votes: 0 },
    { rank: 2, name: 'Claude Sonnet 4.5', score: 1490, organization: 'Anthropic', license: 'Proprietary', votes: 0 },
    { rank: 3, name: 'Claude Opus 4.5 (Thinking)', score: 1480, organization: 'Anthropic', license: 'Proprietary', votes: 0 },
    { rank: 4, name: 'Gemini 3 Pro', score: 1470, organization: 'Google', license: 'Proprietary', votes: 0 },
    { rank: 5, name: 'Claude Opus 4.1', score: 1460, organization: 'Anthropic', license: 'Proprietary', votes: 0 },
    { rank: 6, name: 'Grok 4.1 Thinking', score: 1450, organization: 'xAI', license: 'Proprietary', votes: 0 },
    { rank: 7, name: 'Claude Sonnet 4.5 (Thinking)', score: 1440, organization: 'Anthropic', license: 'Proprietary', votes: 0 },
    { rank: 8, name: 'Claude Opus 4.1 (Thinking)', score: 1430, organization: 'Anthropic', license: 'Proprietary', votes: 0 },
    { rank: 9, name: 'Gemini 3 Flash', score: 1420, organization: 'Google', license: 'Proprietary', votes: 0 },
    { rank: 10, name: 'GPT-5.2 High', score: 1410, organization: 'OpenAI', license: 'Proprietary', votes: 0 },
  ];
}

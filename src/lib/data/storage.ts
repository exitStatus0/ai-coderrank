import { promises as fs } from 'fs';
import path from 'path';
import { StoredData, RankedModel } from '../types';

/**
 * Data Storage Service
 * 
 * Trade-off: JSON file vs Database
 * - Pros: Simple, portable, no dependencies, easy debugging
 * - Cons: No concurrent write safety, limited query capability
 * 
 * For this use case (daily updates, read-heavy, small dataset),
 * JSON file is the pragmatic choice. Easy to migrate to DB later.
 */

const DATA_VERSION = '1.0.0';
const DEFAULT_DATA_PATH = process.env.DATA_PATH || './data/models.json';

/**
 * Ensures the data directory exists
 */
async function ensureDataDir(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Saves model data to storage
 * 
 * @param models Array of ranked models to save
 * @param filePath Optional custom file path
 */
export async function saveModelData(
  models: RankedModel[],
  filePath: string = DEFAULT_DATA_PATH
): Promise<void> {
  await ensureDataDir(filePath);
  
  const data: StoredData = {
    models,
    fetchedAt: new Date().toISOString(),
    source: 'https://lmarena.ai/leaderboard',
    version: DATA_VERSION,
  };
  
  // Write atomically using rename pattern
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempPath, filePath);
}

/**
 * Loads model data from storage
 * 
 * @param filePath Optional custom file path
 * @returns StoredData or null if not found
 */
export async function loadModelData(
  filePath: string = DEFAULT_DATA_PATH
): Promise<StoredData | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as StoredData;
    
    // Basic validation
    if (!data.models || !Array.isArray(data.models)) {
      console.warn('Invalid data format in storage');
      return null;
    }
    
    return data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist - normal for first run
      return null;
    }
    console.error('Error loading model data:', error);
    return null;
  }
}

/**
 * Checks if data needs refresh based on age
 * 
 * @param maxAgeHours Maximum age in hours before refresh needed
 * @returns true if refresh is needed
 */
export async function isDataStale(
  maxAgeHours: number = 24,
  filePath: string = DEFAULT_DATA_PATH
): Promise<boolean> {
  const data = await loadModelData(filePath);
  
  if (!data) {
    return true; // No data = stale
  }
  
  const fetchedAt = new Date(data.fetchedAt);
  const now = new Date();
  const ageMs = now.getTime() - fetchedAt.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  
  return ageHours >= maxAgeHours;
}

/**
 * Gets data age in human-readable format
 */
export function getDataAge(fetchedAt: string): string {
  const date = new Date(fetchedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
}

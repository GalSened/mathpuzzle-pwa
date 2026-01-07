/**
 * AI Response Cache
 *
 * Caches AI responses to reduce API calls and costs.
 * Uses simple in-memory cache with TTL.
 */

import { AI_CONFIG } from '../config';
import type { AIResponse, CacheEntry, NarrativeType } from '../types';
import type { WorldId } from '@/engine/types';

/**
 * In-memory cache for AI responses.
 */
const cache = new Map<string, CacheEntry>();

/**
 * Generate cache key from narrative parameters.
 */
function generateCacheKey(
  type: NarrativeType,
  worldId: WorldId,
  extras?: Record<string, string>
): string {
  const parts: string[] = [type, worldId];
  if (extras) {
    for (const [key, value] of Object.entries(extras).sort()) {
      parts.push(`${key}:${value}`);
    }
  }
  return parts.join('|');
}

/**
 * Get cached response if available and not expired.
 */
export function getCachedResponse(
  type: NarrativeType,
  worldId: WorldId,
  extras?: Record<string, string>
): AIResponse | null {
  const key = generateCacheKey(type, worldId, extras);
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return {
    ...entry.response,
    cached: true,
  };
}

/**
 * Store response in cache.
 */
export function setCachedResponse(
  type: NarrativeType,
  worldId: WorldId,
  response: AIResponse,
  extras?: Record<string, string>
): void {
  const key = generateCacheKey(type, worldId, extras);
  const entry: CacheEntry = {
    response,
    expiresAt: Date.now() + AI_CONFIG.cacheTtlMs,
  };
  cache.set(key, entry);
}

/**
 * Clear all cached responses.
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Clear expired entries from cache.
 */
export function cleanupCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }
}

/**
 * Get cache statistics.
 */
export function getCacheStats(): { size: number; expired: number } {
  const now = Date.now();
  let expired = 0;
  for (const entry of cache.values()) {
    if (now > entry.expiresAt) {
      expired++;
    }
  }
  return {
    size: cache.size,
    expired,
  };
}

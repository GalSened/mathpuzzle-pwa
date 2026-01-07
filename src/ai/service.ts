/**
 * AI Service - Main Entry Point
 *
 * Orchestrates AI narrative generation with:
 * - Rate limiting
 * - Caching
 * - Fallback to templates
 * - Error handling
 *
 * NOTE: This service runs SERVER-SIDE only.
 * Client components use the /api/ai/narrative route.
 */

import { AI_CONFIG, isAIEnabled, isFallbackOnly } from './config';
import { callGroqAPI, extractResponseText, getTokenUsage, GroqAPIError } from './client';
import { getCachedResponse, setCachedResponse } from './fallback/cache';
import { getFallbackNarrative } from './fallback/templates';
import { getPromptBuilder } from './prompts';
import type { AIContext, AIResponse, NarrativeType, RateLimitState } from './types';

/**
 * Rate limiter state (in-memory for simplicity).
 */
const rateLimiter: RateLimitState = {
  requests: [],
  maxRequests: AI_CONFIG.maxRequestsPerMinute,
  windowMs: AI_CONFIG.rateLimitWindowMs,
};

/**
 * Check if we're within rate limits.
 */
function checkRateLimit(): boolean {
  const now = Date.now();
  // Clean old requests
  rateLimiter.requests = rateLimiter.requests.filter(
    (time) => now - time < rateLimiter.windowMs
  );
  return rateLimiter.requests.length < rateLimiter.maxRequests;
}

/**
 * Record a request for rate limiting.
 */
function recordRequest(): void {
  rateLimiter.requests.push(Date.now());
}

/**
 * Generate narrative using AI or fallback.
 *
 * This is the main entry point for AI narrative generation.
 * It handles caching, rate limiting, and fallback automatically.
 */
export async function generateNarrative(
  type: NarrativeType,
  context: AIContext
): Promise<AIResponse> {
  const worldId = context.currentWorld;

  // Check cache first
  const cached = getCachedResponse(type, worldId, {
    storyBeat: context.storyBeat || '',
    bossName: context.bossName || '',
  });
  if (cached) {
    return cached;
  }

  // If AI is disabled or fallback only, use templates
  if (!isAIEnabled() || isFallbackOnly()) {
    return createFallbackResponse(type, context);
  }

  // Check rate limit
  if (!checkRateLimit()) {
    console.warn('AI: Rate limit exceeded, using fallback');
    return createFallbackResponse(type, context);
  }

  // Try AI generation
  try {
    recordRequest();

    const promptBuilder = getPromptBuilder(type);
    const messages = promptBuilder(context);

    const groqResponse = await callGroqAPI(messages);
    const text = extractResponseText(groqResponse);
    const tokens = getTokenUsage(groqResponse);

    const response: AIResponse = {
      text,
      cached: false,
      fallback: false,
      model: AI_CONFIG.model,
      tokens,
      generatedAt: Date.now(),
    };

    // Cache successful response
    setCachedResponse(type, worldId, response, {
      storyBeat: context.storyBeat || '',
      bossName: context.bossName || '',
    });

    return response;
  } catch (error) {
    console.error('AI: Generation failed, using fallback', error);

    // Check if error is retryable
    if (error instanceof GroqAPIError && error.retryable) {
      // Could implement retry logic here
    }

    return createFallbackResponse(type, context);
  }
}

/**
 * Create fallback response from templates.
 */
function createFallbackResponse(
  type: NarrativeType,
  context: AIContext
): AIResponse {
  const text = getFallbackNarrative(type, context.currentWorld, context.recentOutcome);

  return {
    text,
    cached: false,
    fallback: true,
    model: 'fallback',
    tokens: 0,
    generatedAt: Date.now(),
  };
}

/**
 * Get boss intro narrative.
 */
export async function getBossIntro(context: AIContext): Promise<AIResponse> {
  return generateNarrative('boss_intro', { ...context, storyBeat: 'intro' });
}

/**
 * Get boss defeat narrative (player wins).
 */
export async function getBossDefeat(context: AIContext): Promise<AIResponse> {
  return generateNarrative('boss_defeat', { ...context, storyBeat: 'victory' });
}

/**
 * Get player victory narrative (world completion).
 */
export async function getVictory(context: AIContext): Promise<AIResponse> {
  return generateNarrative('player_victory', { ...context, storyBeat: 'victory' });
}

/**
 * Get encouragement narrative (struggling player).
 */
export async function getEncouragement(context: AIContext): Promise<AIResponse> {
  return generateNarrative('encouragement', { ...context, storyBeat: 'battle' });
}

/**
 * Get world transition narrative.
 */
export async function getWorldTransition(context: AIContext): Promise<AIResponse> {
  return generateNarrative('world_transition', { ...context, storyBeat: 'intro' });
}

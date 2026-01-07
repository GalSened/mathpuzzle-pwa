/**
 * AI Configuration for Groq API
 *
 * Model: Llama 3.1 8B Instant
 * - Speed: 840 TPS (fastest)
 * - Cost: $0.05/$0.08 per million tokens
 * - Context: 128K tokens
 */

export const AI_CONFIG = {
  // Groq API settings
  apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
  model: 'llama-3.1-8b-instant',

  // Generation parameters
  temperature: 0.7, // Creative but not too random
  maxTokens: 100, // Short narratives only
  topP: 0.9,

  // Rate limiting
  maxRequestsPerMinute: 10,
  rateLimitWindowMs: 60000,

  // Cache settings
  cacheTtlMs: 5 * 60 * 1000, // 5 minutes

  // Timeouts
  requestTimeoutMs: 5000,

  // Feature flags
  enabled: process.env.NEXT_PUBLIC_AI_ENABLED === 'true',
  fallbackOnly: process.env.NEXT_PUBLIC_AI_FALLBACK_ONLY === 'true',
} as const;

/**
 * Get Groq API key from environment.
 * Server-side only - never expose to client.
 */
export function getGroqApiKey(): string | undefined {
  if (typeof window !== 'undefined') {
    console.warn('AI: Attempting to access API key on client side');
    return undefined;
  }
  return process.env.GROQ_API_KEY;
}

/**
 * Check if AI is available.
 */
export function isAIEnabled(): boolean {
  return AI_CONFIG.enabled && !AI_CONFIG.fallbackOnly;
}

/**
 * Check if we should use fallback only.
 */
export function isFallbackOnly(): boolean {
  return AI_CONFIG.fallbackOnly || !AI_CONFIG.enabled;
}

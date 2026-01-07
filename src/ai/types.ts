/**
 * AI Layer Type Definitions
 *
 * CORE PRINCIPLE: AI NEVER affects puzzle logic, solutions, or outcomes.
 * AI only provides experiential layer (narratives, dialogues).
 */

import type { WorldId } from '@/engine/types';

/**
 * Player style based on behavior patterns.
 * Used to personalize narrative tone.
 */
export type PlayerStyle = 'cautious' | 'fast' | 'methodical';

/**
 * Recent outcome for contextual responses.
 */
export type RecentOutcome = 'success' | 'struggle' | 'fail';

/**
 * Story beat for narrative context.
 */
export type StoryBeat = 'intro' | 'battle' | 'victory' | 'defeat';

/**
 * Types of narratives the AI can generate.
 */
export type NarrativeType =
  | 'boss_intro'
  | 'boss_defeat'
  | 'player_victory'
  | 'encouragement'
  | 'world_transition';

/**
 * AI Context - SAFE data that can be shared with AI.
 *
 * EXPLICITLY EXCLUDED (NEVER include):
 * - puzzleNumbers
 * - solution
 * - targetNumber
 * - difficulty parameters
 */
export interface AIContext {
  // Player state (safe to share)
  playerStyle: PlayerStyle;
  recentOutcome: RecentOutcome;
  playerName?: string;

  // Game state (safe to share)
  currentWorld: WorldId;
  currentLevel: number;
  worldNameHe: string;

  // Story context (safe to share)
  bossName?: string;
  bossNameHe?: string;
  storyBeat?: StoryBeat;
}

/**
 * Response from AI service.
 */
export interface AIResponse {
  text: string;
  cached: boolean;
  fallback: boolean;
  model: string;
  tokens: number;
  generatedAt: number;
}

/**
 * Groq API chat message format.
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Groq API completion request.
 */
export interface GroqCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

/**
 * Groq API completion response.
 */
export interface GroqCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Cache entry for AI responses.
 */
export interface CacheEntry {
  response: AIResponse;
  expiresAt: number;
}

/**
 * Rate limiter state.
 */
export interface RateLimitState {
  requests: number[];
  maxRequests: number;
  windowMs: number;
}

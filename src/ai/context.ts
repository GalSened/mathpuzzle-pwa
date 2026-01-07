/**
 * AI Context Builder
 *
 * Builds SAFE context for AI from game state.
 *
 * CORE RULE: NEVER include puzzle data in AI context.
 * - NO puzzle numbers
 * - NO solutions
 * - NO target numbers
 * - NO difficulty parameters
 */

import type { WorldId, WorldConfig } from '@/engine/types';
import type { AIContext, PlayerStyle, RecentOutcome, StoryBeat } from './types';

/**
 * Build safe AI context from game state.
 *
 * This function is the ONLY way to create AI context.
 * It ensures no puzzle data is ever passed to AI.
 */
export function buildAIContext(params: {
  // Player info (safe)
  playerName?: string;
  playerStyle?: PlayerStyle;
  recentOutcome?: RecentOutcome;

  // World/Level info (safe)
  world: WorldConfig;
  currentLevel: number;

  // Story beat (safe)
  storyBeat?: StoryBeat;
}): AIContext {
  const { world, currentLevel, playerName, playerStyle, recentOutcome, storyBeat } = params;

  return {
    // Player state - all safe
    playerStyle: playerStyle || 'methodical',
    recentOutcome: recentOutcome || 'success',
    playerName,

    // Game state - only world/level info, NO puzzle data
    currentWorld: world.id,
    currentLevel,
    worldNameHe: world.nameHe,

    // Story context - safe metadata
    bossName: world.bossName,
    bossNameHe: world.bossNameHe,
    storyBeat,
  };
}

/**
 * Build AI context specifically for boss encounters.
 */
export function buildBossContext(params: {
  world: WorldConfig;
  currentLevel: number;
  playerName?: string;
  playerStyle?: PlayerStyle;
  storyBeat: 'intro' | 'victory' | 'defeat';
}): AIContext {
  return buildAIContext({
    ...params,
    recentOutcome: params.storyBeat === 'defeat' ? 'fail' : 'success',
  });
}

/**
 * Build AI context for encouragement messages.
 */
export function buildEncouragementContext(params: {
  world: WorldConfig;
  currentLevel: number;
  playerName?: string;
  outcome: RecentOutcome;
}): AIContext {
  return buildAIContext({
    world: params.world,
    currentLevel: params.currentLevel,
    playerName: params.playerName,
    playerStyle: 'methodical',
    recentOutcome: params.outcome,
    storyBeat: 'battle',
  });
}

/**
 * Build AI context for world transitions.
 */
export function buildWorldTransitionContext(params: {
  world: WorldConfig;
  playerName?: string;
}): AIContext {
  return buildAIContext({
    world: params.world,
    currentLevel: 1,
    playerName: params.playerName,
    playerStyle: 'methodical',
    recentOutcome: 'success',
    storyBeat: 'intro',
  });
}

/**
 * Infer player style from behavior.
 * This is a soft personalization metric.
 */
export function inferPlayerStyle(metrics: {
  averageTimePerPuzzle: number;
  hintUsageRate: number;
  attemptRate: number;
}): PlayerStyle {
  const { averageTimePerPuzzle, hintUsageRate, attemptRate } = metrics;

  // Fast player: low time, low hints, few attempts
  if (averageTimePerPuzzle < 15 && attemptRate < 2) {
    return 'fast';
  }

  // Cautious player: uses hints, takes time
  if (hintUsageRate > 0.3 || averageTimePerPuzzle > 45) {
    return 'cautious';
  }

  // Default: methodical
  return 'methodical';
}

/**
 * Determine recent outcome from puzzle results.
 */
export function determineOutcome(metrics: {
  recentAttempts: number;
  wasCorrect: boolean;
  hintsUsed: number;
}): RecentOutcome {
  const { recentAttempts, wasCorrect, hintsUsed } = metrics;

  if (wasCorrect && recentAttempts <= 2 && hintsUsed === 0) {
    return 'success';
  }

  if (!wasCorrect) {
    return 'fail';
  }

  // Correct but with struggle
  return 'struggle';
}

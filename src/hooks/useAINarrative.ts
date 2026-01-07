/**
 * useAINarrative Hook
 *
 * React hook for fetching AI-generated narratives.
 * Calls the server-side API route to keep API keys secure.
 *
 * Usage:
 *   const { narrative, loading, error, refetch } = useAINarrative('boss_intro', context);
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AIContext, AIResponse, NarrativeType } from '@/ai/types';
import { getFallbackNarrative } from '@/ai/fallback/templates';

/**
 * Hook state.
 */
interface UseAINarrativeState {
  /** The narrative text */
  narrative: string | null;
  /** Full AI response object */
  response: AIResponse | null;
  /** Whether request is in flight */
  loading: boolean;
  /** Error message if request failed */
  error: string | null;
  /** Whether using fallback template */
  isFallback: boolean;
}

/**
 * Hook return type.
 */
interface UseAINarrativeReturn extends UseAINarrativeState {
  /** Manually refetch the narrative */
  refetch: () => Promise<void>;
}

/**
 * Fetch narrative from API.
 */
async function fetchNarrative(
  type: NarrativeType,
  context: AIContext
): Promise<AIResponse> {
  const response = await fetch('/api/ai/narrative', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, context }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Hook for AI narrative generation.
 *
 * @param type - The type of narrative to generate
 * @param context - The AI context (player state, world info)
 * @param options - Additional options
 * @returns Narrative state and controls
 */
export function useAINarrative(
  type: NarrativeType,
  context: AIContext | null,
  options: {
    /** Skip fetching until enabled */
    enabled?: boolean;
    /** Use fallback immediately without API call */
    fallbackOnly?: boolean;
  } = {}
): UseAINarrativeReturn {
  const { enabled = true, fallbackOnly = false } = options;

  const [state, setState] = useState<UseAINarrativeState>({
    narrative: null,
    response: null,
    loading: false,
    error: null,
    isFallback: false,
  });

  /**
   * Get fallback narrative.
   */
  const useFallback = useCallback(() => {
    if (!context) return;

    const text = getFallbackNarrative(type, context.currentWorld, context.recentOutcome);
    setState({
      narrative: text,
      response: {
        text,
        cached: false,
        fallback: true,
        model: 'fallback',
        tokens: 0,
        generatedAt: Date.now(),
      },
      loading: false,
      error: null,
      isFallback: true,
    });
  }, [type, context]);

  /**
   * Fetch narrative from API.
   */
  const doFetch = useCallback(async () => {
    if (!context) return;

    // If fallback only mode, use template
    if (fallbackOnly) {
      useFallback();
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetchNarrative(type, context);

      setState({
        narrative: response.text,
        response,
        loading: false,
        error: null,
        isFallback: response.fallback,
      });
    } catch (error) {
      console.error('useAINarrative fetch error:', error);

      // Use fallback on error
      useFallback();
    }
  }, [type, context, fallbackOnly, useFallback]);

  /**
   * Manual refetch function.
   */
  const refetch = useCallback(async () => {
    await doFetch();
  }, [doFetch]);

  /**
   * Auto-fetch on mount and when dependencies change.
   */
  useEffect(() => {
    if (enabled && context) {
      doFetch();
    }
  }, [enabled, context, doFetch]);

  return {
    ...state,
    refetch,
  };
}

/**
 * Hook for boss introduction narrative.
 */
export function useBossIntro(
  context: AIContext | null,
  options?: { enabled?: boolean; fallbackOnly?: boolean }
): UseAINarrativeReturn {
  return useAINarrative('boss_intro', context, options);
}

/**
 * Hook for boss defeat narrative.
 */
export function useBossDefeat(
  context: AIContext | null,
  options?: { enabled?: boolean; fallbackOnly?: boolean }
): UseAINarrativeReturn {
  return useAINarrative('boss_defeat', context, options);
}

/**
 * Hook for player victory narrative.
 */
export function useVictory(
  context: AIContext | null,
  options?: { enabled?: boolean; fallbackOnly?: boolean }
): UseAINarrativeReturn {
  return useAINarrative('player_victory', context, options);
}

/**
 * Hook for encouragement narrative.
 */
export function useEncouragement(
  context: AIContext | null,
  options?: { enabled?: boolean; fallbackOnly?: boolean }
): UseAINarrativeReturn {
  return useAINarrative('encouragement', context, options);
}

/**
 * Hook for world transition narrative.
 */
export function useWorldTransition(
  context: AIContext | null,
  options?: { enabled?: boolean; fallbackOnly?: boolean }
): UseAINarrativeReturn {
  return useAINarrative('world_transition', context, options);
}

export default useAINarrative;

/**
 * AI Narrative API Route
 *
 * POST /api/ai/narrative
 *
 * Server-side endpoint for AI narrative generation.
 * This keeps the API key secure on the server.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateNarrative } from '@/ai/service';
import type { AIContext, NarrativeType } from '@/ai/types';

/**
 * Request body type.
 */
interface NarrativeRequest {
  type: NarrativeType;
  context: AIContext;
}

/**
 * Validate narrative type.
 */
function isValidNarrativeType(type: unknown): type is NarrativeType {
  return (
    typeof type === 'string' &&
    ['boss_intro', 'boss_defeat', 'player_victory', 'encouragement', 'world_transition'].includes(
      type
    )
  );
}

/**
 * Validate AI context (basic validation).
 */
function isValidContext(context: unknown): context is AIContext {
  if (!context || typeof context !== 'object') {
    return false;
  }

  const ctx = context as Record<string, unknown>;

  // Required fields
  if (typeof ctx.currentWorld !== 'string') return false;
  if (typeof ctx.currentLevel !== 'number') return false;
  if (typeof ctx.worldNameHe !== 'string') return false;

  // Safety check: NEVER allow puzzle data
  if ('puzzleNumbers' in ctx) return false;
  if ('solution' in ctx) return false;
  if ('targetNumber' in ctx) return false;
  if ('difficulty' in ctx) return false;

  return true;
}

/**
 * POST handler for AI narrative generation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;

    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { type, context } = body as NarrativeRequest;

    // Validate narrative type
    if (!isValidNarrativeType(type)) {
      return NextResponse.json({ error: 'Invalid narrative type' }, { status: 400 });
    }

    // Validate context
    if (!isValidContext(context)) {
      return NextResponse.json({ error: 'Invalid or unsafe context' }, { status: 400 });
    }

    // Generate narrative
    const response = await generateNarrative(type, context);

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI narrative error:', error);

    return NextResponse.json(
      { error: 'Failed to generate narrative' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * Groq API Client
 *
 * Server-side only - API key should never be exposed to client.
 * Client components should use the API route instead.
 */

import { AI_CONFIG, getGroqApiKey } from './config';
import type {
  ChatMessage,
  GroqCompletionRequest,
  GroqCompletionResponse,
} from './types';

/**
 * Error thrown when Groq API fails.
 */
export class GroqAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'GroqAPIError';
  }
}

/**
 * Call Groq API for chat completion.
 * Server-side only.
 */
export async function callGroqAPI(
  messages: ChatMessage[],
  options?: Partial<Pick<GroqCompletionRequest, 'temperature' | 'max_tokens'>>
): Promise<GroqCompletionResponse> {
  const apiKey = getGroqApiKey();

  if (!apiKey) {
    throw new GroqAPIError('Groq API key not configured', undefined, false);
  }

  const request: GroqCompletionRequest = {
    model: AI_CONFIG.model,
    messages,
    temperature: options?.temperature ?? AI_CONFIG.temperature,
    max_tokens: options?.max_tokens ?? AI_CONFIG.maxTokens,
    top_p: AI_CONFIG.topP,
  };

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    AI_CONFIG.requestTimeoutMs
  );

  try {
    const response = await fetch(AI_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const isRetryable = response.status >= 500 || response.status === 429;
      throw new GroqAPIError(
        `Groq API error: ${response.status} ${response.statusText}`,
        response.status,
        isRetryable
      );
    }

    const data: GroqCompletionResponse = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof GroqAPIError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new GroqAPIError('Groq API request timeout', undefined, true);
    }

    throw new GroqAPIError(
      `Groq API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      true
    );
  }
}

/**
 * Extract text from Groq API response.
 */
export function extractResponseText(response: GroqCompletionResponse): string {
  const choice = response.choices[0];
  if (!choice || !choice.message) {
    throw new GroqAPIError('No response from Groq API', undefined, false);
  }
  return choice.message.content.trim();
}

/**
 * Get token usage from response.
 */
export function getTokenUsage(response: GroqCompletionResponse): number {
  return response.usage?.total_tokens ?? 0;
}

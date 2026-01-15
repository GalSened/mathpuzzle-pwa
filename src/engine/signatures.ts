import { PuzzleArchetype, InsightType } from './types';

/**
 * Compute a unique signature for a puzzle based on its cognitive profile
 */
export function computeSignature(
  archetype: PuzzleArchetype,
  template: string,
  difficultyLevel: number,
  insight: InsightType
): string {
  const components = [
    archetype,
    normalizeTemplate(template),
    difficultyLevel,
    insight
  ];

  return hashComponents(components);
}

function normalizeTemplate(template: string): string {
  return template
    .replace(/[a-e]/g, 'x')
    .replace(/\s/g, '');
}

function hashComponents(components: (string | number)[]): string {
  const str = components.join('|');

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return `sig_${Math.abs(hash).toString(36)}`;
}

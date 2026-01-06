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

export class SignatureHistory {
  private signatures: string[] = [];
  private archetypes: PuzzleArchetype[] = [];
  private insights: InsightType[] = [];

  private maxSignatures = 20;
  private maxArchetypes = 5;
  private maxInsights = 3;

  isRepetitive(
    signature: string,
    archetype: PuzzleArchetype,
    insight: InsightType
  ): boolean {
    if (this.signatures.includes(signature)) {
      return true;
    }

    const last3Archetypes = this.archetypes.slice(-3);
    if (
      last3Archetypes.length === 3 &&
      last3Archetypes.every(a => a === archetype)
    ) {
      return true;
    }

    if (this.insights[this.insights.length - 1] === insight) {
      return true;
    }

    return false;
  }

  record(signature: string, archetype: PuzzleArchetype, insight: InsightType): void {
    this.signatures.push(signature);
    this.archetypes.push(archetype);
    this.insights.push(insight);

    if (this.signatures.length > this.maxSignatures) {
      this.signatures.shift();
    }
    if (this.archetypes.length > this.maxArchetypes) {
      this.archetypes.shift();
    }
    if (this.insights.length > this.maxInsights) {
      this.insights.shift();
    }
  }

  clear(): void {
    this.signatures = [];
    this.archetypes = [];
    this.insights = [];
  }

  getArchetypeDistribution(): Record<PuzzleArchetype, number> {
    const dist: Record<PuzzleArchetype, number> = {
      decision: 0,
      order: 0,
      trap: 0,
      chain: 0,
      constraint: 0,
      precision: 0
    };

    for (const arch of this.archetypes) {
      dist[arch]++;
    }

    return dist;
  }
}

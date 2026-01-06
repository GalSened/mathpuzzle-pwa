export * from './types';
export { PuzzleSolver, solver } from './solver';
export { PuzzleGenerator, generator } from './generator';
export { DIFFICULTY_PRESETS, DIFFICULTY_LABELS, adjustDifficulty } from './difficulty';
export { computeSignature, SignatureHistory } from './signatures';
export { generateHint, evaluateAttempt } from './hints';
export {
  adaptiveConfig,
  selectWeightedOperator,
  calculateXPReward,
  calculateCoinReward,
  extractUsedOperators
} from './adaptive';
export {
  ZONES,
  getZoneById,
  getCurrentZone,
  getUnlockedZones,
  getNextZoneToUnlock,
  getZoneProgress,
  isBossPuzzle,
  getBossInfo,
  getZoneOperators,
  canAccessZone,
  getLevelsToNextZone,
  ZONE_STORIES
} from './story';

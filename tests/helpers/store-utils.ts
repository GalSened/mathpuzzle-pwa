/**
 * Store testing utilities
 * Helpers for inspecting and resetting Zustand stores in tests
 */

import { useProgressStore } from '@/store/progressStore';
import { usePlayerStore } from '@/store/playerStore';
import { useShopStore } from '@/store/shopStore';

// Storage keys used by the stores
export const STORAGE_KEYS = {
  progress: 'mathpuzzle-progress-v3',
  player: 'mathpuzzle-player',
  shop: 'mathpuzzle-shop',
  game: 'mathpuzzle-game',
  user: 'mathpuzzle-user',
} as const;

/**
 * Reset all stores to their initial state
 */
export function resetAllStores() {
  useProgressStore.getState().resetProgress();
  usePlayerStore.getState().resetPlayer();
  useShopStore.getState().resetShop();
}

/**
 * Get the progress store state for inspection
 */
export function getProgressState() {
  return useProgressStore.getState();
}

/**
 * Get the player store state for inspection
 */
export function getPlayerState() {
  return usePlayerStore.getState();
}

/**
 * Get the shop store state for inspection
 */
export function getShopState() {
  return useShopStore.getState();
}

/**
 * Simulate solving N puzzles in the current level
 */
export function solvePuzzles(count: number) {
  const progressStore = useProgressStore.getState();
  for (let i = 0; i < count; i++) {
    progressStore.recordPuzzleSolved();
  }
}

/**
 * Complete the current level by solving all required puzzles
 */
export function completeCurrentLevel() {
  const state = useProgressStore.getState();
  const levelProgress = state.getLevelProgress(state.currentLevel);

  if (levelProgress) {
    const remaining = levelProgress.puzzlesRequired - levelProgress.puzzlesSolved;
    solvePuzzles(remaining);
    state.completeLevel();
  }
}

/**
 * Set player coins directly for testing
 */
export function setPlayerCoins(amount: number) {
  const playerStore = usePlayerStore.getState();
  // Reset coins first, then add the amount
  const current = playerStore.coins;
  if (current > 0) {
    playerStore.useCoins(current);
  }
  // Add coins by simulating puzzle rewards
  // We need to add coins in chunks since addCoins uses predefined rewards
  while (playerStore.coins < amount) {
    playerStore.addCoins(0, 'puzzle'); // Each adds 10
    if (playerStore.coins >= amount) break;
  }
  // Trim if we overshot
  if (playerStore.coins > amount) {
    playerStore.useCoins(playerStore.coins - amount);
  }
}

/**
 * Set player level directly for testing
 */
export function setPlayerLevel(level: number) {
  const playerStore = usePlayerStore.getState();
  // Add enough XP to reach the desired level
  while (playerStore.level < level) {
    playerStore.addXP(1000); // Large XP boost
  }
  playerStore.clearPendingLevelUp();
}

/**
 * Quick progression to a specific level
 */
export function progressToLevel(targetLevel: number) {
  const progressStore = useProgressStore.getState();

  while (progressStore.currentLevel < targetLevel) {
    completeCurrentLevel();
  }
}

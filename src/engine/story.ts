import type { Zone, PlayerState, Operator } from './types';

// Four zones in "The Fractured Grid" world
export const ZONES: Zone[] = [
  {
    id: 'addlands',
    name: 'Addlands',
    nameHe: 'ארץ החיבור',
    ops: ['+'] as Operator[],
    unlockLevel: 1,
    theme: {
      background: 'from-green-900 to-emerald-800',
      accent: 'green-400',
      pattern: 'plus-signs',
    },
    bossEvery: 5,
    description: 'The entrance to the world - ruled by the Green Lord',
    descriptionHe: 'הכניסה לעולם - שולט האדון הירוק',
  },
  {
    id: 'subcore',
    name: 'SubCore',
    nameHe: 'ליבת החיסור',
    ops: ['+', '-'] as Operator[],
    unlockLevel: 3,
    theme: {
      background: 'from-blue-900 to-cyan-800',
      accent: 'blue-400',
      pattern: 'minus-signs',
    },
    bossEvery: 5,
    description: 'The blue code maze',
    descriptionHe: 'מבוך הקוד הכחול',
  },
  {
    id: 'multforge',
    name: 'MultForge',
    nameHe: 'נפחיית הכפל',
    ops: ['+', '-', '×'] as Operator[],
    unlockLevel: 6,
    theme: {
      background: 'from-orange-900 to-amber-800',
      accent: 'amber-400',
      pattern: 'multiplication',
    },
    bossEvery: 5,
    description: 'The volcano where numbers are forged',
    descriptionHe: 'הר הגעש שבו נוצרים המספרים',
  },
  {
    id: 'divvoid',
    name: 'DivVoid',
    nameHe: 'תהום החילוק',
    ops: ['+', '-', '×', '÷'] as Operator[],
    unlockLevel: 10,
    theme: {
      background: 'from-purple-900 to-violet-800',
      accent: 'purple-400',
      pattern: 'division',
    },
    bossEvery: 5,
    description: 'The dark zone where numbers are divided',
    descriptionHe: 'האזור האפל שבו מתחלקים המספרים',
  },
];

// Get zone by ID
export function getZoneById(zoneId: string): Zone | undefined {
  return ZONES.find(z => z.id === zoneId);
}

// Get current zone based on player level
export function getCurrentZone(player: PlayerState): Zone {
  // Find the highest unlocked zone
  let currentZone = ZONES[0];

  for (const zone of ZONES) {
    if (player.level >= zone.unlockLevel) {
      currentZone = zone;
    }
  }

  return currentZone;
}

// Get all unlocked zones for a player
export function getUnlockedZones(player: PlayerState): Zone[] {
  return ZONES.filter(zone => player.level >= zone.unlockLevel);
}

// Get next zone to unlock
export function getNextZoneToUnlock(player: PlayerState): Zone | null {
  const nextZone = ZONES.find(zone => player.level < zone.unlockLevel);
  return nextZone || null;
}

// Calculate progress within a zone (0-100)
export function getZoneProgress(
  player: PlayerState,
  zone: Zone,
  puzzlesSolvedInZone: number
): number {
  // Each zone requires solving 5 puzzles before boss
  const puzzlesPerBoss = zone.bossEvery;
  const progressInCycle = puzzlesSolvedInZone % puzzlesPerBoss;
  return (progressInCycle / puzzlesPerBoss) * 100;
}

// Check if current puzzle is a boss puzzle
export function isBossPuzzle(puzzleNumber: number, zone: Zone): boolean {
  return puzzleNumber > 0 && puzzleNumber % zone.bossEvery === 0;
}

// Get boss info for a zone
export function getBossInfo(zone: Zone): {
  name: string;
  nameHe: string;
  difficulty: number;
} {
  const bossMap: Record<string, { name: string; nameHe: string; difficulty: number }> = {
    addlands: {
      name: 'The Green Lord',
      nameHe: 'האדון הירוק',
      difficulty: 2,
    },
    subcore: {
      name: 'The Blue Guardian',
      nameHe: 'השומר הכחול',
      difficulty: 3,
    },
    multforge: {
      name: 'The Flame Master',
      nameHe: 'אדון הלהבות',
      difficulty: 4,
    },
    divvoid: {
      name: 'The Void King',
      nameHe: 'מלך התהום',
      difficulty: 5,
    },
  };

  return bossMap[zone.id] || { name: 'Boss', nameHe: 'בוס', difficulty: 3 };
}

// Get zone-specific operators for puzzle generation
export function getZoneOperators(zone: Zone): Operator[] {
  return [...zone.ops];
}

// Check if player can access a zone
export function canAccessZone(player: PlayerState, zone: Zone): boolean {
  return player.level >= zone.unlockLevel;
}

// Get levels needed to unlock next zone
export function getLevelsToNextZone(player: PlayerState): number | null {
  const nextZone = getNextZoneToUnlock(player);
  if (!nextZone) return null;
  return Math.max(0, nextZone.unlockLevel - player.level);
}

// Zone-specific story text
export const ZONE_STORIES: Record<string, {
  intro: string;
  introHe: string;
  bossIntro: string;
  bossIntroHe: string;
  victory: string;
  victoryHe: string;
}> = {
  addlands: {
    intro: 'Welcome to the Addlands, where addition rules supreme.',
    introHe: 'ברוכים הבאים לארץ החיבור, שם החיבור שולט.',
    bossIntro: 'The Green Lord appears! Defeat him with your addition skills!',
    bossIntroHe: 'האדון הירוק מופיע! הביסו אותו עם כישורי החיבור שלכם!',
    victory: 'The Green Lord has been defeated! SubCore awaits...',
    victoryHe: 'האדון הירוק הובס! ליבת החיסור מחכה...',
  },
  subcore: {
    intro: 'You enter the SubCore, where subtraction flows through the code.',
    introHe: 'אתם נכנסים לליבת החיסור, שם החיסור זורם בקוד.',
    bossIntro: 'The Blue Guardian blocks your path! Use subtraction to pass!',
    bossIntroHe: 'השומר הכחול חוסם את דרככם! השתמשו בחיסור לעבור!',
    victory: 'The Blue Guardian yields! MultForge is now open!',
    victoryHe: 'השומר הכחול נכנע! נפחיית הכפל נפתחה!',
  },
  multforge: {
    intro: 'The fires of MultForge burn bright. Multiplication rules here.',
    introHe: 'האש של נפחיית הכפל בוערת. הכפל שולט כאן.',
    bossIntro: 'The Flame Master rises! Show your multiplication mastery!',
    bossIntroHe: 'אדון הלהבות קם! הפגינו את שליטתכם בכפל!',
    victory: 'The Flame Master is extinguished! DivVoid beckons...',
    victoryHe: 'אדון הלהבות כובה! תהום החילוק קורא...',
  },
  divvoid: {
    intro: 'Welcome to the DivVoid, the ultimate challenge. All operations combine.',
    introHe: 'ברוכים הבאים לתהום החילוק, האתגר האולטימטיבי. כל הפעולות מתחברות.',
    bossIntro: 'The Void King awaits! Master all operations to defeat him!',
    bossIntroHe: 'מלך התהום מחכה! שלטו בכל הפעולות להביסו!',
    victory: 'The Void King is vanquished! You are a true Math Master!',
    victoryHe: 'מלך התהום הובס! אתם אמן מתמטיקה אמיתי!',
  },
};

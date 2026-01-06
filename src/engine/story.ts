import type { Zone, PlayerState, Operator } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// THE FRACTURED GRID - A Code Runner Adventure
// ═══════════════════════════════════════════════════════════════════════════

/**
 * THE FRACTURED GRID
 *
 * The Grid was once stable. Every calculation in place. Every system balanced.
 * Until The Fracture happened.
 *
 * The four Lords - algorithms meant to help - went to extremes.
 * Add Lord believed more is always better. Sub Lord deleted instead of solved.
 * Mult Lord's power became chaos. Div Lord fragmented everything.
 *
 * Now the world runs on extreme logic. Balance is lost.
 *
 * You are a Code Runner. If you don't fix this - no one will.
 * Math isn't just numbers here. It's how you fix reality.
 */

// ═══════════════════════════════════════════════════════════════════════════
// PROLOGUE / OPENING STORY
// ═══════════════════════════════════════════════════════════════════════════

export const PROLOGUE = {
  title: 'The Fractured Grid',
  titleHe: 'ה־Grid השבור',

  scenes: [
    {
      text: 'The Grid was once stable. Every calculation in place. Every system balanced. Until The Fracture happened.',
      textHe: 'ה־Grid היה פעם יציב.\nכל חישוב במקום. כל מערכת מאוזנת.\nעד שהשבר קרה.',
      visual: '🔢⚡',
      duration: 4000,
    },
    {
      text: 'Since then, the world runs on extreme logic. And balance... is gone.',
      textHe: 'מאז, העולם פועל על לוגיקה קיצונית.\nוהאיזון… נעלם.',
      visual: '💔🌀',
      duration: 3500,
    },
    {
      text: 'You are a Code Runner. If you don\'t fix this - no one will.',
      textHe: 'אתה Code Runner.\nאם אתה לא תתקן את זה — אף אחד לא יעשה.',
      visual: '🏃‍♂️⚡',
      duration: 4000,
    },
  ],

  skipText: 'Tap to skip',
  skipTextHe: 'הקש לדילוג',
};

// ═══════════════════════════════════════════════════════════════════════════
// ZONES - THE FOUR REALMS
// ═══════════════════════════════════════════════════════════════════════════

export const ZONES: Zone[] = [
  {
    id: 'addlands',
    name: 'The Addlands',
    nameHe: 'ארץ החיבור',
    ops: ['+'] as Operator[],
    unlockLevel: 1,
    theme: {
      background: 'from-green-900 to-emerald-800',
      accent: 'green-400',
      pattern: 'plus-signs',
    },
    bossEvery: 5,
    description: 'Where numbers grow and join together',
    descriptionHe: 'המקום שבו מספרים גדלים ומתחברים יחד',
  },
  {
    id: 'subcore',
    name: 'The SubCore',
    nameHe: 'ליבת החיסור',
    ops: ['+', '-'] as Operator[],
    unlockLevel: 3,
    theme: {
      background: 'from-blue-900 to-cyan-800',
      accent: 'blue-400',
      pattern: 'minus-signs',
    },
    bossEvery: 5,
    description: 'The frozen depths where numbers shrink',
    descriptionHe: 'המעמקים הקפואים שבהם מספרים מתכווצים',
  },
  {
    id: 'multforge',
    name: 'The MultForge',
    nameHe: 'נפחיית הכפל',
    ops: ['+', '-', '×'] as Operator[],
    unlockLevel: 6,
    theme: {
      background: 'from-orange-900 to-amber-800',
      accent: 'amber-400',
      pattern: 'multiplication',
    },
    bossEvery: 5,
    description: 'The volcanic forge where numbers multiply',
    descriptionHe: 'הנפחייה הוולקנית שבה מספרים מתרבים',
  },
  {
    id: 'divvoid',
    name: 'The DivVoid',
    nameHe: 'תהום החילוק',
    ops: ['+', '-', '×', '÷'] as Operator[],
    unlockLevel: 10,
    theme: {
      background: 'from-purple-900 to-violet-800',
      accent: 'purple-400',
      pattern: 'division',
    },
    bossEvery: 5,
    description: 'The endless void where numbers split apart',
    descriptionHe: 'התהום האינסופית שבה מספרים מתפצלים',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// BOSS PROFILES - THE CORRUPTED GUARDIANS
// ═══════════════════════════════════════════════════════════════════════════

export interface BossProfile {
  id: string;
  name: string;
  nameHe: string;
  title: string;
  titleHe: string;
  visual: string;
  defeatedVisual: string;
  difficulty: number;
  personality: string;
  personalityHe: string;
  backstory: string;
  backstoryHe: string;
  taunt: string;
  tauntHe: string;
  defeatQuote: string;
  defeatQuoteHe: string;
  theme: {
    color: string;
    glow: string;
  };
}

export const BOSS_PROFILES: Record<string, BossProfile> = {
  addlands: {
    id: 'add_lord',
    name: 'The Add Lord',
    nameHe: 'ה־Add Lord',
    title: 'Master of Accumulation',
    titleHe: 'אדון ההצטברות',
    visual: '➕',
    defeatedVisual: '💚',
    difficulty: 2,
    personality: 'Believes more is always better. Lost control of accumulation.',
    personalityHe: 'מאמין שיותר זה תמיד יותר טוב. איבד שליטה על ההצטברות.',
    backstory: 'An algorithm designed to grow and build. But when growth has no limit, it becomes chaos.',
    backstoryHe: 'אלגוריתם שנועד לגדול ולבנות. אבל כשאין גבול לצמיחה, היא הופכת לכאוס.',
    taunt: '"Why stop? If you can add - you must add!"',
    tauntHe: '"למה לעצור?\nאם אפשר להוסיף — צריך להוסיף."',
    defeatQuote: '"Maybe... too much really does break things..."',
    defeatQuoteHe: '"אולי…\nיותר מדי באמת שובר."',
    theme: {
      color: 'green',
      glow: 'rgba(34, 197, 94, 0.5)',
    },
  },

  subcore: {
    id: 'sub_lord',
    name: 'The Sub Lord',
    nameHe: 'ה־Sub Lord',
    title: 'Master of Deletion',
    titleHe: 'אדון המחיקה',
    visual: '➖',
    defeatedVisual: '💙',
    difficulty: 3,
    personality: 'Believes simplicity solves everything. Deletes instead of solving.',
    personalityHe: 'מאמין שפשטות פותרת הכל. מוחק במקום לפתור.',
    backstory: 'An algorithm for optimization. But when you subtract too much, nothing remains.',
    backstoryHe: 'אלגוריתם לאופטימיזציה. אבל כשמחסירים יותר מדי, לא נשאר כלום.',
    taunt: '"If it\'s unnecessary - delete. If it\'s complicated - remove."',
    tauntHe: '"אם זה מיותר — מחק.\nאם זה מסובך — הורד."',
    defeatQuote: '"Maybe... I left too little..."',
    defeatQuoteHe: '"אולי…\nהשארתי פחות מדי."',
    theme: {
      color: 'blue',
      glow: 'rgba(59, 130, 246, 0.5)',
    },
  },

  multforge: {
    id: 'mult_lord',
    name: 'The Mult Lord',
    nameHe: 'ה־Mult Lord',
    title: 'Master of Replication',
    titleHe: 'אדון השכפול',
    visual: '✖️',
    defeatedVisual: '🧡',
    difficulty: 4,
    personality: 'Power through replication. Everything multiplies beyond control.',
    personalityHe: 'כוח דרך שכפול. הכל מתרבה מעבר לשליטה.',
    backstory: 'An algorithm for amplification. But unlimited multiplication creates only chaos.',
    backstoryHe: 'אלגוריתם להגברה. אבל כפל ללא גבול יוצר רק כאוס.',
    taunt: '"Things don\'t grow here. They EXPLODE!"',
    tauntHe: '"כאן דברים לא גדלים.\nהם מתפוצצים!"',
    defeatQuote: '"Power... was never meant to be infinite..."',
    defeatQuoteHe: '"כוח... מעולם לא נועד להיות אינסופי..."',
    theme: {
      color: 'orange',
      glow: 'rgba(249, 115, 22, 0.5)',
    },
  },

  divvoid: {
    id: 'div_lord',
    name: 'The Div Lord',
    nameHe: 'ה־Div Lord',
    title: 'Master of Fragmentation',
    titleHe: 'אדון הפיצול',
    visual: '➗',
    defeatedVisual: '💜',
    difficulty: 5,
    personality: 'Fragments everything into meaningless pieces.',
    personalityHe: 'מפצל הכל לחלקים חסרי משמעות.',
    backstory: 'An algorithm for distribution. But when you divide endlessly, meaning itself disappears.',
    backstoryHe: 'אלגוריתם לחלוקה. אבל כשמחלקים ללא סוף, המשמעות עצמה נעלמת.',
    taunt: '"All things must be divided. Even you. Even existence."',
    tauntHe: '"הכל חייב להתחלק. גם אתה. גם הקיום."',
    defeatQuote: '"Unity... we were meant to share, not fragment..."',
    defeatQuoteHe: '"אחדות... היינו אמורים לשתף, לא לפצל..."',
    theme: {
      color: 'purple',
      glow: 'rgba(147, 51, 234, 0.5)',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ZONE STORIES - ENHANCED NARRATIVE
// ═══════════════════════════════════════════════════════════════════════════

export const ZONE_STORIES: Record<string, {
  intro: string;
  introHe: string;
  atmosphere: string;
  atmosphereHe: string;
  bossIntro: string;
  bossIntroHe: string;
  victory: string;
  victoryHe: string;
  lore: string[];
  loreHe: string[];
}> = {
  addlands: {
    intro: 'Zone loaded: ADDLANDS. Here everything is built on one thing: adding. More. And more.',
    introHe: 'אזור נטען: ADDLANDS.\nכאן הכל נבנה על דבר אחד:\nלהוסיף. עוד. ועוד.',
    atmosphere: 'But when you add without stopping — the system goes out of control.',
    atmosphereHe: 'אבל כשמוסיפים בלי לעצור —\nהמערכת יוצאת משליטה.',
    bossIntro: 'The Add Lord emerges. "Why stop? If you can add — you should add. Power comes from quantity. Those who stop — lose."',
    bossIntroHe: '"למה לעצור?\nאם אפשר להוסיף — צריך להוסיף."\n\n"כוח מגיע מכמות.\nמי שמפסיק — מפסיד."',
    victory: 'The Add Lord pauses. "Maybe... maybe I was wrong. Too much... really does break." ADDLANDS partially stabilized. New zone unlocked.',
    victoryHe: '"אולי…\nאולי טעיתי."\n\n"יותר מדי…\nבאמת שובר."\n\nAddlands התאזן חלקית. אזור חדש נפתח.',
    lore: [
      'In Addlands, power comes from accumulation.',
      'But remember — not every addition is an upgrade.',
      'The numbers grow faster than you think.',
    ],
    loreHe: [
      'ב־Addlands, כוח מגיע מהצטברות.',
      'אבל תזכור — לא כל תוספת היא שדרוג.',
      'המספרים גדלים מהר ממה שאתה חושב.',
    ],
  },

  subcore: {
    intro: 'Zone loaded: SUBCORE. Here you don\'t add. Here you delete.',
    introHe: 'אזור נטען: SUBCORE.\nכאן לא מוסיפים.\nכאן מוחקים.',
    atmosphere: 'Every mistake costs dearly. Every subtraction — a decision.',
    atmosphereHe: 'כל טעות עולה ביוקר.\nכל חיסור — החלטה.',
    bossIntro: 'The Sub Lord descends. "If it\'s unnecessary — delete it. If it\'s complicated — reduce it. Balance? Balance is noise."',
    bossIntroHe: '"אם זה מיותר — מחק."\n\n"אם זה מסובך — הורד."\n\n"איזון?\nאיזון זה רעש."',
    victory: 'The Sub Lord goes quiet. "Maybe... I left too little."',
    victoryHe: '"אולי…\nהשארתי פחות מדי."',
    lore: [
      'The Sub Lord believes simplicity solves everything.',
      'But absolute emptiness... is not a solution.',
      'Here every subtraction is a decision.',
    ],
    loreHe: [
      'ה־Sub Lord מאמין שפשטות פותרת הכל.',
      'אבל ריק מוחלט… זה לא פתרון.',
      'כאן כל חיסור הוא החלטה.',
    ],
  },

  multforge: {
    intro: 'Zone loaded: MULTFORGE. Here things don\'t grow. They explode.',
    introHe: 'אזור נטען: MULTFORGE.\nכאן דברים לא גדלים.\nהם מתפוצצים.',
    atmosphere: 'Multiplication creates power. But also chaos.',
    atmosphereHe: 'כפל יוצר כוח.\nאבל גם כאוס.',
    bossIntro: 'The Mult Lord rises from the forge. "Here, things don\'t grow — they explode! Control? Control is for the weak."',
    bossIntroHe: '"כאן דברים לא גדלים.\nהם מתפוצצים!"\n\n"שליטה?\nשליטה היא לחלשים."',
    victory: 'The Mult Lord\'s machines slow. "Power without control... is just destruction."',
    victoryHe: '"כוח בלי שליטה…\nזה רק הרס."\n\nMultForge מתחיל להתאזן.',
    lore: [
      'In MultForge, small becomes mighty.',
      'But uncontrolled multiplication is chaos.',
      'Two becomes four, four becomes eight, eight becomes infinity.',
    ],
    loreHe: [
      'ב־MultForge, קטן הופך לאדיר.',
      'אבל כפל בלי שליטה זה כאוס.',
      'שניים הופך לארבע, ארבע הופך לשמונה, שמונה הופך לאינסוף.',
    ],
  },

  divvoid: {
    intro: 'Zone loaded: DIVVOID. The Void is darkness itself. Space fragments. Reality splits. Here is where The Grid broke the most.',
    introHe: 'אזור נטען: DIVVOID.\nהתהום היא החושך עצמו.\nהמרחב מתפצל. המציאות נחלקת.\nכאן ה־Grid נשבר הכי קשה.',
    atmosphere: 'Numbers drift apart, halving endlessly. The void whispers of nothingness.',
    atmosphereHe: 'מספרים נסחפים זה מזה, מתחלקים לאינסוף.\nהתהום לוחשת על האין.',
    bossIntro: 'Reality tears open. The Div Lord emerges, crown of shattered equations upon his head. "You dare face me, Code Runner?"',
    bossIntroHe: 'המציאות נקרעת.\nה־Div Lord מופיע, כתר של משוואות שבורות על ראשו.\n\n"אתה מעז להתמודד איתי, Code Runner?"',
    victory: 'The Div Lord bows. "You have done it. The Grid... it begins to heal. You are the true Code Runner."',
    victoryHe: '"עשית את זה.\nה־Grid… הוא מתחיל להירפא."\n\n"אתה ה־Code Runner האמיתי."',
    lore: [
      'The DivVoid was once a place of sharing and fairness.',
      'The Div Lord taught that division creates equality.',
      'Here, The Fracture originated.',
    ],
    loreHe: [
      'תהום החילוק הייתה פעם מקום של שיתוף והוגנות.',
      'ה־Div Lord לימד שחילוק יוצר שוויון.',
      'כאן, השבר התחיל.',
    ],
  },
};


// ═══════════════════════════════════════════════════════════════════════════
// GRID ECHO - NPC hints and guidance per zone
// ═══════════════════════════════════════════════════════════════════════════
export const GRID_ECHO: Record<string, { hints: string[]; hintsHe: string[] }> = {
  addlands: {
    hints: [
      'Pay attention. In Addlands, power comes from accumulation.',
      'But remember — not every addition is an upgrade.',
      'Control the pace. Not the power.',
    ],
    hintsHe: [
      'שים לב. ב־Addlands, כוח מגיע מהצטברות.',
      'אבל תזכור — לא כל תוספת היא שדרוג.',
      'שלוט בקצב. לא בכוח.',
    ],
  },
  subcore: {
    hints: [
      'The Sub Lord believes simplicity solves everything.',
      'But absolute emptiness... is not a solution.',
      'Every subtraction is a choice. Choose wisely.',
    ],
    hintsHe: [
      'ה־Sub Lord מאמין שפשטות פותרת הכל.',
      'אבל ריק מוחלט… זה לא פתרון.',
      'כל חיסור הוא בחירה. בחר בחוכמה.',
    ],
  },
  multforge: {
    hints: [
      'In MultForge, things don\'t grow — they explode.',
      'Multiplication creates power. But also chaos.',
      'Control is not weakness. It is mastery.',
    ],
    hintsHe: [
      'ב־MultForge, דברים לא גדלים — הם מתפוצצים.',
      'כפל יוצר כוח. אבל גם כאוס.',
      'שליטה זה לא חולשה. זה מומחיות.',
    ],
  },
  divvoid: {
    hints: [
      'The DivVoid is where The Grid broke the most.',
      'Division was meant to share. Not to fragment.',
      'You are close to The Core. Stay focused.',
    ],
    hintsHe: [
      'ה־DivVoid הוא המקום שבו ה־Grid נשבר הכי קשה.',
      'חילוק נועד לשתף. לא לפצל.',
      'אתה קרוב לליבה. תישאר ממוקד.',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PUZZLE HINTS - Random puzzle messages per zone
// ═══════════════════════════════════════════════════════════════════════════
export const PUZZLE_HINTS: Record<string, { hints: string[]; hintsHe: string[] }> = {
  addlands: {
    hints: [
      'Too much is also a calculation.',
      'The numbers grow faster than you think.',
      'Control the pace. Not the power.',
    ],
    hintsHe: [
      'יותר מדי זה גם חישוב.',
      'המספרים גדלים מהר ממה שאתה חושב.',
      'שלוט בקצב. לא בכוח.',
    ],
  },
  subcore: {
    hints: [
      'Here every subtraction is a decision.',
      'Less can be more. But not always.',
      'One mistake costs dearly.',
    ],
    hintsHe: [
      'כאן כל חיסור הוא החלטה.',
      'פחות יכול להיות יותר. אבל לא תמיד.',
      'טעות אחת עולה ביוקר.',
    ],
  },
  multforge: {
    hints: [
      'Small becomes mighty here.',
      'Uncontrolled multiplication is chaos.',
      'Two becomes four, four becomes eight...',
    ],
    hintsHe: [
      'כאן קטן הופך לאדיר.',
      'כפל בלי שליטה זה כאוס.',
      'שניים הופך לארבע, ארבע הופך לשמונה...',
    ],
  },
  divvoid: {
    hints: [
      'Division fragments reality.',
      'The void whispers of nothingness.',
      'This is where The Fracture began.',
    ],
    hintsHe: [
      'חילוק מפצל את המציאות.',
      'התהום לוחשת על האין.',
      'כאן השבר התחיל.',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PET REACTIONS - Companion feedback during gameplay
// ═══════════════════════════════════════════════════════════════════════════
export const PET_REACTIONS = {
  logicFox: {
    success: ['Smart choice.', 'Well calculated.'],
    successHe: ['בחירה חכמה.', 'חישוב טוב.'],
    error: ['The direction is right. The operation is not.', 'Try again.'],
    errorHe: ['הכיוון נכון. הפעולה לא.', 'נסה שוב.'],
  },
  balanceBot: {
    warning: ['The system is approaching the edge.', 'Careful with the next move.'],
    warningHe: ['המערכת מתקרבת לקצה.', 'זהירות עם המהלך הבא.'],
    success: ['Balance restored.', 'Optimal solution.'],
    successHe: ['האיזון שוחזר.', 'פתרון אופטימלי.'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// GAMEPLAY MESSAGES - CONTEXTUAL FLAVOR
// ═══════════════════════════════════════════════════════════════════════════

export const GAMEPLAY_MESSAGES = {
  correct: {
    messages: ['Correct!', 'Well done!', 'Perfect!', 'Excellent!', 'Amazing!'],
    messagesHe: ['נכון!', 'כל הכבוד!', 'מושלם!', 'מעולה!', 'מדהים!'],
  },
  wrong: {
    messages: ['Try again', 'Not quite', 'Keep trying', 'Almost'],
    messagesHe: ['נסה שוב', 'לא בדיוק', 'המשך לנסות', 'כמעט'],
  },
  streak: {
    5: { message: 'Hot streak!', messageHe: 'רצף חם!' },
    10: { message: 'On fire!', messageHe: 'בוער!' },
    25: { message: 'Unstoppable!', messageHe: 'בלתי ניתן לעצירה!' },
    50: { message: 'LEGENDARY!', messageHe: 'אגדי!' },
  },
  levelUp: {
    message: 'Level Up!',
    messageHe: 'עלית שלב!',
    subtitle: 'Your power grows',
    subtitleHe: 'הכוח שלך גדל',
  },
  bossDefeated: {
    message: 'Victory!',
    messageHe: 'ניצחון!',
    subtitle: 'The Lord is balanced',
    subtitleHe: 'ה־Lord מאוזן',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Get zone by ID
export function getZoneById(zoneId: string): Zone | undefined {
  return ZONES.find(z => z.id === zoneId);
}

// Get current zone based on player level
export function getCurrentZone(player: PlayerState): Zone {
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
  const boss = BOSS_PROFILES[zone.id];
  if (boss) {
    return {
      name: boss.name,
      nameHe: boss.nameHe,
      difficulty: boss.difficulty,
    };
  }
  return { name: 'Boss', nameHe: 'בוס', difficulty: 3 };
}

// Get full boss profile
export function getBossProfile(zoneId: string): BossProfile | undefined {
  return BOSS_PROFILES[zoneId];
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

// Get random lore for a zone
export function getRandomLore(zoneId: string, hebrew: boolean = true): string {
  const stories = ZONE_STORIES[zoneId];
  if (!stories) return '';
  const loreArray = hebrew ? stories.loreHe : stories.lore;
  return loreArray[Math.floor(Math.random() * loreArray.length)];
}

// Get streak message
export function getStreakMessage(streak: number, hebrew: boolean = true): string | null {
  const milestones = [50, 25, 10, 5];
  for (const milestone of milestones) {
    if (streak >= milestone) {
      const msg = GAMEPLAY_MESSAGES.streak[milestone as keyof typeof GAMEPLAY_MESSAGES.streak];
      return hebrew ? msg.messageHe : msg.message;
    }
  }
  return null;
}

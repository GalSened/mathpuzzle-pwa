import type { WorldId } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// THE FRACTURED GRID - A Code Runner Adventure
// V3: 5 Worlds × 6 Levels = 30 Level Journey
// ═══════════════════════════════════════════════════════════════════════════

/**
 * THE FRACTURED GRID
 *
 * The Grid was once stable. Every calculation in place. Every system balanced.
 * Until The Fracture happened.
 *
 * Five Masters - algorithms meant to maintain order - went to extremes.
 * Now each World runs on broken logic. Balance is lost.
 *
 * You are a Code Runner. Journey through all five Worlds.
 * Defeat each Master. Restore The Grid.
 *
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
      text: 'Five Worlds. Five Masters. Each lost in their own broken logic.',
      textHe: 'חמישה עולמות. חמישה אדונים.\nכל אחד אבוד בלוגיקה השבורה שלו.',
      visual: '🌍🔥',
      duration: 3500,
    },
    {
      text: 'You are a Code Runner. Journey through all Worlds. Restore The Grid.',
      textHe: 'אתה Code Runner.\nעבור את כל העולמות.\nשחזר את ה־Grid.',
      visual: '🏃‍♂️⚡',
      duration: 4000,
    },
  ],

  skipText: 'Tap to skip',
  skipTextHe: 'הקש לדילוג',
};

// ═══════════════════════════════════════════════════════════════════════════
// BOSS PROFILES - THE FIVE MASTERS
// ═══════════════════════════════════════════════════════════════════════════

export interface BossProfile {
  id: string;
  worldId: WorldId;
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

export const BOSS_PROFILES: Record<WorldId, BossProfile> = {
  training: {
    id: 'training_master',
    worldId: 'training',
    name: 'Training Master',
    nameHe: 'אדון האימונים',
    title: 'Guardian of Basics',
    titleHe: 'שומר היסודות',
    visual: '🌿',
    defeatedVisual: '💚',
    difficulty: 2,
    personality: 'Believes fundamentals must be perfect before advancing.',
    personalityHe: 'מאמין שיסודות חייבים להיות מושלמים לפני התקדמות.',
    backstory: 'The first guardian. Tests all who wish to enter The Grid.',
    backstoryHe: 'השומר הראשון. בוחן את כל מי שרוצה להיכנס ל־Grid.',
    taunt: '"Show me you understand the basics. Only then may you proceed."',
    tauntHe: '"הראה לי שאתה מבין את היסודות.\nרק אז תוכל להתקדם."',
    defeatQuote: '"You have learned well. The path forward is open."',
    defeatQuoteHe: '"למדת היטב.\nהדרך קדימה פתוחה."',
    theme: {
      color: 'emerald',
      glow: 'rgba(16, 185, 129, 0.5)',
    },
  },

  factory: {
    id: 'factory_foreman',
    worldId: 'factory',
    name: 'Factory Foreman',
    nameHe: 'מנהל המפעל',
    title: 'Master of Precision',
    titleHe: 'אדון הדיוק',
    visual: '🏭',
    defeatedVisual: '🧡',
    difficulty: 3,
    personality: 'Demands exact calculations. No room for error.',
    personalityHe: 'דורש חישובים מדויקים. אין מקום לטעויות.',
    backstory: 'Runs the production systems. Every number must be exact.',
    backstoryHe: 'מפעיל את מערכות הייצור. כל מספר חייב להיות מדויק.',
    taunt: '"In my factory, precision is everything. One mistake shuts down the line."',
    tauntHe: '"במפעל שלי, דיוק זה הכל.\nטעות אחת עוצרת את הקו."',
    defeatQuote: '"Your calculations are flawless. The factory runs smoothly again."',
    defeatQuoteHe: '"החישובים שלך מושלמים.\nהמפעל פועל שוב כשורה."',
    theme: {
      color: 'orange',
      glow: 'rgba(249, 115, 22, 0.5)',
    },
  },

  lab: {
    id: 'lab_director',
    worldId: 'lab',
    name: 'Lab Director',
    nameHe: 'מנהל המעבדה',
    title: 'Master of Experiments',
    titleHe: 'אדון הניסויים',
    visual: '🔬',
    defeatedVisual: '💜',
    difficulty: 4,
    personality: 'Pushes boundaries. Tests theories to their limits.',
    personalityHe: 'דוחף גבולות. בוחן תיאוריות עד הקצה.',
    backstory: 'Here, four numbers become the standard. Complexity rises.',
    backstoryHe: 'כאן, ארבעה מספרים הופכים לסטנדרט. המורכבות עולה.',
    taunt: '"More variables. More possibilities. Can you handle the complexity?"',
    tauntHe: '"יותר משתנים. יותר אפשרויות.\nאתה יכול להתמודד עם המורכבות?"',
    defeatQuote: '"Fascinating. Your mind adapts to complexity. Proceed."',
    defeatQuoteHe: '"מרתק.\nהמוח שלך מסתגל למורכבות.\nהמשך."',
    theme: {
      color: 'purple',
      glow: 'rgba(168, 85, 247, 0.5)',
    },
  },

  city: {
    id: 'city_mayor',
    worldId: 'city',
    name: 'City Mayor',
    nameHe: 'ראש העיר',
    title: 'Master of Systems',
    titleHe: 'אדון המערכות',
    visual: '🏙️',
    defeatedVisual: '💙',
    difficulty: 5,
    personality: 'Manages interconnected systems. Everything affects everything.',
    personalityHe: 'מנהל מערכות מחוברות. הכל משפיע על הכל.',
    backstory: 'The city\'s calculations power millions. No margin for error.',
    backstoryHe: 'החישובים של העיר מפעילים מיליונים. אין מרווח לטעויות.',
    taunt: '"The city never sleeps. Neither do its calculations. Keep up."',
    tauntHe: '"העיר לעולם לא ישנה.\nגם החישובים שלה לא.\nעמוד בקצב."',
    defeatQuote: '"The city flows again. You have earned your place in The Core."',
    defeatQuoteHe: '"העיר זורמת שוב.\nהרווחת את מקומך בליבה."',
    theme: {
      color: 'blue',
      glow: 'rgba(59, 130, 246, 0.5)',
    },
  },

  core: {
    id: 'the_architect',
    worldId: 'core',
    name: 'The Architect',
    nameHe: 'האדריכל',
    title: 'Creator of The Grid',
    titleHe: 'יוצר ה־Grid',
    visual: '💎',
    defeatedVisual: '❤️',
    difficulty: 6,
    personality: 'The original designer. Lost in his own creation.',
    personalityHe: 'המעצב המקורי. אבוד ביצירה של עצמו.',
    backstory: 'The one who built The Grid. The one who broke it. The final test.',
    backstoryHe: 'מי שבנה את ה־Grid. מי ששבר אותו. המבחן האחרון.',
    taunt: '"I built this world with numbers. Let\'s see if you can rebuild it."',
    tauntHe: '"בניתי את העולם הזה עם מספרים.\nבוא נראה אם אתה יכול לבנות אותו מחדש."',
    defeatQuote: '"The Grid... it\'s whole again. You are the true Code Runner."',
    defeatQuoteHe: '"ה־Grid... הוא שלם שוב.\nאתה ה־Code Runner האמיתי."',
    theme: {
      color: 'red',
      glow: 'rgba(239, 68, 68, 0.5)',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// WORLD STORIES - NARRATIVE FOR EACH WORLD
// ═══════════════════════════════════════════════════════════════════════════

export const WORLD_STORIES: Record<WorldId, {
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
  training: {
    intro: 'World loaded: TRAINING GROUNDS. This is where every Code Runner begins.',
    introHe: 'עולם נטען: מגרש האימונים.\nכאן כל Code Runner מתחיל.',
    atmosphere: 'The basics may seem simple. But mastery requires understanding.',
    atmosphereHe: 'היסודות נראים פשוטים.\nאבל שליטה דורשת הבנה.',
    bossIntro: 'The Training Master awaits. "Show me you understand the basics."',
    bossIntroHe: 'אדון האימונים ממתין.\n"הראה לי שאתה מבין את היסודות."',
    victory: 'Training complete. The first World is restored. The Factory awaits.',
    victoryHe: 'האימון הושלם.\nהעולם הראשון שוחזר.\nהמפעל ממתין.',
    lore: [
      'Every great journey begins with a single step.',
      'The basics are the foundation of mastery.',
      'Three numbers. Four operations. Infinite possibilities.',
    ],
    loreHe: [
      'כל מסע גדול מתחיל בצעד אחד.',
      'היסודות הם הבסיס לשליטה.',
      'שלושה מספרים. ארבע פעולות. אינסוף אפשרויות.',
    ],
  },

  factory: {
    intro: 'World loaded: THE FACTORY. Here precision is law. Every calculation must be exact.',
    introHe: 'עולם נטען: המפעל.\nכאן דיוק הוא חוק.\nכל חישוב חייב להיות מדויק.',
    atmosphere: 'The machines hum with numbers. One wrong input cascades through the system.',
    atmosphereHe: 'המכונות מזמזמות עם מספרים.\nקלט שגוי אחד מתפשט במערכת.',
    bossIntro: 'The Factory Foreman appears. "In my factory, there is no room for error."',
    bossIntroHe: 'מנהל המפעל מופיע.\n"במפעל שלי, אין מקום לטעויות."',
    victory: 'The factory lines flow smoothly. Precision restored. The Lab beckons.',
    victoryHe: 'קווי המפעל זורמים בצורה חלקה.\nהדיוק שוחזר.\nהמעבדה קוראת.',
    lore: [
      'The Factory was built on order and precision.',
      'Every gear turns on exact calculations.',
      'Mistakes here don\'t just fail - they break the chain.',
    ],
    loreHe: [
      'המפעל נבנה על סדר ודיוק.',
      'כל גלגל שיניים מסתובב על חישובים מדויקים.',
      'טעויות כאן לא רק נכשלות - הן שוברות את השרשרת.',
    ],
  },

  lab: {
    intro: 'World loaded: THE LAB. Four numbers become the standard. Complexity rises.',
    introHe: 'עולם נטען: המעבדה.\nארבעה מספרים הופכים לסטנדרט.\nהמורכבות עולה.',
    atmosphere: 'Experiments run constantly. Each puzzle tests the limits of logic.',
    atmosphereHe: 'ניסויים רצים ללא הפסקה.\nכל חידה בוחנת את גבולות ההיגיון.',
    bossIntro: 'The Lab Director emerges from the equations. "More variables. Can you adapt?"',
    bossIntroHe: 'מנהל המעבדה צץ מתוך המשוואות.\n"יותר משתנים. אתה יכול להסתגל?"',
    victory: 'The experiments stabilize. Complexity mastered. The City opens its gates.',
    victoryHe: 'הניסויים מתייצבים.\nהמורכבות נשלטת.\nהעיר פותחת את שעריה.',
    lore: [
      'The Lab pushes the boundaries of what\'s possible.',
      'Four numbers unlock new dimensions of calculation.',
      'Here, theory becomes practice.',
    ],
    loreHe: [
      'המעבדה דוחפת את גבולות האפשרי.',
      'ארבעה מספרים פותחים מימדים חדשים של חישוב.',
      'כאן, תיאוריה הופכת למעשה.',
    ],
  },

  city: {
    intro: 'World loaded: THE CITY. Millions depend on these calculations. No pressure.',
    introHe: 'עולם נטען: העיר.\nמיליונים תלויים בחישובים האלה.\nבלי לחץ.',
    atmosphere: 'The city never sleeps. Systems interconnect. Everything affects everything.',
    atmosphereHe: 'העיר לעולם לא ישנה.\nמערכות מחוברות.\nהכל משפיע על הכל.',
    bossIntro: 'The Mayor stands atop City Hall. "The city runs on precision. Show me yours."',
    bossIntroHe: 'ראש העיר עומד על בניין העירייה.\n"העיר רצה על דיוק. הראה לי את שלך."',
    victory: 'The city hums with renewed energy. Only The Core remains.',
    victoryHe: 'העיר מזמזמת באנרגיה מחודשת.\nנשארה רק הליבה.',
    lore: [
      'The City is where all systems converge.',
      'Every calculation here powers something greater.',
      'This is where Code Runners prove their worth.',
    ],
    loreHe: [
      'העיר היא המקום שבו כל המערכות מתכנסות.',
      'כל חישוב כאן מפעיל משהו גדול יותר.',
      'כאן Code Runners מוכיחים את עצמם.',
    ],
  },

  core: {
    intro: 'World loaded: THE CORE. The heart of The Grid. Where The Fracture began.',
    introHe: 'עולם נטען: הליבה.\nהלב של ה־Grid.\nהמקום שבו השבר התחיל.',
    atmosphere: 'Raw energy pulses through crystalline structures. The final challenge.',
    atmosphereHe: 'אנרגיה גולמית פועמת דרך מבנים גבישיים.\nהאתגר האחרון.',
    bossIntro: 'The Architect materializes from pure code. "I built this world. Can you restore it?"',
    bossIntroHe: 'האדריכל מתגשם מקוד טהור.\n"בניתי את העולם הזה. אתה יכול לשחזר אותו?"',
    victory: 'The Grid pulses with renewed life. The Fracture is healed. You are the true Code Runner.',
    victoryHe: 'ה־Grid פועם בחיים מחודשים.\nהשבר נרפא.\nאתה ה־Code Runner האמיתי.',
    lore: [
      'The Core is where The Grid was born.',
      'The Architect created everything. Then lost control.',
      'Only the worthy reach this place.',
    ],
    loreHe: [
      'הליבה היא המקום שבו ה־Grid נולד.',
      'האדריכל יצר הכל. ואז איבד שליטה.',
      'רק הראויים מגיעים למקום הזה.',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// WORLD ECHO - NPC hints and guidance per world
// ═══════════════════════════════════════════════════════════════════════════

export const WORLD_ECHO: Record<WorldId, { hints: string[]; hintsHe: string[] }> = {
  training: {
    hints: [
      'Start simple. Master the basics.',
      'All four operations are available. Use them wisely.',
      'The Training Master tests understanding, not speed.',
    ],
    hintsHe: [
      'התחל פשוט. שלוט ביסודות.',
      'כל ארבע הפעולות זמינות. השתמש בהן בחוכמה.',
      'אדון האימונים בודק הבנה, לא מהירות.',
    ],
  },
  factory: {
    hints: [
      'Precision is everything in The Factory.',
      'One wrong step breaks the chain.',
      'Think before you calculate.',
    ],
    hintsHe: [
      'דיוק זה הכל במפעל.',
      'צעד שגוי אחד שובר את השרשרת.',
      'חשוב לפני שאתה מחשב.',
    ],
  },
  lab: {
    hints: [
      'Four numbers increase the possibilities.',
      'The Lab tests your adaptability.',
      'Complexity is just organized simplicity.',
    ],
    hintsHe: [
      'ארבעה מספרים מגדילים את האפשרויות.',
      'המעבדה בודקת את יכולת ההסתגלות שלך.',
      'מורכבות היא רק פשטות מאורגנת.',
    ],
  },
  city: {
    hints: [
      'The City never stops calculating.',
      'Every number connects to something bigger.',
      'You\'re close to The Core. Stay focused.',
    ],
    hintsHe: [
      'העיר לעולם לא מפסיקה לחשב.',
      'כל מספר מתחבר למשהו גדול יותר.',
      'אתה קרוב לליבה. תישאר ממוקד.',
    ],
  },
  core: {
    hints: [
      'The Core is where it all began.',
      'The Architect awaits at the end.',
      'This is your final test, Code Runner.',
    ],
    hintsHe: [
      'הליבה היא המקום שבו הכל התחיל.',
      'האדריכל ממתין בסוף.',
      'זה המבחן האחרון שלך, Code Runner.',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// PUZZLE HINTS - Random puzzle messages per world
// ═══════════════════════════════════════════════════════════════════════════

export const PUZZLE_HINTS: Record<WorldId, { hints: string[]; hintsHe: string[] }> = {
  training: {
    hints: [
      'The basics are the foundation.',
      'Three numbers, four operations.',
      'Take your time. Learn the patterns.',
    ],
    hintsHe: [
      'היסודות הם הבסיס.',
      'שלושה מספרים, ארבע פעולות.',
      'קח את הזמן. למד את הדפוסים.',
    ],
  },
  factory: {
    hints: [
      'Precision powers production.',
      'Every calculation matters.',
      'No shortcuts in The Factory.',
    ],
    hintsHe: [
      'דיוק מפעיל ייצור.',
      'כל חישוב חשוב.',
      'אין קיצורי דרך במפעל.',
    ],
  },
  lab: {
    hints: [
      'Four numbers. New possibilities.',
      'Experiment with different approaches.',
      'The solution may not be obvious.',
    ],
    hintsHe: [
      'ארבעה מספרים. אפשרויות חדשות.',
      'נסה גישות שונות.',
      'הפתרון עשוי לא להיות ברור.',
    ],
  },
  city: {
    hints: [
      'Systems within systems.',
      'The city depends on you.',
      'Think big picture.',
    ],
    hintsHe: [
      'מערכות בתוך מערכות.',
      'העיר תלויה בך.',
      'חשוב על התמונה הגדולה.',
    ],
  },
  core: {
    hints: [
      'This is the heart of everything.',
      'The Architect\'s final test.',
      'You were built for this.',
    ],
    hintsHe: [
      'זה הלב של הכל.',
      'המבחן האחרון של האדריכל.',
      'נבנית בשביל זה.',
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
    message: 'Level Complete!',
    messageHe: 'השלב הושלם!',
    subtitle: 'Next challenge awaits',
    subtitleHe: 'האתגר הבא ממתין',
  },
  bossDefeated: {
    message: 'Victory!',
    messageHe: 'ניצחון!',
    subtitle: 'The Master is defeated',
    subtitleHe: 'האדון הובס',
  },
  worldComplete: {
    message: 'World Complete!',
    messageHe: 'העולם הושלם!',
    subtitle: 'A new World awaits',
    subtitleHe: 'עולם חדש ממתין',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Get boss profile for a world
export function getBossProfile(worldId: WorldId): BossProfile {
  return BOSS_PROFILES[worldId];
}

// Get world story
export function getWorldStory(worldId: WorldId) {
  return WORLD_STORIES[worldId];
}

// Get random lore for a world
export function getRandomLore(worldId: WorldId, hebrew: boolean = true): string {
  const stories = WORLD_STORIES[worldId];
  if (!stories) return '';
  const loreArray = hebrew ? stories.loreHe : stories.lore;
  return loreArray[Math.floor(Math.random() * loreArray.length)];
}

// Get random hint for a world
export function getRandomHint(worldId: WorldId, hebrew: boolean = true): string {
  const hints = PUZZLE_HINTS[worldId];
  if (!hints) return '';
  const hintArray = hebrew ? hints.hintsHe : hints.hints;
  return hintArray[Math.floor(Math.random() * hintArray.length)];
}

// Get random echo message for a world
export function getRandomEcho(worldId: WorldId, hebrew: boolean = true): string {
  const echo = WORLD_ECHO[worldId];
  if (!echo) return '';
  const echoArray = hebrew ? echo.hintsHe : echo.hints;
  return echoArray[Math.floor(Math.random() * echoArray.length)];
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

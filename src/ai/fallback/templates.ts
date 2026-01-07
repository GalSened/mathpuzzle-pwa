/**
 * Fallback Templates (Hebrew)
 *
 * These templates are used when:
 * - AI is disabled
 * - API call fails
 * - Rate limit exceeded
 * - Response timeout
 *
 * Game works 100% with these templates alone.
 */

import type { WorldId } from '@/engine/types';
import type { NarrativeType, PlayerStyle, RecentOutcome } from '../types';

/**
 * Boss introduction lines per world.
 */
export const BOSS_INTRO_TEMPLATES: Record<WorldId, string[]> = {
  training: [
    'הגעת עד הלום? בוא נראה מה אתה שווה!',
    'אני לא אתן לך לעבור בקלות!',
    'חשבת שזה יהיה פשוט? חכה ותראה!',
    'האימונים שלי יעשו ממך מתמטיקאי אמיתי!',
  ],
  factory: [
    'המפעל שלי לא יפול בקלות!',
    'אתה חושב שאתה יכול לפתור את החידות שלי?',
    'המכונות שלי מחכות לך!',
    'בוא ונראה אם אתה מספיק חכם!',
  ],
  lab: [
    'הניסויים שלי יעצרו אותך!',
    'המעבדה שלי מלאה בהפתעות!',
    'המדע שלי יביס אותך!',
    'מוכן לניסוי האמיתי?',
  ],
  city: [
    'העיר שלי, החוקים שלי!',
    'אף אחד לא עובר מכאן!',
    'הרחובות שלי מלאים באתגרים!',
    'בוא נראה אם תשרוד בעיר!',
  ],
  core: [
    'זה הסוף שלך, מתמטיקאי קטן!',
    'הליבה שלי לא תיכנע!',
    'הגעת רחוק, אבל כאן זה נגמר!',
    'רק הטובים ביותר מגיעים לכאן!',
  ],
};

/**
 * Boss defeat lines (when player wins).
 */
export const BOSS_DEFEAT_TEMPLATES: Record<WorldId, string[]> = {
  training: [
    'איך... איך הצלחת?!',
    'אתה יותר חזק ממה שחשבתי...',
    'טוב, עברת את המבחן הראשון!',
  ],
  factory: [
    'המכונות שלי... נעצרו!',
    'לא ייתכן! המפעל שלי!',
    'אתה באמת טוב במספרים...',
  ],
  lab: [
    'הניסוי נכשל... בגללך!',
    'המדע שלי לא הספיק...',
    'אתה פתרת את הנוסחה!',
  ],
  city: [
    'העיר שלי... חופשית!',
    'הפסדתי את השליטה...',
    'אתה גיבור העיר עכשיו!',
  ],
  core: [
    'לא... לא יכול להיות!',
    'ניצחת... אתה האלוף!',
    'הכוח שלי... נעלם!',
  ],
};

/**
 * Player victory messages (world completion).
 */
export const VICTORY_TEMPLATES: string[] = [
  'מדהים! הצלחת!',
  'כל הכבוד, אלוף!',
  'ניצחון מרשים!',
  'אתה גאון!',
  'מושלם!',
  'עבודה נהדרת!',
  'אין עליך!',
  'אלוף העולם!',
];

/**
 * Encouragement messages (when struggling).
 */
export const ENCOURAGEMENT_TEMPLATES: Record<RecentOutcome, string[]> = {
  struggle: [
    'אתה יכול! נסה שוב!',
    'כל טעות מלמדת משהו חדש!',
    'קח נשימה עמוקה ונסה שוב',
    'אל תוותר, אתה כמעט שם!',
    'מאמין בך!',
    'תחשוב צעד אחד בכל פעם',
  ],
  fail: [
    'לא נורא! נסה שוב!',
    'כל אחד טועה לפעמים',
    'אתה לומד מכל ניסיון!',
    'בפעם הבאה תצליח!',
    'אל תפחד לנסות שוב!',
  ],
  success: [
    'יופי! המשך כך!',
    'מצוין! אתה בדרך הנכונה!',
    'כל הכבוד!',
  ],
};

/**
 * World transition messages (entering new world).
 */
export const WORLD_TRANSITION_TEMPLATES: Record<WorldId, string[]> = {
  training: [
    'ברוך הבא לשדות האימון!',
    'כאן מתחיל המסע שלך!',
  ],
  factory: [
    'המפעל המסתורי מחכה לך!',
    'המכונות פועלות... מוכן?',
  ],
  lab: [
    'המעבדה המדעית נפתחת!',
    'ניסויים מתמטיים מחכים לך!',
  ],
  city: [
    'העיר הגדולה לפניך!',
    'הרחובות מלאים באתגרים!',
  ],
  core: [
    'הליבה - האתגר האחרון!',
    'רק הטובים מגיעים לכאן!',
  ],
};

/**
 * Get random template from array.
 */
function getRandomTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Get fallback boss intro for world.
 */
export function getFallbackBossIntro(worldId: WorldId): string {
  return getRandomTemplate(BOSS_INTRO_TEMPLATES[worldId] || BOSS_INTRO_TEMPLATES.training);
}

/**
 * Get fallback boss defeat message for world.
 */
export function getFallbackBossDefeat(worldId: WorldId): string {
  return getRandomTemplate(BOSS_DEFEAT_TEMPLATES[worldId] || BOSS_DEFEAT_TEMPLATES.training);
}

/**
 * Get fallback victory message.
 */
export function getFallbackVictory(): string {
  return getRandomTemplate(VICTORY_TEMPLATES);
}

/**
 * Get fallback encouragement message.
 */
export function getFallbackEncouragement(outcome: RecentOutcome): string {
  return getRandomTemplate(ENCOURAGEMENT_TEMPLATES[outcome] || ENCOURAGEMENT_TEMPLATES.struggle);
}

/**
 * Get fallback world transition message.
 */
export function getFallbackWorldTransition(worldId: WorldId): string {
  return getRandomTemplate(WORLD_TRANSITION_TEMPLATES[worldId] || WORLD_TRANSITION_TEMPLATES.training);
}

/**
 * Get any fallback narrative by type.
 */
export function getFallbackNarrative(
  type: NarrativeType,
  worldId: WorldId,
  outcome?: RecentOutcome
): string {
  switch (type) {
    case 'boss_intro':
      return getFallbackBossIntro(worldId);
    case 'boss_defeat':
      return getFallbackBossDefeat(worldId);
    case 'player_victory':
      return getFallbackVictory();
    case 'encouragement':
      return getFallbackEncouragement(outcome || 'struggle');
    case 'world_transition':
      return getFallbackWorldTransition(worldId);
    default:
      return getFallbackVictory();
  }
}

/**
 * AI Prompt Templates
 *
 * Hebrew prompts for Groq API.
 * IMPORTANT: Maintains consistency with "The Fractured Grid" story.
 *
 * Game Story: The Grid was once stable. Five Masters went to extremes.
 * Player is a Code Runner journeying to restore The Grid.
 *
 * Boss Personalities:
 * - Training Master (אדון האימונים): Calm, tests understanding, guardian of basics
 * - Factory Foreman (מנהל המפעל): Demands precision, no room for error, strict
 * - Lab Director (מנהל המעבדה): Scientific, pushes boundaries, curious
 * - City Mayor (ראש העיר): Manages systems, authoritative, everything connected
 * - The Architect (האדריכל): Creator of The Grid, philosophical, final boss
 */

import type { AIContext, ChatMessage, NarrativeType } from '../types';

/**
 * Boss personality descriptions for consistent voice.
 */
const BOSS_PERSONALITIES: Record<string, string> = {
  training: `אדון האימונים - שומר היסודות.
אישיות: רגוע, סבלני, בוחן הבנה לא מהירות.
סגנון דיבור: מעודד אבל רציני. משפטים קצרים וברורים.
דוגמה: "הראה לי שאתה מבין את היסודות. רק אז תוכל להתקדם."`,

  factory: `מנהל המפעל - אדון הדיוק.
אישיות: קפדן, דורש דיוק מוחלט, אין מקום לטעויות.
סגנון דיבור: ישיר, מכני, מדבר על מערכות וייצור.
דוגמה: "במפעל שלי, דיוק זה הכל. טעות אחת עוצרת את הקו."`,

  lab: `מנהל המעבדה - אדון הניסויים.
אישיות: מדעי, סקרן, דוחף גבולות, בוחן תיאוריות.
סגנון דיבור: אינטלקטואלי, מדבר על משתנים ומורכבות.
דוגמה: "יותר משתנים. יותר אפשרויות. אתה יכול להתמודד עם המורכבות?"`,

  city: `ראש העיר - אדון המערכות.
אישיות: סמכותי, מנהל מערכות מחוברות, הכל משפיע על הכל.
סגנון דיבור: מדבר על העיר, מיליונים תלויים בו, לחץ.
דוגמה: "העיר לעולם לא ישנה. גם החישובים שלה לא. עמוד בקצב."`,

  core: `האדריכל - יוצר ה־Grid.
אישיות: פילוסופי, יצר את הכל ואיבד שליטה, המבחן האחרון.
סגנון דיבור: עמוק, מדבר על בנייה ושיקום, דרמטי.
דוגמה: "בניתי את העולם הזה עם מספרים. בוא נראה אם אתה יכול לבנות אותו מחדש."`,
};

/**
 * System message for all narratives.
 * Sets the game context, tone and constraints.
 */
function getSystemMessage(worldId: string): string {
  const bossPersonality = BOSS_PERSONALITIES[worldId] || BOSS_PERSONALITIES.training;

  return `אתה כותב דיאלוגים עבור המשחק "ה־Grid השבור" - משחק מתמטיקה לילדים.

רקע המשחק:
ה־Grid היה פעם יציב. חמישה אדונים - אלגוריתמים ששמרו על הסדר - הלכו לקיצוניות.
השחקן הוא Code Runner שמסע דרך חמישה עולמות כדי לשחזר את ה־Grid.

הבוס הנוכחי:
${bossPersonality}

כללים חשובים:
- כתוב בעברית תקנית וברורה
- שמור על אישיות הבוס - תהיה עקבי עם הסגנון שלו
- המשפטים קצרים (עד 20 מילים)
- הטון מתאים לילדים - מאיים אבל לא מפחיד באמת
- אל תזכיר מספרים ספציפיים או תרגילים
- אל תזכיר פתרונות או קושי
- התייחס לסיפור ה־Grid והקוד`;
}

/**
 * Build boss introduction prompt.
 */
export function buildBossIntroPrompt(ctx: AIContext): ChatMessage[] {
  return [
    { role: 'system', content: getSystemMessage(ctx.currentWorld) },
    {
      role: 'user',
      content: `הילד נכנס לקרב בוס בעולם "${ctx.worldNameHe}".
שם הבוס: ${ctx.bossNameHe}

כתוב משפט אחד קצר (עד 20 מילים) שהבוס אומר כשהוא מופיע.
המשפט צריך:
- להתאים לאישיות הספציפית של הבוס הזה
- להיות מאיים אבל לא מפחיד (זה משחק לילדים)
- להתייחס לעולם או ל־Grid

אל תזכיר מספרים או תרגילים. רק משפט אחד.`,
    },
  ];
}

/**
 * Build boss defeat prompt (player wins).
 */
export function buildBossDefeatPrompt(ctx: AIContext): ChatMessage[] {
  return [
    { role: 'system', content: getSystemMessage(ctx.currentWorld) },
    {
      role: 'user',
      content: `הילד ניצח את הבוס "${ctx.bossNameHe}" בעולם "${ctx.worldNameHe}".

כתוב משפט אחד קצר (עד 20 מילים) שהבוס אומר כשהוא מובס.
המשפט צריך:
- להתאים לאישיות הספציפית של הבוס הזה
- להראות הפתעה והכרה בכישרון הילד
- להתייחס לשחרור או תיקון ה־Grid

דוגמאות לסגנון (אבל תכתוב משהו חדש):
- אדון האימונים: "למדת היטב. הדרך קדימה פתוחה."
- מנהל המפעל: "החישובים שלך מושלמים. המפעל פועל שוב כשורה."
- האדריכל: "ה־Grid... הוא שלם שוב. אתה ה־Code Runner האמיתי."

אל תזכיר מספרים או תרגילים. רק משפט אחד.`,
    },
  ];
}

/**
 * Build player victory prompt (world completion).
 */
export function buildVictoryPrompt(ctx: AIContext): ChatMessage[] {
  return [
    { role: 'system', content: getSystemMessage(ctx.currentWorld) },
    {
      role: 'user',
      content: `הילד סיים את העולם "${ctx.worldNameHe}" והביס את הבוס!

כתוב משפט חגיגי קצר (עד 15 מילים) על ההצלחה.
המשפט צריך:
- להיות מעודד ומרגש
- להתייחס לעולם הספציפי או ל־Grid
- להתאים למשחק לילדים

דוגמאות לסגנון:
- "האימון הושלם. העולם הראשון שוחזר."
- "המעבדה מתייצבת. המורכבות נשלטת."
- "ה־Grid פועם בחיים מחודשים."

רק משפט אחד.`,
    },
  ];
}

/**
 * Build encouragement prompt (when struggling).
 */
export function buildEncouragementPrompt(ctx: AIContext): ChatMessage[] {
  const outcomeText =
    ctx.recentOutcome === 'fail'
      ? 'הילד לא הצליח בפעם האחרונה'
      : 'הילד מתקשה קצת';

  return [
    { role: 'system', content: getSystemMessage(ctx.currentWorld) },
    {
      role: 'user',
      content: `${outcomeText} בעולם "${ctx.worldNameHe}".

כתוב משפט עידוד קצר (עד 15 מילים) בסגנון המשחק.
המשפט צריך להיות:
- מעודד ותומך
- מתאים לאווירת ה־Grid
- בעברית פשוטה

דוגמאות לסגנון:
- "כל Code Runner נופל לפעמים. תקום ותנסה שוב."
- "ה־Grid מאמין בך. נסה שוב."
- "טעויות הן חלק מהמסע. המשך קדימה."

אל תזכיר מספרים או פתרונות. רק משפט אחד.`,
    },
  ];
}

/**
 * Build world transition prompt (entering new world).
 */
export function buildWorldTransitionPrompt(ctx: AIContext): ChatMessage[] {
  return [
    { role: 'system', content: getSystemMessage(ctx.currentWorld) },
    {
      role: 'user',
      content: `הילד נכנס לעולם חדש: "${ctx.worldNameHe}".

כתוב משפט קצר (עד 20 מילים) שמברך אותו לעולם החדש.
המשפט צריך:
- ליצור התרגשות וסקרנות
- להתאים לאווירת העולם הספציפי
- להתייחס למסע ב־Grid

דוגמאות לסגנון:
- "עולם נטען: מגרש האימונים. כאן כל Code Runner מתחיל."
- "עולם נטען: המפעל. כאן דיוק הוא חוק."
- "עולם נטען: הליבה. הלב של ה־Grid."

רק משפט אחד.`,
    },
  ];
}

/**
 * Get prompt builder for narrative type.
 */
export function getPromptBuilder(
  type: NarrativeType
): (ctx: AIContext) => ChatMessage[] {
  switch (type) {
    case 'boss_intro':
      return buildBossIntroPrompt;
    case 'boss_defeat':
      return buildBossDefeatPrompt;
    case 'player_victory':
      return buildVictoryPrompt;
    case 'encouragement':
      return buildEncouragementPrompt;
    case 'world_transition':
      return buildWorldTransitionPrompt;
    default:
      return buildVictoryPrompt;
  }
}

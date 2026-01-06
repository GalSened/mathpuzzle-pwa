// Hebrew translations for MathPuzzle
export const he = {
  // App
  appName: 'חידות מתמטיקה',

  // Onboarding
  welcome: 'ברוכים הבאים!',
  welcomeSubtitle: 'בואו נכיר אתכם',
  enterName: 'איך קוראים לך?',
  namePlaceholder: 'הכנס את שמך',
  selectGender: 'אני...',
  boy: 'בן',
  girl: 'בת',
  startPlaying: 'בואו נתחיל!',

  // Tutorial
  tutorialTitle: 'איך משחקים?',
  tutorialStep1Title: 'בחרו מספר',
  tutorialStep1Desc: 'לחצו על אחד המספרים כדי לבחור אותו',
  tutorialStep2Title: 'בחרו פעולה',
  tutorialStep2Desc: 'בחרו חיבור, חיסור, כפל או חילוק',
  tutorialStep3Title: 'בחרו מספר נוסף',
  tutorialStep3Desc: 'לחצו על מספר נוסף לביצוע החישוב',
  tutorialStep4Title: 'הגיעו למטרה!',
  tutorialStep4Desc: 'המשיכו עד שתגיעו למספר המטרה',
  tutorialExample: 'דוגמה',
  tutorialExampleDesc: 'המטרה היא 24. יש לנו: 3, 4, 2',
  tutorialExampleStep1: '3 × 4 = 12',
  tutorialExampleStep2: '12 × 2 = 24',
  tutorialExampleSuccess: 'הגענו ל-24!',
  gotIt: 'הבנתי!',
  skipTutorial: 'דלג על ההדרכה',

  // Game
  target: 'מטרה',
  selectNumber: 'בחרו מספר...',
  currentResult: 'תוצאה נוכחית:',
  perfect: 'מושלם!',

  // Operators
  add: 'חיבור',
  subtract: 'חיסור',
  multiply: 'כפל',
  divide: 'חילוק',

  // Buttons
  reset: 'התחל מחדש',
  hint: 'רמז',
  check: 'בדוק',
  skip: 'דלג על החידה',

  // Difficulty
  difficulty: 'רמת קושי',
  tutorial: 'הדרכה',
  easy: 'קל',
  medium: 'בינוני',
  hard: 'קשה',
  expert: 'מומחה',

  // Stats
  solved: 'פתרתם',
  avgTime: 'זמן ממוצע:',
  bestStreak: 'הרצף הטוב ביותר:',
  streak: 'רצף',

  // Feedback
  invalidOperation: 'פעולה לא חוקית!',
  tooHigh: 'גבוה מדי!',
  tooLow: 'נמוך מדי!',

  // Hints (by level)
  hints: {
    level1: {
      higher: (name: string, gender: 'boy' | 'girl') =>
        gender === 'girl' ? `${name}, את צריכה מספר גבוה יותר` : `${name}, אתה צריך מספר גבוה יותר`,
      lower: (name: string, gender: 'boy' | 'girl') =>
        gender === 'girl' ? `${name}, את צריכה מספר נמוך יותר` : `${name}, אתה צריך מספר נמוך יותר`,
      onTrack: (name: string, gender: 'boy' | 'girl') =>
        gender === 'girl' ? `${name}, את בכיוון הנכון!` : `${name}, אתה בכיוון הנכון!`,
    },
    level2: {
      useMultiplication: 'נסו להשתמש בכפל',
      useDivision: 'נסו להשתמש בחילוק',
      useAddition: 'נסו להשתמש בחיבור',
      useSubtraction: 'נסו להשתמש בחיסור',
      orderMatters: 'סדר הפעולות חשוב!',
    },
    level3: {
      startWith: (num: number) => `נסו להתחיל עם ${num}`,
      combine: (a: number, b: number) => `נסו לשלב את ${a} ו-${b}`,
    },
    level4: {
      firstStep: (notation: string) => `הצעד הראשון: ${notation}`,
      nextStep: (notation: string) => `הצעד הבא: ${notation}`,
    },
  },

  // Encouragement (gendered)
  encouragement: {
    tryAgain: (name: string, gender: 'boy' | 'girl') =>
      gender === 'girl' ? `${name}, נסי שוב!` : `${name}, נסה שוב!`,
    almostThere: (name: string, gender: 'boy' | 'girl') =>
      gender === 'girl' ? `${name}, כמעט הגעת!` : `${name}, כמעט הגעת!`,
    greatJob: (name: string, gender: 'boy' | 'girl') =>
      gender === 'girl' ? `כל הכבוד ${name}!` : `כל הכבוד ${name}!`,
    keepGoing: (name: string, gender: 'boy' | 'girl') =>
      gender === 'girl' ? `${name}, המשיכי כך!` : `${name}, המשך כך!`,
    brilliant: (name: string, gender: 'boy' | 'girl') =>
      gender === 'girl' ? `מבריקה ${name}!` : `מבריק ${name}!`,
  },
};

export type Translations = typeof he;

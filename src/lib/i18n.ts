// Hebrew translations for MathPuzzle - THE FRACTURED GRID
export const he = {
  // App
  appName: 'חידות מתמטיקה',

  // Core Narrative (The Fractured Grid)
  codeRunner: 'Code Runner',
  theGrid: 'ה־Grid',
  theFracture: 'השבר',
  gridEcho: 'Grid Echo',
  upgradeStation: 'תחנת שדרוג',
  modules: 'מודולים',

  // Onboarding
  welcome: 'ברוכים הבאים!',
  welcomeSubtitle: 'לפני שאתה נכנס ל־Grid, אנחנו צריכים לדעת מי אתה.',
  enterName: 'איך קוראים לך?',
  namePlaceholder: 'הכנס את שמך',
  selectGender: 'אני...',
  boy: 'בן',
  girl: 'בת',
  startPlaying: 'הכנס ל־Grid',
  gridWaiting: (name: string) => `ברוך הבא, ${name}. ה־Grid מחכה.`,

  // Tutorial
  tutorialTitle: 'איך משחקים?',
  tutorialStep1Title: 'בחרו מספר',
  tutorialStep1Desc: 'לחצו על אחד המספרים כדי לבחור אותו',
  tutorialStep2Title: 'בחרו פעולה',
  tutorialStep2Desc: 'בחרו חיבור, חיסור, כפל או חילוק',
  tutorialStep3Title: 'בחרו מספר נוסף',
  tutorialStep3Desc: 'לחצו על מספר נוסף לביצוע החישוב',
  tutorialStep4Title: 'הגיעו למטרה!',
  tutorialStep4Desc: 'ברגע שהתוצאה שווה למטרה - ניצחתם!',
  tutorialTip: 'טיפ: ברוב החידות חובה להשתמש בכל המספרים!',
  tutorialExample: 'דוגמה',
  tutorialExampleDesc: 'המטרה היא 10. יש לנו: 3, 5, 2',
  tutorialExampleStep1: '3 + 5 = 8',
  tutorialExampleStep2: '8 + 2 = 10',
  tutorialExampleSuccess: 'הגענו ל-10!',
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

  // Operator Guide - New operator introductions
  operatorGuide: {
    newAbility: 'יכולת חדשה!',
    unlocked: 'נפתח!',
    letsLearn: 'בואו נלמד איך להשתמש',
    gotIt: 'הבנתי!',
    tryIt: 'בוא ננסה!',

    // Operator introductions
    subtract: {
      title: 'חיסור',
      symbol: '−',
      description: 'עכשיו אפשר להקטין מספרים! חיסור עוזר להגיע למטרות נמוכות יותר.',
      example: 'דוגמה: 10 − 3 = 7',
      tip: 'טיפ: סדר חשוב! 10 − 3 זה לא אותו דבר כמו 3 − 10',
    },
    multiply: {
      title: 'כפל',
      symbol: '×',
      description: 'כפל מכפיל מספרים! זה דרך מהירה להגיע למספרים גדולים.',
      example: 'דוגמה: 4 × 3 = 12',
      tip: 'טיפ: כפל ב-2 זה כמו לחבר מספר לעצמו',
    },
    divide: {
      title: 'חילוק',
      symbol: '÷',
      description: 'חילוק מפצל מספרים! מושלם להגיע למספרים קטנים יותר.',
      example: 'דוגמה: 12 ÷ 3 = 4',
      tip: 'טיפ: אפשר לחלק רק אם התוצאה יוצאת מספר שלם',
    },
  },

  // Zone unlock messages
  zoneUnlock: {
    newZone: 'אזור חדש נפתח!',
    welcome: 'ברוך הבא ל',
    newOperators: 'פעולות חדשות זמינות:',
    goodLuck: 'בהצלחה!',
  },

  // Difficulty change notifications
  difficultyChange: {
    levelUp: 'הרמה עלתה!',
    levelDown: 'הרמה ירדה',
    harder: 'החידות יהיו מאתגרות יותר',
    easier: 'החידות יהיו קלות יותר',
    newFeature: 'תכונה חדשה:',
    parentheses: 'סדר פעולות חשוב עכשיו! השתמשו בסוגריים',
    moreNumbers: 'עכשיו יש 4 מספרים לשחק איתם',
  },

  // Game rules - accurate explanations for PuzzleBoard
  gameRules: {
    allOperatorsAvailable: 'כל הפעולות זמינות: + − × ÷',
    mustUseAllNumbers: 'חובה להשתמש בכל המספרים',
    canSkipNumbers: 'אפשר לדלג על מספרים',
    numbersCount: (count: number) => `${count} מספרים`,
    reachTarget: 'הגיעו למספר המטרה',
  },

  // Level progression - number counts
  levelProgression: {
    title: 'התקדמות ברמות',
    easyLevels: 'רמות 1-5: 3 מספרים',
    mediumLevels: 'רמות 6+: 4 מספרים',
    bossLevels: 'קרב בוס: 5 מספרים',
    tutorialNote: 'ככל שתתקדמו, יהיו יותר מספרים לשחק איתם!',
  },

  // Tutorial step for level progression
  tutorialProgressionTitle: 'התקדמות',
  tutorialProgressionDesc: 'ככל שמתקדמים, מקבלים יותר מספרים:\n• רמות 1-5: 3 מספרים\n• רמות 6+: 4 מספרים\n• בוסים: 5 מספרים',
};

export type Translations = typeof he;

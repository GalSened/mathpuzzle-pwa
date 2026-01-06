'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { useProgressStore } from '@/store/progressStore';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { getZoneById, ZONES, getBossInfo } from '@/engine/story';
import { BossAnnouncement } from '@/components/game/BossAnnouncement';
import { BossVictory } from '@/components/game/BossVictory';
import { ZoneBanner, ZoneCard } from '@/components/ui/ZoneBackground';
import { ZoneMasteryModal } from '@/components/ui/ZoneMasteryModal';
import { BottomNav, NavTab, TopBar } from '@/components/navigation';
import { ShopPage, InventoryView } from '@/components/shop';
import { LevelUpModal } from '@/components/ui/CoinDisplay';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import { PuzzleBoard } from '@/components/game/PuzzleBoard';
import { OperatorGuide, ZoneIntro } from '@/components/onboarding/OperatorGuide';
import type { Operator, OperatorSkill, ZoneProgressV2 } from '@/engine/types';

interface HomeScreenProps {
  initialTab?: NavTab;
}

export function HomeScreen({ initialTab = 'home' }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<NavTab>(initialTab);

  const level = usePlayerStore((s) => s.level);
  const dailyStreak = usePlayerStore((s) => s.dailyStreak);
  const skill = usePlayerStore((s) => s.skill);
  const totalPuzzlesSolved = usePlayerStore((s) => s.totalPuzzlesSolved);
  const pendingLevelUp = usePlayerStore((s) => s.pendingLevelUp);
  const clearPendingLevelUp = usePlayerStore((s) => s.clearPendingLevelUp);

  const currentZoneId = useProgressStore((s) => s.currentZoneId);
  const unlockedZones = useProgressStore((s) => s.unlockedZones);
  const setCurrentZone = useProgressStore((s) => s.setCurrentZone);
  const checkZoneUnlocks = useProgressStore((s) => s.checkZoneUnlocks);

  // V2 progress tracking
  const zoneProgressV2 = useProgressStore((s) => s.zoneProgressV2);
  const initializeProgressV2 = useProgressStore((s) => s.initializeProgressV2);
  const progressVersion = useProgressStore((s) => s.progressVersion);
  const migrateFromV1 = useProgressStore((s) => s.migrateFromV1);

  const currentZone = getZoneById(currentZoneId);

  // Initialize V2 progress on mount (or migrate from V1)
  useEffect(() => {
    if (progressVersion === 1) {
      // Migrate existing V1 data to V2
      migrateFromV1();
    } else if (Object.keys(zoneProgressV2).length === 0) {
      // First time user - initialize V2
      initializeProgressV2();
    }
  }, [progressVersion, zoneProgressV2, migrateFromV1, initializeProgressV2]);

  // Check for zone unlocks when level changes (V1 compatibility)
  useEffect(() => {
    checkZoneUnlocks();
  }, [level, checkZoneUnlocks]);

  const handleZoneSelect = (zoneId: string) => {
    setCurrentZone(zoneId);
    useGameStore.getState().setZone(zoneId);
  };

  const handleStartGame = (zoneId?: string) => {
    if (zoneId) {
      handleZoneSelect(zoneId);
    }
    setActiveTab('play');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeContent
            currentZone={currentZone}
            unlockedZones={unlockedZones}
            onStartGame={handleStartGame}
            dailyStreak={dailyStreak}
            skill={skill}
            totalPuzzlesSolved={totalPuzzlesSolved}
            zoneProgressV2={zoneProgressV2}
          />
        );
      case 'play':
        return <PlayContent currentZoneId={currentZoneId} />;
      case 'shop':
        return <ShopPage />;
      case 'inventory':
        return <InventoryView />;
      case 'profile':
        return <ProfileContent />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pb-20">
      <TopBar showStats={activeTab !== 'play'} />

      <main className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Level Up Modal */}
      <AnimatePresence>
        {pendingLevelUp !== null && (
          <LevelUpModal
            newLevel={pendingLevelUp}
            onClose={clearPendingLevelUp}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Home tab content
interface HomeContentProps {
  currentZone: ReturnType<typeof getZoneById>;
  unlockedZones: string[];
  onStartGame: (zoneId?: string) => void;
  dailyStreak: number;
  skill: OperatorSkill;
  totalPuzzlesSolved: number;
  zoneProgressV2: Record<string, ZoneProgressV2>;
}

function HomeContent({
  currentZone,
  unlockedZones,
  onStartGame,
  dailyStreak,
  skill,
  totalPuzzlesSolved,
  zoneProgressV2,
}: HomeContentProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Current Zone Banner */}
      {currentZone && (
        <div className="mb-4">
          <h2 className="text-gray-400 text-sm mb-2">אזור נוכחי</h2>
          <ZoneBanner zone={currentZone} />
          <motion.button
            className="w-full mt-3 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStartGame()}
          >
            <span>🎮</span>
            <span>שחק עכשיו</span>
          </motion.button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="🔥"
          value={dailyStreak}
          label="רצף יומי"
          color="orange"
        />
        <StatCard
          icon="🧩"
          value={totalPuzzlesSolved}
          label="חידות נפתרו"
          color="green"
        />
      </div>

      {/* Skill Overview */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <span>📊</span>
          כישורים
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <SkillBar op="+" value={skill['+']} color="green" />
          <SkillBar op="-" value={skill['-']} color="blue" />
          <SkillBar op="×" value={skill['×']} color="orange" />
          <SkillBar op="÷" value={skill['÷']} color="purple" />
        </div>
      </div>

      {/* Zone Selection */}
      <div>
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <span>🗺️</span>
          אזורים
        </h3>
        <div className="space-y-3">
          {ZONES.map((zone) => {
            // V2 progress check - fall back to V1 for backwards compatibility
            const v2Progress = zoneProgressV2[zone.id];
            const isUnlockedV2 = v2Progress?.status !== 'locked';
            const isUnlocked = isUnlockedV2 || unlockedZones.includes(zone.id);
            const isCurrent = currentZone?.id === zone.id;

            return (
              <ZoneCard
                key={zone.id}
                zone={zone}
                isUnlocked={isUnlocked}
                isCurrent={isCurrent}
                onClick={() => isUnlocked && onStartGame(zone.id)}
                progress={v2Progress}
                skillLevels={skill}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Play tab content
function PlayContent({ currentZoneId }: { currentZoneId: string }) {
  const zone = getZoneById(currentZoneId);
  const currentPuzzle = useGameStore((s) => s.currentPuzzle);
  const puzzleStatus = useGameStore((s) => s.puzzleStatus);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const startNewPuzzle = useGameStore((s) => s.startNewPuzzle);
  const recordResult = useGameStore((s) => s.recordResult);
  const skipPuzzle = useGameStore((s) => s.skipPuzzle);

  // Boss system state
  const puzzlesSinceLastBoss = useProgressStore((s) => s.puzzlesSinceLastBoss);
  const defeatBoss = useProgressStore((s) => s.defeatBoss);
  const recordPuzzleSolved = useProgressStore((s) => s.recordPuzzleSolved);

  // V2 progress tracking
  const recordPuzzleSolvedV2 = useProgressStore((s) => s.recordPuzzleSolvedV2);
  const defeatBossV2 = useProgressStore((s) => s.defeatBossV2);
  const checkZoneMastery = useProgressStore((s) => s.checkZoneMastery);
  const checkAndUnlockNextZone = useProgressStore((s) => s.checkAndUnlockNextZone);

  const addXP = usePlayerStore((s) => s.addXP);
  const addCoins = usePlayerStore((s) => s.addCoins);

  // Guidance system state
  const seenZoneIntros = useUserStore((s) => s.seenZoneIntros);
  const seenOperatorIntros = useUserStore((s) => s.seenOperatorIntros);
  const markZoneIntroSeen = useUserStore((s) => s.markZoneIntroSeen);
  const markOperatorIntroSeen = useUserStore((s) => s.markOperatorIntroSeen);

  const [showZoneIntro, setShowZoneIntro] = useState(false);
  const [pendingOperatorIntros, setPendingOperatorIntros] = useState<Operator[]>([]);
  const [currentOperatorIntro, setCurrentOperatorIntro] = useState<Operator | null>(null);
  const [guidanceComplete, setGuidanceComplete] = useState(false);

  // Boss encounter states
  const [showBossAnnouncement, setShowBossAnnouncement] = useState(false);
  const [showBossVictory, setShowBossVictory] = useState(false);
  const [isBossMode, setIsBossMode] = useState(false);
  const [bossRewards, setBossRewards] = useState({ coins: 0, xp: 0 });

  // Zone mastery state
  const [showZoneMastery, setShowZoneMastery] = useState(false);

  // Check if next puzzle should be a boss
  const checkAndStartBoss = () => {
    if (zone && puzzlesSinceLastBoss >= zone.bossEvery - 1) {
      setShowBossAnnouncement(true);
      return true;
    }
    return false;
  };

  // Check for unseen zone/operator introductions when zone changes
  useEffect(() => {
    if (!zone) return;

    // Check if this zone needs an intro
    const needsZoneIntro = !seenZoneIntros.includes(currentZoneId);

    // Check for unseen operators in this zone
    const zoneOps = zone.ops as Operator[];
    const unseenOps = zoneOps.filter(op => !seenOperatorIntros.includes(op));

    if (needsZoneIntro && unseenOps.length > 0) {
      // Show zone intro first, then operator intros
      setShowZoneIntro(true);
      setPendingOperatorIntros(unseenOps);
      setGuidanceComplete(false);
    } else if (unseenOps.length > 0) {
      // Just show operator intros
      setPendingOperatorIntros(unseenOps);
      setCurrentOperatorIntro(unseenOps[0]);
      setGuidanceComplete(false);
    } else {
      // No guidance needed
      setGuidanceComplete(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentZoneId]);

  // Handle zone intro completion
  const handleZoneIntroComplete = () => {
    markZoneIntroSeen(currentZoneId);
    setShowZoneIntro(false);

    // Start showing operator intros if any
    if (pendingOperatorIntros.length > 0) {
      setCurrentOperatorIntro(pendingOperatorIntros[0]);
    } else {
      setGuidanceComplete(true);
    }
  };

  // Handle operator intro completion
  const handleOperatorIntroComplete = () => {
    if (currentOperatorIntro) {
      markOperatorIntroSeen(currentOperatorIntro);

      // Move to next operator intro or complete guidance
      const currentIndex = pendingOperatorIntros.indexOf(currentOperatorIntro);
      const nextOperator = pendingOperatorIntros[currentIndex + 1];

      if (nextOperator) {
        setCurrentOperatorIntro(nextOperator);
      } else {
        setCurrentOperatorIntro(null);
        setGuidanceComplete(true);
      }
    }
  };

  // Start a puzzle when entering play mode if none exists and guidance is complete
  // GUARD: Only start if puzzleStatus is 'idle' (not 'transitioning')
  useEffect(() => {
    if (puzzleStatus === 'idle' && !currentPuzzle && !showBossAnnouncement && !showBossVictory && guidanceComplete) {
      // Check if it's boss time
      if (!checkAndStartBoss()) {
        startNewPuzzle(undefined, currentZoneId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleStatus, currentPuzzle, currentZoneId, showBossAnnouncement, showBossVictory, guidanceComplete]);

  const handleBossStart = () => {
    setShowBossAnnouncement(false);
    setIsBossMode(true);
    // Start a boss puzzle (with boss difficulty modifier)
    startNewPuzzle(undefined, currentZoneId, true);
  };

  const handleSolve = (expression: import('@/engine/types').Expression, solvedPuzzleId: string) => {
    // Pass puzzleId to validate against stale results
    recordResult(expression, hintsUsed, solvedPuzzleId);
    recordPuzzleSolved(currentZoneId);

    // V2 progress tracking
    recordPuzzleSolvedV2(currentZoneId);

    if (isBossMode && zone) {
      // Boss defeated!
      const bossInfo = getBossInfo(zone);
      const coinReward = 100;
      const xpReward = 50 + bossInfo.difficulty * 20;

      defeatBoss(currentZoneId);
      defeatBossV2(currentZoneId); // V2 boss tracking
      addCoins(coinReward, 'boss');
      addXP(xpReward);

      setBossRewards({ coins: coinReward, xp: xpReward });
      setIsBossMode(false);
      setShowBossVictory(true);

      // Check for zone mastery after boss defeat
      const isMastered = checkZoneMastery(currentZoneId);
      if (isMastered) {
        // Delay mastery modal to show after boss victory
        setTimeout(() => {
          setShowZoneMastery(true);
          checkAndUnlockNextZone();
        }, 3000);
      }
    } else {
      // Normal puzzle solved - useEffect will auto-start next puzzle
      // when puzzleStatus changes to 'idle' (after recordResult clears puzzle)
      // Add delay via setTimeout to let victory animation play
      setTimeout(() => {
        // The useEffect will detect puzzleStatus === 'idle' and start next puzzle
        // We just need to trigger boss check here
        if (checkAndStartBoss()) {
          // Boss announcement will show - don't start puzzle
          return;
        }
        // Otherwise useEffect will handle starting next puzzle
      }, 1500);
    }
  };

  const handleBossVictoryContinue = () => {
    setShowBossVictory(false);
    // useEffect will auto-start next puzzle when puzzleStatus is 'idle'
    // startNewPuzzle guards against 'transitioning' state already
    setTimeout(() => startNewPuzzle(undefined, currentZoneId), 500);
  };

  const handleZoneMasteryContinue = () => {
    setShowZoneMastery(false);
    // Continue playing - next puzzle will start automatically
  };

  const handleSkip = () => {
    if (!isBossMode) {
      skipPuzzle();
      // useEffect will auto-start next puzzle when puzzleStatus becomes 'idle'
      // No need to call startNewPuzzle here - it would race with useEffect
    }
    // Can't skip boss puzzles
  };

  const bossInfo = zone ? getBossInfo(zone) : null;

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* Zone background overlay - use inline style for pointer-events to ensure it works */}
      {zone && (
        <div
          data-testid="zone-overlay-fix-v2"
          className={`absolute inset-0 bg-gradient-to-b ${zone.theme.background} opacity-20`}
          style={{ pointerEvents: 'none', zIndex: -1 }}
        />
      )}

      {/* Boss mode indicator */}
      {isBossMode && bossInfo && (
        <motion.div
          className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-red-900/80 px-4 py-2 rounded-full border border-red-500"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <span className="text-red-200 text-sm font-bold">
            ⚔️ קרב בוס: {bossInfo.nameHe}
          </span>
        </motion.div>
      )}

      {/* GUARD: Only render PuzzleBoard when puzzle is fully active */}
      {puzzleStatus === 'active' && currentPuzzle ? (
        <div className="relative z-10">
          <PuzzleBoard
            puzzle={currentPuzzle}
            onSolve={handleSolve}
            onSkip={isBossMode ? undefined : handleSkip}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <motion.div
            className="text-4xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            🎲
          </motion.div>
        </div>
      )}

      {/* Boss Announcement Modal */}
      <AnimatePresence>
        {showBossAnnouncement && zone && bossInfo && (
          <BossAnnouncement
            bossInfo={bossInfo}
            zone={zone}
            onStart={handleBossStart}
          />
        )}
      </AnimatePresence>

      {/* Boss Victory Modal */}
      <AnimatePresence>
        {showBossVictory && zone && bossInfo && (
          <BossVictory
            bossInfo={bossInfo}
            zone={zone}
            coinsEarned={bossRewards.coins}
            xpEarned={bossRewards.xp}
            onContinue={handleBossVictoryContinue}
          />
        )}
      </AnimatePresence>

      {/* Zone Introduction Modal */}
      <AnimatePresence>
        {showZoneIntro && zone && (
          <ZoneIntro
            zoneNameHe={zone.nameHe}
            zoneDescription={zone.descriptionHe}
            newOperators={pendingOperatorIntros}
            onContinue={handleZoneIntroComplete}
          />
        )}
      </AnimatePresence>

      {/* Operator Introduction Modal */}
      <AnimatePresence>
        {currentOperatorIntro && zone && (
          <OperatorGuide
            operator={currentOperatorIntro}
            zoneNameHe={zone.nameHe}
            onComplete={handleOperatorIntroComplete}
          />
        )}
      </AnimatePresence>

      {/* Zone Mastery Modal */}
      <AnimatePresence>
        {showZoneMastery && zone && (
          <ZoneMasteryModal
            zone={zone}
            onContinue={handleZoneMasteryContinue}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Profile tab content
function ProfileContent() {
  const level = usePlayerStore((s) => s.level);
  const totalPuzzlesSolved = usePlayerStore((s) => s.totalPuzzlesSolved);
  const dailyStreak = usePlayerStore((s) => s.dailyStreak);
  const skill = usePlayerStore((s) => s.skill);

  const stats = useGameStore((s) => s.stats);
  const bestStreak = stats.bestStreak;
  const resetPlayer = usePlayerStore((s) => s.resetPlayer);
  const resetStats = useGameStore((s) => s.resetStats);

  const handleReset = () => {
    if (confirm('האם אתה בטוח? כל ההתקדמות תאבד!')) {
      resetPlayer();
      resetStats();
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="text-center">
        <div className="mb-3 flex justify-center">
          <AvatarDisplay size="lg" showPet={true} showEffects={true} />
        </div>
        <h2 className="text-white text-2xl font-bold">שלב {level}</h2>
        <p className="text-gray-400">שחקן מתמטי</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="🧩" value={totalPuzzlesSolved} label="חידות נפתרו" color="blue" />
        <StatCard icon="🔥" value={dailyStreak} label="רצף נוכחי" color="orange" />
        <StatCard icon="🏆" value={bestStreak} label="רצף שיא" color="yellow" />
        <StatCard
          icon="⏱️"
          value={Math.round(stats.averageTime / 1000)}
          label="זמן ממוצע (ש')"
          color="green"
        />
      </div>

      {/* Detailed Skills */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="text-white font-bold mb-4">כישורים מפורטים</h3>
        <div className="space-y-3">
          <SkillRow op="+" label="חיבור" value={skill['+']} color="green" />
          <SkillRow op="-" label="חיסור" value={skill['-']} color="blue" />
          <SkillRow op="×" label="כפל" value={skill['×']} color="orange" />
          <SkillRow op="÷" label="חילוק" value={skill['÷']} color="purple" />
        </div>
      </div>

      {/* Reset Button */}
      <motion.button
        className="w-full py-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 font-medium"
        whileTap={{ scale: 0.98 }}
        onClick={handleReset}
      >
        איפוס התקדמות
      </motion.button>
    </div>
  );
}

// Helper Components
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  color: 'orange' | 'green' | 'blue' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    orange: 'from-orange-900/50 to-orange-800/30 border-orange-500/50',
    green: 'from-green-900/50 to-green-800/30 border-green-500/50',
    blue: 'from-blue-900/50 to-blue-800/30 border-blue-500/50',
    yellow: 'from-yellow-900/50 to-yellow-800/30 border-yellow-500/50',
    purple: 'from-purple-900/50 to-purple-800/30 border-purple-500/50',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-3 border`}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-white font-bold text-xl">{value}</div>
          <div className="text-gray-400 text-xs">{label}</div>
        </div>
      </div>
    </div>
  );
}

function SkillBar({
  op,
  value,
  color,
}: {
  op: string;
  value: number;
  color: 'green' | 'blue' | 'orange' | 'purple';
}) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="text-center">
      <div className="text-lg mb-1">{op}</div>
      <div className="h-16 bg-gray-700 rounded-full overflow-hidden relative">
        <motion.div
          className={`absolute bottom-0 w-full ${colorClasses[color]}`}
          initial={{ height: 0 }}
          animate={{ height: `${value * 100}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">{Math.round(value * 100)}%</div>
    </div>
  );
}

function SkillRow({
  op,
  label,
  value,
  color,
}: {
  op: string;
  label: string;
  value: number;
  color: 'green' | 'blue' | 'orange' | 'purple';
}) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-8 text-center">{op}</span>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">{label}</span>
          <span className="text-white font-medium">{Math.round(value * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${colorClasses[color]}`}
            initial={{ width: 0 }}
            animate={{ width: `${value * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}

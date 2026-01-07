'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import {
  useProgressStore,
  useCurrentWorld,
  useCurrentLevel,
  useCurrentLevelProgress,
  useAllWorldsProgress,
  useWorldLevelsProgress,
  useIsBossLevel,
  useGlobalProgress,
} from '@/store/progressStore';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { WORLDS, getWorld, getLevel } from '@/engine/worlds';
import { BossAnnouncement } from '@/components/game/BossAnnouncement';
import { BossVictory } from '@/components/game/BossVictory';
import { BottomNav, NavTab, TopBar } from '@/components/navigation';
import { ShopPage, InventoryView } from '@/components/shop';
import { LevelUpModal } from '@/components/ui/CoinDisplay';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import { PuzzleBoard } from '@/components/game/PuzzleBoard';
import { OperatorGuide, ZoneIntro } from '@/components/onboarding/OperatorGuide';
import type { Operator, OperatorSkill, WorldId, WorldConfig } from '@/engine/types';
import { ALL_OPERATORS } from '@/engine/tiers';

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

  const currentWorld = useCurrentWorld();
  const currentLevelConfig = useCurrentLevel();
  const setCurrentWorld = useProgressStore((s) => s.setCurrentWorld);
  const setCurrentLevel = useProgressStore((s) => s.setCurrentLevel);
  const allWorldsProgress = useAllWorldsProgress();
  const globalProgress = useGlobalProgress();

  const handleWorldSelect = (worldId: WorldId) => {
    setCurrentWorld(worldId);
  };

  const handleLevelSelect = (levelNumber: number) => {
    setCurrentLevel(levelNumber);
  };

  const handleStartGame = (worldId?: WorldId) => {
    if (worldId) {
      handleWorldSelect(worldId);
    }
    setActiveTab('play');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeContent
            currentWorld={currentWorld}
            allWorlds={allWorldsProgress}
            onStartGame={handleStartGame}
            onWorldSelect={handleWorldSelect}
            onLevelSelect={handleLevelSelect}
            dailyStreak={dailyStreak}
            skill={skill}
            totalPuzzlesSolved={globalProgress.totalPuzzlesSolved}
          />
        );
      case 'play':
        return <PlayContent />;
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
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      <TopBar showStats={activeTab !== 'play'} />

      <main className="flex-1 overflow-hidden max-w-lg mx-auto w-full">
        <div className="h-full overflow-y-auto scrollable-area pb-20">
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
        </div>
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

// World progress type from useAllWorldsProgress
type WorldWithProgress = WorldConfig & {
  status: 'locked' | 'in_progress' | 'completed';
  completedLevels: number;
  totalLevels: number;
};

// Home tab content
interface HomeContentProps {
  currentWorld: WorldConfig;
  allWorlds: WorldWithProgress[];
  onStartGame: (worldId?: WorldId) => void;
  onWorldSelect: (worldId: WorldId) => void;
  onLevelSelect: (levelNumber: number) => void;
  dailyStreak: number;
  skill: OperatorSkill;
  totalPuzzlesSolved: number;
}

function HomeContent({
  currentWorld,
  allWorlds,
  onStartGame,
  onWorldSelect,
  onLevelSelect,
  dailyStreak,
  skill,
  totalPuzzlesSolved,
}: HomeContentProps) {
  const [selectedWorld, setSelectedWorld] = useState<WorldId | null>(null);
  const levelProgress = useCurrentLevelProgress();

  const handleWorldClick = (world: WorldWithProgress) => {
    if (world.status === 'locked') return;
    setSelectedWorld(world.id);
    onWorldSelect(world.id);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Current Level Banner */}
      {currentWorld && levelProgress && (
        <div className="mb-4">
          <h2 className="text-gray-400 text-sm mb-2">שלב נוכחי</h2>
          <div
            className={`rounded-xl p-4 bg-gradient-to-r ${currentWorld.theme.background} border border-white/20`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/70 text-sm">{currentWorld.nameHe}</div>
                <div className="text-white font-bold text-xl">
                  {levelProgress.nameHe}
                </div>
                <div className="text-white/60 text-sm mt-1">
                  שלב {levelProgress.levelNumber} / 30 • {levelProgress.isBoss ? 'בוס!' : `פאזל ${levelProgress.puzzlesSolved}/${levelProgress.puzzlesRequired}`}
                </div>
              </div>
              <div className="text-4xl">{currentWorld.theme.icon}</div>
            </div>
          </div>
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

      {/* Skill Overview - All operators always visible */}
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

      {/* World Selection */}
      <div>
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <span>🗺️</span>
          עולמות
        </h3>
        <div className="space-y-3">
          {allWorlds.map((world) => (
            <WorldCard
              key={world.id}
              world={world}
              isSelected={selectedWorld === world.id}
              onClick={() => handleWorldClick(world)}
            />
          ))}
        </div>
      </div>

      {/* Level Grid for selected world */}
      {selectedWorld && (
        <LevelGrid
          worldId={selectedWorld}
          onLevelSelect={(levelNum) => {
            onLevelSelect(levelNum);
            onStartGame();
          }}
        />
      )}
    </div>
  );
}

// World Card Component
function WorldCard({
  world,
  isSelected,
  onClick,
}: {
  world: WorldWithProgress;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isLocked = world.status === 'locked';
  const isCompleted = world.status === 'completed';

  return (
    <motion.button
      className={`w-full rounded-xl p-4 border-2 text-right transition-all ${
        isLocked
          ? 'bg-gray-800/50 border-gray-700 opacity-60 cursor-not-allowed'
          : isSelected
          ? `bg-gradient-to-r ${world.theme.background} border-white/50`
          : `bg-gradient-to-r ${world.theme.background} border-white/20 hover:border-white/40`
      }`}
      whileHover={!isLocked ? { scale: 1.01 } : undefined}
      whileTap={!isLocked ? { scale: 0.99 } : undefined}
      onClick={onClick}
      disabled={isLocked}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{world.theme.icon}</span>
            <div>
              <div className="text-white font-bold">{world.nameHe}</div>
              <div className="text-white/60 text-sm">{world.name}</div>
            </div>
          </div>
          {!isLocked && (
            <div className="mt-2">
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/50"
                  initial={{ width: 0 }}
                  animate={{ width: `${(world.completedLevels / world.totalLevels) * 100}%` }}
                />
              </div>
              <div className="text-white/50 text-xs mt-1">
                {world.completedLevels} / {world.totalLevels} שלבים
              </div>
            </div>
          )}
        </div>
        <div className="mr-3">
          {isLocked && <span className="text-3xl">🔒</span>}
          {isCompleted && <span className="text-3xl">🏆</span>}
        </div>
      </div>
    </motion.button>
  );
}

// Level Grid Component
function LevelGrid({
  worldId,
  onLevelSelect,
}: {
  worldId: WorldId;
  onLevelSelect: (levelNumber: number) => void;
}) {
  const levelsProgress = useWorldLevelsProgress(worldId);
  const world = getWorld(worldId);

  return (
    <div className="mt-4">
      <h4 className="text-white/70 text-sm mb-3">שלבים ב{world.nameHe}</h4>
      <div className="grid grid-cols-3 gap-2">
        {levelsProgress.map((level) => {
          const isLocked = level.status === 'locked';
          const isCompleted = level.status === 'completed';
          const isInProgress = level.status === 'in_progress';

          return (
            <motion.button
              key={level.level}
              className={`aspect-square rounded-xl p-2 flex flex-col items-center justify-center border-2 ${
                isLocked
                  ? 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
                  : isCompleted
                  ? 'bg-green-600/30 border-green-500'
                  : isInProgress
                  ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400/50'
                  : 'bg-gray-700/50 border-gray-600'
              }`}
              whileHover={!isLocked ? { scale: 1.05 } : undefined}
              whileTap={!isLocked ? { scale: 0.95 } : undefined}
              onClick={() => !isLocked && onLevelSelect(level.level)}
              disabled={isLocked}
            >
              {level.isBoss ? (
                <span className="text-2xl">{isCompleted ? '👑' : '⚔️'}</span>
              ) : isLocked ? (
                <span className="text-xl">🔒</span>
              ) : isCompleted ? (
                <span className="text-xl">✅</span>
              ) : (
                <span className="text-white font-bold">{level.worldLevel}</span>
              )}
              {!isLocked && !level.isBoss && (
                <div className="text-white/50 text-xs mt-1">
                  {isCompleted ? `${level.stars}⭐` : `${level.puzzlesSolved}/${level.puzzlesRequired}`}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Play tab content
function PlayContent() {
  const currentWorld = useCurrentWorld();
  const currentLevelConfig = useCurrentLevel();
  const levelProgress = useCurrentLevelProgress();
  const isBossLevel = useIsBossLevel();

  const currentPuzzle = useGameStore((s) => s.currentPuzzle);
  const puzzleStatus = useGameStore((s) => s.puzzleStatus);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const startNewPuzzle = useGameStore((s) => s.startNewPuzzle);
  const recordResult = useGameStore((s) => s.recordResult);
  const skipPuzzle = useGameStore((s) => s.skipPuzzle);

  const recordPuzzleSolved = useProgressStore((s) => s.recordPuzzleSolved);
  const completeLevel = useProgressStore((s) => s.completeLevel);
  const defeatBoss = useProgressStore((s) => s.defeatBoss);
  const currentLevel = useProgressStore((s) => s.currentLevel);

  const addXP = usePlayerStore((s) => s.addXP);
  const addCoins = usePlayerStore((s) => s.addCoins);

  // Guidance system state
  const seenZoneIntros = useUserStore((s) => s.seenZoneIntros);
  const seenOperatorIntros = useUserStore((s) => s.seenOperatorIntros);
  const markZoneIntroSeen = useUserStore((s) => s.markZoneIntroSeen);
  const markOperatorIntroSeen = useUserStore((s) => s.markOperatorIntroSeen);

  const [showWorldIntro, setShowWorldIntro] = useState(false);
  const [pendingOperatorIntros, setPendingOperatorIntros] = useState<Operator[]>([]);
  const [currentOperatorIntro, setCurrentOperatorIntro] = useState<Operator | null>(null);
  const [guidanceComplete, setGuidanceComplete] = useState(false);

  // Boss encounter states
  const [showBossAnnouncement, setShowBossAnnouncement] = useState(false);
  const [showBossVictory, setShowBossVictory] = useState(false);
  const [isBossMode, setIsBossMode] = useState(false);
  const [bossRewards, setBossRewards] = useState({ coins: 0, xp: 0 });

  // Check if this is a boss level and show announcement
  useEffect(() => {
    if (isBossLevel && !isBossMode && !showBossAnnouncement && !showBossVictory && guidanceComplete) {
      setShowBossAnnouncement(true);
    }
  }, [isBossLevel, isBossMode, showBossAnnouncement, showBossVictory, guidanceComplete]);

  // Check for unseen introductions when world changes
  useEffect(() => {
    if (!currentWorld) return;

    const worldKey = currentWorld.id;
    const needsWorldIntro = !seenZoneIntros.includes(worldKey);

    // All operators are available from start - check which ones the player hasn't seen
    const unseenOps = ALL_OPERATORS.filter(op => !seenOperatorIntros.includes(op));

    // Only show operator intros in first world
    if (needsWorldIntro && currentWorld.id === 'training' && unseenOps.length > 0) {
      setShowWorldIntro(true);
      setPendingOperatorIntros(unseenOps);
      setGuidanceComplete(false);
    } else if (needsWorldIntro) {
      setShowWorldIntro(true);
      setPendingOperatorIntros([]);
      setGuidanceComplete(false);
    } else {
      setGuidanceComplete(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorld?.id]);

  // Handle world intro completion
  const handleWorldIntroComplete = () => {
    markZoneIntroSeen(currentWorld.id);
    setShowWorldIntro(false);

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

  // Start a puzzle when entering play mode
  useEffect(() => {
    if (
      puzzleStatus === 'idle' &&
      !currentPuzzle &&
      !showBossAnnouncement &&
      !showBossVictory &&
      guidanceComplete &&
      !isBossLevel
    ) {
      startNewPuzzle(undefined, currentWorld.id, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzleStatus, currentPuzzle, showBossAnnouncement, showBossVictory, guidanceComplete, isBossLevel]);

  const handleBossStart = () => {
    setShowBossAnnouncement(false);
    setIsBossMode(true);
    startNewPuzzle(undefined, currentWorld.id, true);
  };

  const handleSolve = (expression: import('@/engine/types').Expression, solvedPuzzleId: string) => {
    recordResult(expression, hintsUsed, solvedPuzzleId);
    recordPuzzleSolved();

    if (isBossMode) {
      // Boss defeated!
      const coinReward = 100;
      const xpReward = 50 + currentLevelConfig.worldLevel * 20;

      defeatBoss();
      completeLevel();
      addCoins(coinReward, 'boss');
      addXP(xpReward);

      setBossRewards({ coins: coinReward, xp: xpReward });
      setIsBossMode(false);
      setShowBossVictory(true);
    } else {
      // Check if level is complete
      const progress = levelProgress;
      if (progress && progress.puzzlesSolved + 1 >= progress.puzzlesRequired) {
        completeLevel();
      }

      // Auto-start next puzzle after delay
      setTimeout(() => {
        if (puzzleStatus === 'idle') {
          startNewPuzzle(undefined, currentWorld.id, false);
        }
      }, 1500);
    }
  };

  const handleBossVictoryContinue = () => {
    setShowBossVictory(false);
    // Progress store already advanced to next level
    setTimeout(() => startNewPuzzle(undefined, currentWorld.id, false), 500);
  };

  const handleSkip = () => {
    if (!isBossMode) {
      skipPuzzle();
    }
  };

  // Create zone-like object for legacy components
  const zoneCompat = {
    id: currentWorld.id,
    name: currentWorld.name,
    nameHe: currentWorld.nameHe,
    ops: ALL_OPERATORS,
    theme: currentWorld.theme,
    descriptionHe: `עולם ${currentWorld.nameHe}`,
  };

  // Create boss info object
  const bossInfo = {
    name: currentWorld.bossName,
    nameHe: currentWorld.bossNameHe,
    difficulty: currentLevelConfig.worldLevel,
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* World background overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${currentWorld.theme.background} opacity-20`}
        style={{ pointerEvents: 'none', zIndex: -1 }}
      />

      {/* Boss mode indicator */}
      {isBossMode && (
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

      {/* Level indicator */}
      {levelProgress && (
        <div className="absolute top-2 right-2 z-10 bg-black/50 px-3 py-1 rounded-full">
          <span className="text-white/80 text-sm">
            {levelProgress.nameHe} • {levelProgress.puzzlesSolved}/{levelProgress.puzzlesRequired}
          </span>
        </div>
      )}

      {/* Puzzle Board */}
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
        {showBossAnnouncement && (
          <BossAnnouncement
            bossInfo={bossInfo}
            world={currentWorld}
            onStart={handleBossStart}
          />
        )}
      </AnimatePresence>

      {/* Boss Victory Modal */}
      <AnimatePresence>
        {showBossVictory && (
          <BossVictory
            bossInfo={bossInfo}
            world={currentWorld}
            coinsEarned={bossRewards.coins}
            xpEarned={bossRewards.xp}
            onContinue={handleBossVictoryContinue}
          />
        )}
      </AnimatePresence>

      {/* World Introduction Modal */}
      <AnimatePresence>
        {showWorldIntro && (
          <ZoneIntro
            zoneNameHe={currentWorld.nameHe}
            zoneDescription={`ברוכים הבאים ל${currentWorld.nameHe}!`}
            newOperators={pendingOperatorIntros}
            onContinue={handleWorldIntroComplete}
          />
        )}
      </AnimatePresence>

      {/* Operator Introduction Modal */}
      <AnimatePresence>
        {currentOperatorIntro && (
          <OperatorGuide
            operator={currentOperatorIntro}
            zoneNameHe={currentWorld.nameHe}
            onComplete={handleOperatorIntroComplete}
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
  const resetProgress = useProgressStore((s) => s.resetProgress);

  const globalProgress = useGlobalProgress();

  const handleReset = () => {
    if (confirm('האם אתה בטוח? כל ההתקדמות תאבד!')) {
      resetPlayer();
      resetStats();
      resetProgress();
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

      {/* Progress Overview */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="text-white font-bold mb-3">התקדמות כללית</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">שלבים שהושלמו</span>
            <span className="text-white">{globalProgress.totalLevelsCompleted} / 30</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              animate={{ width: `${globalProgress.completionPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">עולמות שהושלמו</span>
            <span className="text-white">{globalProgress.completedWorlds} / 5</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="🧩" value={globalProgress.totalPuzzlesSolved} label="חידות נפתרו" color="blue" />
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

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { useProgressStore } from '@/store/progressStore';
import { useGameStore } from '@/store/gameStore';
import { getZoneById, ZONES } from '@/engine/story';
import { ZoneBanner, ZoneCard } from '@/components/ui/ZoneBackground';
import { BottomNav, NavTab, TopBar } from '@/components/navigation';
import { ShopPage, InventoryView } from '@/components/shop';
import { LevelUpModal } from '@/components/ui/CoinDisplay';
import { PuzzleBoard } from '@/components/game/PuzzleBoard';

interface HomeScreenProps {
  initialTab?: NavTab;
}

export function HomeScreen({ initialTab = 'home' }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<NavTab>(initialTab);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);

  const level = usePlayerStore((s) => s.level);
  const dailyStreak = usePlayerStore((s) => s.dailyStreak);
  const skill = usePlayerStore((s) => s.skill);
  const totalPuzzlesSolved = usePlayerStore((s) => s.totalPuzzlesSolved);

  const currentZoneId = useProgressStore((s) => s.currentZoneId);
  const unlockedZones = useProgressStore((s) => s.unlockedZones);
  const setCurrentZone = useProgressStore((s) => s.setCurrentZone);
  const checkZoneUnlocks = useProgressStore((s) => s.checkZoneUnlocks);

  const currentZone = getZoneById(currentZoneId);

  // Check for zone unlocks when level changes
  useEffect(() => {
    checkZoneUnlocks();
  }, [level, checkZoneUnlocks]);

  // Track level changes for level-up modal
  const [prevLevel, setPrevLevel] = useState(level);
  useEffect(() => {
    if (level > prevLevel) {
      setLevelUpLevel(level);
      setShowLevelUp(true);
      setPrevLevel(level);
    }
  }, [level, prevLevel]);

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
            onZoneSelect={handleZoneSelect}
            onStartGame={handleStartGame}
            dailyStreak={dailyStreak}
            skill={skill}
            totalPuzzlesSolved={totalPuzzlesSolved}
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
        {showLevelUp && (
          <LevelUpModal
            newLevel={levelUpLevel}
            onClose={() => setShowLevelUp(false)}
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
  onZoneSelect: (zoneId: string) => void;
  onStartGame: (zoneId?: string) => void;
  dailyStreak: number;
  skill: { '+': number; '-': number; '×': number; '÷': number };
  totalPuzzlesSolved: number;
}

function HomeContent({
  currentZone,
  unlockedZones,
  onZoneSelect,
  onStartGame,
  dailyStreak,
  skill,
  totalPuzzlesSolved,
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
            const isUnlocked = unlockedZones.includes(zone.id);
            const isCurrent = currentZone?.id === zone.id;

            return (
              <ZoneCard
                key={zone.id}
                zone={zone}
                isUnlocked={isUnlocked}
                isCurrent={isCurrent}
                onClick={() => isUnlocked && onStartGame(zone.id)}
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
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const startNewPuzzle = useGameStore((s) => s.startNewPuzzle);
  const recordResult = useGameStore((s) => s.recordResult);
  const skipPuzzle = useGameStore((s) => s.skipPuzzle);

  // Start a puzzle when entering play mode if none exists
  useEffect(() => {
    if (!currentPuzzle) {
      startNewPuzzle(undefined, currentZoneId);
    }
  }, [currentPuzzle, currentZoneId, startNewPuzzle]);

  const handleSolve = (expression: import('@/engine/types').Expression) => {
    recordResult(expression, hintsUsed);
    // Start next puzzle after a brief delay
    setTimeout(() => startNewPuzzle(undefined, currentZoneId), 1500);
  };

  const handleSkip = () => {
    skipPuzzle();
    startNewPuzzle(undefined, currentZoneId);
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      {/* Zone background overlay */}
      {zone && (
        <div
          className={`absolute inset-0 bg-gradient-to-b ${zone.theme.background} opacity-20`}
        />
      )}
      {currentPuzzle ? (
        <PuzzleBoard
          puzzle={currentPuzzle}
          onSolve={handleSolve}
          onSkip={handleSkip}
        />
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
        <div className="text-6xl mb-3">🧙‍♂️</div>
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROLOGUE } from '@/engine/story';

interface PrologueProps {
  onComplete: () => void;
}

export function Prologue({ onComplete }: PrologueProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const scenes = PROLOGUE.scenes;
  const isLastScene = currentScene >= scenes.length - 1;

  const nextScene = useCallback(() => {
    if (isLastScene) {
      onComplete();
    } else {
      setCurrentScene(prev => prev + 1);
    }
  }, [isLastScene, onComplete]);

  // Auto-advance scenes
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setTimeout(() => {
      nextScene();
    }, scenes[currentScene]?.duration || 3000);

    return () => clearTimeout(timer);
  }, [currentScene, isAutoPlaying, nextScene, scenes]);

  // Handle tap to advance
  const handleTap = () => {
    setIsAutoPlaying(false);
    nextScene();
  };

  // Handle skip
  const handleSkip = () => {
    onComplete();
  };

  const scene = scenes[currentScene];

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleTap}
    >
      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Title - only on first scene */}
      <AnimatePresence>
        {currentScene === 0 && (
          <motion.div
            className="absolute top-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
              {PROLOGUE.titleHe}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Visual */}
            <motion.div
              className="text-6xl mb-8"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {scene?.visual}
            </motion.div>

            {/* Text */}
            <motion.p
              className="text-xl text-gray-200 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {scene?.textHe}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-24 flex gap-2">
        {scenes.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 rounded-full ${
              index === currentScene
                ? 'w-8 bg-yellow-400'
                : index < currentScene
                  ? 'w-2 bg-yellow-600'
                  : 'w-2 bg-gray-700'
            }`}
            animate={index === currentScene ? {
              scaleX: [1, 1.2, 1],
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Tap to continue hint */}
      <motion.p
        className="absolute bottom-16 text-gray-500 text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        הקש להמשך
      </motion.p>

      {/* Skip button */}
      <motion.button
        className="absolute bottom-6 right-6 px-4 py-2 text-gray-500 text-sm hover:text-gray-300 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {PROLOGUE.skipTextHe} →
      </motion.button>

      {/* Dramatic vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.8) 100%)',
        }}
      />
    </motion.div>
  );
}

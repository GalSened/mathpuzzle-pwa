'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import { useUserStore, Gender } from '@/store/userStore';
import { he } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function WelcomePage() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const setUser = useUserStore((s) => s.setUser);

  const canSubmit = name.trim().length >= 2 && gender !== null;

  const handleSubmit = () => {
    if (canSubmit && gender) {
      setUser(name.trim(), gender);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo/Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl shadow-lg shadow-purple-500/30 mb-4">
            <span className="text-4xl font-bold text-white">π</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{he.appName}</h1>
          <p className="text-purple-300">{he.welcome}</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700"
        >
          <h2 className="text-xl font-semibold text-white text-center mb-6">
            {he.welcomeSubtitle}
          </h2>

          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm mb-2">
              {he.enterName}
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={he.namePlaceholder}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 pr-12 pl-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                maxLength={20}
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div className="mb-8">
            <label className="block text-slate-300 text-sm mb-3">
              {he.selectGender}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGender('boy')}
                className={cn(
                  'py-4 px-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                  gender === 'boy'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'bg-slate-900/30 border-slate-600 text-slate-400 hover:border-slate-500'
                )}
              >
                <span className="text-3xl">👦</span>
                <span className="font-medium">{he.boy}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setGender('girl')}
                className={cn(
                  'py-4 px-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                  gender === 'girl'
                    ? 'bg-pink-600/30 border-pink-500 text-pink-300'
                    : 'bg-slate-900/30 border-slate-600 text-slate-400 hover:border-slate-500'
                )}
              >
                <span className="text-3xl">👧</span>
                <span className="font-medium">{he.girl}</span>
              </motion.button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={canSubmit ? { scale: 1.02 } : undefined}
            whileTap={canSubmit ? { scale: 0.98 } : undefined}
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all',
              canSubmit
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            )}
          >
            <Sparkles className="w-5 h-5" />
            {he.startPlaying}
          </motion.button>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4 mt-8 text-4xl"
        >
          <span className="opacity-30">+</span>
          <span className="opacity-50">−</span>
          <span className="opacity-30">×</span>
          <span className="opacity-50">÷</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

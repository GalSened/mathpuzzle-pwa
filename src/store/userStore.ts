import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Operator } from '@/engine/types';

export type Gender = 'boy' | 'girl';

interface UserState {
  name: string | null;
  gender: Gender | null;
  hasCompletedOnboarding: boolean;
  hasSeenPrologue: boolean;
  hasSeenTutorial: boolean;
  seenOperatorIntros: Operator[];
  seenZoneIntros: string[];

  // Actions
  setUser: (name: string, gender: Gender) => void;
  completePrologue: () => void;
  completeTutorial: () => void;
  markOperatorIntroSeen: (operator: Operator) => void;
  markZoneIntroSeen: (zoneId: string) => void;
  getUnseenOperators: (operators: Operator[]) => Operator[];
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      name: null,
      gender: null,
      hasCompletedOnboarding: false,
      hasSeenPrologue: false,
      hasSeenTutorial: false,
      seenOperatorIntros: ['+', '-', '×', '÷'] as Operator[], // V3: All operators available from start
      seenZoneIntros: ['addlands'], // First zone is seen by default

      setUser: (name: string, gender: Gender) => {
        set({
          name,
          gender,
          hasCompletedOnboarding: true,
        });
      },

      completePrologue: () => {
        set({ hasSeenPrologue: true });
      },

      completeTutorial: () => {
        set({ hasSeenTutorial: true });
      },

      markOperatorIntroSeen: (operator: Operator) => {
        const { seenOperatorIntros } = get();
        if (!seenOperatorIntros.includes(operator)) {
          set({ seenOperatorIntros: [...seenOperatorIntros, operator] });
        }
      },

      markZoneIntroSeen: (zoneId: string) => {
        const { seenZoneIntros } = get();
        if (!seenZoneIntros.includes(zoneId)) {
          set({ seenZoneIntros: [...seenZoneIntros, zoneId] });
        }
      },

      getUnseenOperators: (operators: Operator[]) => {
        const { seenOperatorIntros } = get();
        return operators.filter(op => !seenOperatorIntros.includes(op));
      },

      resetUser: () => {
        set({
          name: null,
          gender: null,
          hasCompletedOnboarding: false,
          hasSeenPrologue: false,
          hasSeenTutorial: false,
          seenOperatorIntros: ['+', '-', '×', '÷'],
          seenZoneIntros: ['addlands'],
        });
      },
    }),
    {
      name: 'mathpuzzle-user',
    }
  )
);

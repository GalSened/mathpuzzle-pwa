import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Gender = 'boy' | 'girl';

interface UserState {
  name: string | null;
  gender: Gender | null;
  hasCompletedOnboarding: boolean;
  hasSeenPrologue: boolean;
  hasSeenTutorial: boolean;

  // Actions
  setUser: (name: string, gender: Gender) => void;
  completePrologue: () => void;
  completeTutorial: () => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: null,
      gender: null,
      hasCompletedOnboarding: false,
      hasSeenPrologue: false,
      hasSeenTutorial: false,

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

      resetUser: () => {
        set({
          name: null,
          gender: null,
          hasCompletedOnboarding: false,
          hasSeenPrologue: false,
          hasSeenTutorial: false,
        });
      },
    }),
    {
      name: 'mathpuzzle-user',
    }
  )
);

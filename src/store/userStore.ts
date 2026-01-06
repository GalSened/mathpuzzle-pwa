import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Gender = 'boy' | 'girl';

interface UserState {
  name: string | null;
  gender: Gender | null;
  hasCompletedOnboarding: boolean;
  hasSeenTutorial: boolean;

  // Actions
  setUser: (name: string, gender: Gender) => void;
  completeTutorial: () => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: null,
      gender: null,
      hasCompletedOnboarding: false,
      hasSeenTutorial: false,

      setUser: (name: string, gender: Gender) => {
        set({
          name,
          gender,
          hasCompletedOnboarding: true,
        });
      },

      completeTutorial: () => {
        set({ hasSeenTutorial: true });
      },

      resetUser: () => {
        set({
          name: null,
          gender: null,
          hasCompletedOnboarding: false,
          hasSeenTutorial: false,
        });
      },
    }),
    {
      name: 'mathpuzzle-user',
    }
  )
);

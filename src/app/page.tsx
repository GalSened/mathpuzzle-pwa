'use client';

import { WelcomePage } from '@/components/onboarding/WelcomePage';
import { Tutorial } from '@/components/onboarding/Tutorial';
import { HomeScreen } from '@/components/home';
import { useUserStore } from '@/store/userStore';

export default function Home() {
  const { hasCompletedOnboarding, hasSeenTutorial } = useUserStore();

  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <WelcomePage />;
  }

  // Show tutorial if not seen
  if (!hasSeenTutorial) {
    return <Tutorial />;
  }

  // Show the main game home screen
  return <HomeScreen />;
}

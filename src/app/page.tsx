'use client';

import { WelcomePage } from '@/components/onboarding/WelcomePage';
import { Prologue } from '@/components/story/Prologue';
import { Tutorial } from '@/components/onboarding/Tutorial';
import { HomeScreen } from '@/components/home';
import { useUserStore } from '@/store/userStore';

export default function Home() {
  const { hasCompletedOnboarding, hasSeenPrologue, hasSeenTutorial, completePrologue } = useUserStore();

  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <WelcomePage />;
  }

  // Show story prologue after onboarding
  if (!hasSeenPrologue) {
    return <Prologue onComplete={completePrologue} />;
  }

  // Show tutorial if not seen
  if (!hasSeenTutorial) {
    return <Tutorial />;
  }

  // Show the main game home screen
  return <HomeScreen />;
}

/**
 * Sound Effects System using Web Audio API
 * Generates all sounds programmatically - no external files needed
 */

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// Sound settings stored in localStorage
const SOUND_SETTINGS_KEY = 'mathpuzzle-sounds';

interface SoundSettings {
  enabled: boolean;
  volume: number; // 0-1
}

function getSoundSettings(): SoundSettings {
  if (typeof window === 'undefined') {
    return { enabled: true, volume: 0.5 };
  }
  try {
    const stored = localStorage.getItem(SOUND_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }
  return { enabled: true, volume: 0.5 };
}

export function setSoundEnabled(enabled: boolean): void {
  const settings = getSoundSettings();
  settings.enabled = enabled;
  localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(settings));
}

export function setSoundVolume(volume: number): void {
  const settings = getSoundSettings();
  settings.volume = Math.max(0, Math.min(1, volume));
  localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(settings));
}

export function isSoundEnabled(): boolean {
  return getSoundSettings().enabled;
}

export function getSoundVolume(): number {
  return getSoundSettings().volume;
}

// Helper function for exponential decay (exponentialRampToValueAtTime can't go to 0)
function decayTo(param: AudioParam, value: number, endTime: number): void {
  param.exponentialRampToValueAtTime(Math.max(value, 0.0001), endTime);
}

// ═══════════════════════════════════════════════════════════════════════════
// SOUND GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Play a success/correct answer sound
 * Bright, uplifting tone
 */
export function playCorrect(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    const volume = getSoundVolume();

    // Create oscillators for a pleasant chord
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5

    gain.gain.setValueAtTime(0.3 * volume, ctx.currentTime);
    decayTo(gain.gain, 0.01, ctx.currentTime + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not available
  }
}

/**
 * Play an error/wrong answer sound
 * Low, short buzz
 */
export function playWrong(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    const volume = getSoundVolume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2 * volume, ctx.currentTime);
    decayTo(gain.gain, 0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Audio not available
  }
}

/**
 * Play button click sound
 * Short, subtle click
 */
export function playClick(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    const volume = getSoundVolume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0.15 * volume, ctx.currentTime);
    decayTo(gain.gain, 0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Audio not available
  }
}

/**
 * Play level up fanfare
 * Ascending triumphant melody
 */
export function playLevelUp(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    const volume = getSoundVolume();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const duration = 0.15;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * duration);

      gain.gain.setValueAtTime(0, ctx.currentTime + i * duration);
      gain.gain.linearRampToValueAtTime(0.3 * volume, ctx.currentTime + i * duration + 0.02);
      decayTo(gain.gain, 0.01, ctx.currentTime + i * duration + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * duration);
      osc.stop(ctx.currentTime + i * duration + duration);
    });
  } catch {
    // Audio not available
  }
}

/**
 * Play coin collect sound
 * Bright ding
 */
export function playCoin(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    const volume = getSoundVolume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.25 * volume, ctx.currentTime);
    decayTo(gain.gain, 0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Audio not available
  }
}

/**
 * Play boss appear sound
 * Deep, ominous rumble
 */
export function playBossAppear(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    const volume = getSoundVolume();

    // Low rumble
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(60, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.8);

    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.3 * volume, ctx.currentTime + 0.2);
    gain1.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.8);

    // High accent
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(200, ctx.currentTime + 0.1);

    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.2 * volume, ctx.currentTime + 0.15);
    decayTo(gain2.gain, 0.01, ctx.currentTime + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio not available
  }
}

/**
 * Play boss victory fanfare
 * Triumphant, epic melody
 */
export function playBossVictory(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    const volume = getSoundVolume();

    // Victory melody: C E G C (high) G C (higher)
    const notes = [
      { freq: 523.25, time: 0, dur: 0.2 },      // C5
      { freq: 659.25, time: 0.2, dur: 0.2 },    // E5
      { freq: 783.99, time: 0.4, dur: 0.2 },    // G5
      { freq: 1046.50, time: 0.6, dur: 0.4 },   // C6
      { freq: 783.99, time: 1.0, dur: 0.15 },   // G5
      { freq: 1046.50, time: 1.15, dur: 0.5 },  // C6 (hold)
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.35 * volume, ctx.currentTime + time + 0.02);
      gain.gain.setValueAtTime(0.35 * volume, ctx.currentTime + time + dur - 0.05);
      decayTo(gain.gain, 0.01, ctx.currentTime + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur);
    });
  } catch {
    // Audio not available
  }
}

/**
 * Play streak milestone sound
 * Exciting ascending arpeggio
 */
export function playStreak(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    const volume = getSoundVolume();

    const notes = [659.25, 783.99, 987.77, 1174.66]; // E5, G5, B5, D6
    const dur = 0.1;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * dur);

      gain.gain.setValueAtTime(0.25 * volume, ctx.currentTime + i * dur);
      decayTo(gain.gain, 0.01, ctx.currentTime + i * dur + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * dur);
      osc.stop(ctx.currentTime + i * dur + dur * 1.5);
    });
  } catch {
    // Audio not available
  }
}

/**
 * Play purchase/equip sound
 * Satisfying pop with sparkle
 */
export function playPurchase(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    const volume = getSoundVolume();

    // Pop
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(400, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);

    gain1.gain.setValueAtTime(0.3 * volume, ctx.currentTime);
    decayTo(gain1.gain, 0.01, ctx.currentTime + 0.1);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.1);

    // Sparkle
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1400, ctx.currentTime + 0.05);

    gain2.gain.setValueAtTime(0.2 * volume, ctx.currentTime + 0.05);
    decayTo(gain2.gain, 0.01, ctx.currentTime + 0.2);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.2);
  } catch {
    // Audio not available
  }
}

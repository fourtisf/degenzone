// Procedural audio for alerts. No asset files; everything synthesized so the
// payload stays tiny and the sound is consistent across browsers.

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  // Browsers suspend AudioContext until first user gesture
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(opts: { freq: number; duration: number; type?: OscillatorType; gain?: number; delay?: number }) {
  const a = ensureCtx();
  if (!a) return;
  const { freq, duration, type = 'sine', gain = 0.18, delay = 0 } = opts;
  const t0 = a.currentTime + delay;

  const osc = a.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);

  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(g);
  g.connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const alerts = {
  pump() {
    tone({ freq: 880, duration: 0.18 });
    tone({ freq: 1320, duration: 0.18, delay: 0.12 });
  },
  megaPump() {
    tone({ freq: 660, duration: 0.10 });
    tone({ freq: 880, duration: 0.10, delay: 0.10 });
    tone({ freq: 1175, duration: 0.10, delay: 0.20 });
    tone({ freq: 1568, duration: 0.20, delay: 0.30 });
  },
  whale() {
    tone({ freq: 440, duration: 0.45, type: 'triangle', gain: 0.14 });
  },
  watchlist() {
    tone({ freq: 1046, duration: 0.10, type: 'triangle', gain: 0.10 });
  },
  click() {
    tone({ freq: 1760, duration: 0.04, type: 'square', gain: 0.05 });
  },
  unmute() {
    // Tiny chirp to confirm audio is unlocked
    tone({ freq: 1320, duration: 0.06, type: 'triangle', gain: 0.08 });
  },
};

export function unlockAudio() {
  alerts.unmute();
}

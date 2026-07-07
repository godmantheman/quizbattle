/**
 * Sound effects synthesizer using Web Audio API for zero-dependency sound effects.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSound(type: 'tap' | 'correct' | 'wrong' | 'countdown' | 'start' | 'victory' | 'hold' | 'erase' | 'bell') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'tap': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'correct': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5

        osc2.frequency.setValueAtTime(659.25, now); // E5
        osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.25);
        osc2.stop(now + 0.25);
        break;
      }
      case 'wrong': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.25);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'countdown': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(440, now); // A4
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'start': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.frequency.setValueAtTime(880, now); // A5
        osc2.frequency.setValueAtTime(1109.73, now); // C#6

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);
        break;
      }
      case 'victory': {
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Arpeggio C Major
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0.12, now + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.1 + 0.3);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.3);
        });
        break;
      }
      case 'hold': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(250, now);
        osc.frequency.linearRampToValueAtTime(350, now + 0.1);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'erase': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120 + Math.random() * 80, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      case 'bell': {
        // High pitch school bell sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(987.77, now); // B5
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1046.50, now); // C6

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.3);
        break;
      }
    }
  } catch (e) {
    console.warn('Audio synthesis failed or is blocked by browser:', e);
  }
}

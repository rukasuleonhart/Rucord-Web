// ======================================================
// SONS DE NOTIFICAÇÃO
// ======================================================

let audioCtx = null;

export function ensureAudioCtx() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

function playTone(freq, duration, delay = 0, volume = 0.15) {
  const ctx = ensureAudioCtx();

  if (!ctx) {
    return;
  }

  setTimeout(() => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.value = volume;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      osc.start(now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.stop(now + duration);
    } catch (error) {
      // Ignora falhas de áudio silenciosamente.
    }
  }, delay);
}

export function playJoinSound() {
  playTone(700, 0.1, 0);
  playTone(940, 0.12, 90);
}

export function playLeaveSound() {
  playTone(520, 0.12, 0);
  playTone(360, 0.14, 100);
}

export function playShareSound() {
  playTone(600, 0.08, 0);
  playTone(800, 0.08, 90);
  playTone(1040, 0.12, 180);
}

export function playChatSound() {
  playTone(880, 0.09, 0, 0.12);
}

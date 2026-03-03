let audioCtx = null;

function ensureCtx() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function primeSoundCues() {
  const ctx = ensureCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

function tone({ freq = 440, duration = 0.08, type = "sine", gain = 0.035, at = 0 }) {
  const ctx = ensureCtx();
  if (!ctx) return;

  const now = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playSoundCue(eventKey) {
  if (eventKey === "checkin") {
    tone({ freq: 640, duration: 0.07, type: "triangle", gain: 0.06 });
    tone({ freq: 880, duration: 0.09, type: "triangle", gain: 0.055, at: 0.05 });
    return;
  }
  if (eventKey === "claim") {
    tone({ freq: 540, duration: 0.07, type: "sine", gain: 0.06 });
    tone({ freq: 810, duration: 0.09, type: "sine", gain: 0.065, at: 0.06 });
    tone({ freq: 1080, duration: 0.12, type: "sine", gain: 0.055, at: 0.12 });
    return;
  }
  if (eventKey === "level_up") {
    tone({ freq: 520, duration: 0.08, type: "square", gain: 0.055 });
    tone({ freq: 780, duration: 0.1, type: "square", gain: 0.06, at: 0.08 });
    tone({ freq: 1170, duration: 0.14, type: "square", gain: 0.065, at: 0.18 });
  }
}

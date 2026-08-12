/**
 * Soft UI / game SFX via Web Audio (no asset files).
 * Volumes stay low and smooth for mobile.
 */

let ctx = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone({ freq = 440, dur = 0.12, type = 'sine', gain = 0.08, delay = 0, slideTo } = {}) {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noiseBurst({ dur = 0.08, gain = 0.04, delay = 0 } = {}) {
  const ac = getCtx();
  if (!ac) return;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1800;
  g.gain.value = gain;
  src.connect(filter);
  filter.connect(g);
  g.connect(ac.destination);
  src.start(ac.currentTime + delay);
}

/** Soft cash / coin credit */
export function playCash() {
  tone({ freq: 880, dur: 0.09, type: 'triangle', gain: 0.07 });
  tone({ freq: 1175, dur: 0.12, type: 'triangle', gain: 0.06, delay: 0.07 });
  tone({ freq: 1568, dur: 0.16, type: 'sine', gain: 0.05, delay: 0.14 });
}

/** Coin conversion */
export function playConvert() {
  tone({ freq: 523, dur: 0.1, type: 'sine', gain: 0.06 });
  tone({ freq: 659, dur: 0.1, type: 'sine', gain: 0.06, delay: 0.08 });
  tone({ freq: 784, dur: 0.14, type: 'triangle', gain: 0.05, delay: 0.16 });
}

/** Single soft peg click (wheel segment tick) */
function spinTick(delay = 0, gain = 0.055) {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const filter = ac.createBiquadFilter();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1450, t0);
  osc.frequency.exponentialRampToValueAtTime(420, t0 + 0.045);
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  filter.Q.value = 2.2;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.055);
  osc.connect(filter);
  filter.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + 0.06);
}

/**
 * Casino wheel spin: fast ticks that slow down over ~4.5s (matches UI spin).
 */
export function playSpin(durationMs = 4600) {
  const ac = getCtx();
  if (!ac) return;
  // Soft whoosh under the ticks
  tone({ freq: 180, dur: 0.45, type: 'sawtooth', gain: 0.018, slideTo: 70 });
  noiseBurst({ dur: 0.25, gain: 0.022 });

  const duration = Math.max(1.5, durationMs / 1000);
  let t = 0;
  let gap = 0.045; // start fast
  const maxGap = 0.38;
  let i = 0;
  while (t < duration - 0.08) {
    const progress = t / duration;
    // Volume softens slightly as it slows
    const g = 0.04 + (1 - progress) * 0.025;
    spinTick(t, g);
    // Ease: gaps grow (wheel decelerates)
    gap = 0.045 + progress * progress * (maxGap - 0.045);
    // Extra slowdown near the end
    if (progress > 0.7) gap *= 1.15;
    t += gap;
    i += 1;
    if (i > 120) break;
  }
  // Final soft settle click
  spinTick(Math.min(t, duration - 0.05), 0.07);
}

export function playWin() {
  playCash();
}

/** Scratch reveal */
export function playScratch() {
  noiseBurst({ dur: 0.12, gain: 0.05 });
  tone({ freq: 640, dur: 0.1, type: 'triangle', gain: 0.04, delay: 0.05 });
}

/** Ludo dice / move */
export function playLudo() {
  tone({ freq: 392, dur: 0.07, type: 'square', gain: 0.035 });
  tone({ freq: 523, dur: 0.08, type: 'square', gain: 0.03, delay: 0.06 });
}

/** Soft tap / click */
export function playTap() {
  tone({ freq: 720, dur: 0.05, type: 'sine', gain: 0.04 });
}

export const sfx = {
  cash: playCash,
  convert: playConvert,
  spin: playSpin,
  win: playWin,
  scratch: playScratch,
  ludo: playLudo,
  tap: playTap,
};

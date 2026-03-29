let ctx: AudioContext | null = null;

/** Master gain for all SFX (connect through this bus so levels stay balanced). */
const SFX_MASTER_GAIN = 1.85;

let sfxMaster: GainNode | null = null;

function getSfxMaster(c: AudioContext): GainNode {
  if (!sfxMaster) {
    sfxMaster = c.createGain();
    sfxMaster.gain.value = SFX_MASTER_GAIN;
    sfxMaster.connect(c.destination);
  }
  return sfxMaster;
}

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Resume after a user gesture (autoplay policies). */
export function resumeAudioContext(): Promise<void> {
  const c = getAudioContext();
  if (!c) return Promise.resolve();
  if (c.state === "suspended") return c.resume().catch(() => undefined);
  return Promise.resolve();
}

function getCtx(): AudioContext | null {
  return getAudioContext();
}

function scheduleTone(
  c: AudioContext,
  t0: number,
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  peakGain = 0.1
) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peakGain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  o.connect(g);
  g.connect(getSfxMaster(c));
  o.start(t0);
  o.stop(t0 + duration + 0.05);
}

function beep(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.08) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g);
  g.connect(getSfxMaster(c));
  o.start();
  o.stop(c.currentTime + duration);
}

/** Short UI click — nav, splash, intro */
export function playUiClick() {
  beep(660, 0.08, "sine", 0.06);
}

/** Friend mockup: ascending correct chord */
export function playCorrect() {
  const c = getCtx();
  if (!c) return;
  const n = c.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    scheduleTone(c, n + i * 0.09, f, 0.22, "sine", 0.12);
  });
}

/** Friend mockup: harsh wrong */
export function playWrong() {
  const c = getCtx();
  if (!c) return;
  const n = c.currentTime;
  scheduleTone(c, n, 280, 0.15, "sawtooth", 0.1);
  scheduleTone(c, n + 0.15, 220, 0.25, "sawtooth", 0.08);
}

/** Round timer expired (Arcade / Boss) */
export function playTimeUp() {
  beep(196, 0.14, "sawtooth", 0.065);
  window.setTimeout(() => beep(130, 0.22, "triangle", 0.075), 0.1);
}

export function playLevelUp() {
  beep(523, 0.1, "sine", 0.07);
  window.setTimeout(() => beep(659, 0.1, "sine", 0.06), 0.1);
  window.setTimeout(() => beep(784, 0.15, "sine", 0.06), 0.2);
}

export function playCombo(soundEnabled: boolean) {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const n = c.currentTime;
  [523, 659, 784, 1047, 1319].forEach((f, i) => {
    scheduleTone(c, n + i * 0.07, f, 0.18, "triangle", 0.14);
  });
}

export function playRunComplete(soundEnabled: boolean) {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const n = c.currentTime;
  [523, 587, 659, 784, 880, 1047, 1319].forEach((f, i) => {
    scheduleTone(c, n + i * 0.09, f, 0.2, "sine", 0.12);
  });
}

export function playHint(soundEnabled: boolean) {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const n = c.currentTime;
  scheduleTone(c, n, 660, 0.09, "sine", 0.07);
  scheduleTone(c, n + 0.1, 880, 0.12, "sine", 0.07);
}

export function playTick(soundEnabled: boolean) {
  if (!soundEnabled) return;
  beep(440, 0.04, "sine", 0.04);
}

export function playDanger(soundEnabled: boolean) {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const n = c.currentTime;
  scheduleTone(c, n, 330, 0.12, "sawtooth", 0.1);
  scheduleTone(c, n + 0.14, 220, 0.18, "sawtooth", 0.07);
}

export function playRetry(soundEnabled: boolean) {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const n = c.currentTime;
  scheduleTone(c, n, 440, 0.12, "sine", 0.07);
  scheduleTone(c, n + 0.14, 550, 0.1, "sine", 0.07);
}

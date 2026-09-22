// Synthesized Web Audio Engine
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.45;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return true;
  }

  env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  osc(type, f0, f1, dur, peak = 0.3, when = 0) {
    if (!this.enabled || !this.ensure()) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = this.ctx.createGain();
    this.env(g, t, 0.005, peak, dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.1);
  }

  noise(dur, peak, f0, f1, type = 'bandpass', when = 0) {
    if (!this.enabled || !this.ensure()) return;
    const t = this.ctx.currentTime + when;
    const len = Math.max(1, (this.ctx.sampleRate * dur) | 0);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const fl = this.ctx.createBiquadFilter();
    fl.type = type;
    fl.frequency.setValueAtTime(f0, t);
    if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
    fl.Q.value = 1;
    const g = this.ctx.createGain();
    this.env(g, t, 0.005, peak, dur);
    src.connect(fl);
    fl.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + dur);
  }

  init() {
    this.ensure();
  }

  tick() {
    this.osc('square', 1500 + Math.random() * 400, 0, 0.03, 0.06);
  }

  flip() {
    this.noise(0.14, 0.25, 500, 2400);
  }

  safe(k) {
    const st = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24];
    let d = st[Math.min(k - 1, st.length - 1)];
    if (k > st.length) d += 12 * (k - st.length);
    const f = 392 * Math.pow(2, d / 12);
    this.osc('triangle', f, f * 1.001, 0.16, 0.2);
    this.osc('triangle', f * 2, f * 2, 0.09, 0.05, 0.04);
  }

  boom() {
    this.noise(0.7, 0.6, 2500, 60, 'lowpass');
    this.osc('sine', 110, 38, 0.6, 0.5);
    this.noise(0.12, 0.3, 3000, 800);
  }

  pop() {
    this.noise(0.09, 0.2, 900, 300, 'lowpass');
  }

  clink() {
    const f = 1900 + Math.random() * 600;
    this.osc('sine', f, f * 0.98, 0.09, 0.12);
    this.osc('sine', f * 1.5, 0, 0.06, 0.05, 0.02);
  }

  sting() {
    this.osc('sawtooth', 300, 120, 0.35, 0.16);
    this.osc('sawtooth', 360, 130, 0.35, 0.14, 0.02);
  }

  cash() {
    [523, 659, 784, 1046].forEach((f, i) => this.osc('triangle', f, f, 0.16, 0.16, i * 0.07));
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.clink(), 350 + Math.random() * 350);
    }
  }

  shuffle() {
    this.noise(0.5, 0.12, 300, 1200);
  }

  blip() {
    this.osc('sine', 600, 500, 0.05, 0.05);
  }
}

export const soundEngine = new SoundEngine();

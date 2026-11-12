// motion.js: pure-function-of-time primitives for seek(t) films. No state, no clocks.
(function (g) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, u) => a + (b - a) * u;
  const prog = (t, t0, t1) => clamp((t - t0) / (t1 - t0));

  // Easing. expoOut / quintOut are the workhorses; cubic-bezier(0.16,1,0.3,1) ~ expoOut.
  const ease = {
    linear: (u) => u,
    inOutSine: (u) => -(Math.cos(Math.PI * u) - 1) / 2,
    outCubic: (u) => 1 - Math.pow(1 - u, 3),
    inCubic: (u) => u * u * u,
    inOutCubic: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
    outQuint: (u) => 1 - Math.pow(1 - u, 5),
    outExpo: (u) => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * u)),
    inExpo: (u) => (u <= 0 ? 0 : Math.pow(2, 10 * u - 10)),
    inOutExpo: (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u < 0.5 ? Math.pow(2, 20 * u - 10) / 2 : (2 - Math.pow(2, -20 * u + 10)) / 2),
  };
  // Generic cubic-bezier(x1,y1,x2,y2) solved by Newton + bisection.
  const bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (s) => ((ax * s + bx) * s + cx) * s, sy = (s) => ((ay * s + by) * s + cy) * s;
    const dsx = (s) => (3 * ax * s + 2 * bx) * s + cx;
    return (u) => {
      let s = u;
      for (let i = 0; i < 6; i++) { const d = dsx(s); if (Math.abs(d) < 1e-6) break; s -= (sx(s) - u) / d; }
      if (s < 0 || s > 1) { let lo = 0, hi = 1; s = u; for (let i = 0; i < 30; i++) { if (sx(s) < u) lo = s; else hi = s; s = (lo + hi) / 2; } }
      return sy(clamp(s));
    };
  };

  // Closed-form spring step response 0 -> 1. zeta<1 overshoots (0.75 ~ 2-3%), zeta=1 critically damped.
  // freq in Hz of the undamped oscillator. t is seconds since the step.
  const spring = (t, { freq = 2.2, zeta = 0.8 } = {}) => {
    if (t <= 0) return 0;
    const w = 2 * Math.PI * freq;
    if (zeta >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    const wd = w * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
  };
  // A value retargeted many times = start + sum of one spring per change. Still a pure function of t.
  // steps: [[t, target], ...] sorted by t.
  const springTrack = (t, start, steps, cfg) => {
    let v = start, prev = start;
    for (const [ts, target] of steps) { v += (target - prev) * spring(t - ts, cfg); prev = target; }
    return v;
  };

  // Keyframe table: kf(t, [[t0, v0], [t1, v1, easeFn?], ...]); ease on the segment that ends at that key.
  const kf = (t, keys, dflt = ease.inOutCubic) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [ta, va] = keys[i - 1], [tb, vb, e] = keys[i];
      if (t <= tb) return lerp(va, vb, (e || dflt)(prog(t, ta, tb)));
    }
    return keys[keys.length - 1][1];
  };
  // Zoom must be interpolated in log space or pushes feel like they accelerate.
  const logLerp = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), u));

  // Seeded randomness. Never Math.random in a film.
  const hash = (n) => { let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; };
  const rng = (seed) => (i) => hash(seed * 7919 + i);

  // Beat grid. beat(k) -> seconds. Offset = time of beat 0 (first downbeat in the track).
  const grid = (bpm, offset = 0) => ({ bpm, spb: 60 / bpm, beat: (k) => offset + (k * 60) / bpm, bar: (k, perBar = 4) => offset + (k * perBar * 60) / bpm });

  // Split an element's text into per-glyph spans (once, at setup). Returns the spans.
  const splitGlyphs = (el) => {
    const text = el.textContent; el.textContent = '';
    return [...text].map((ch) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; s.style.display = 'inline-block'; s.style.willChange = 'auto'; el.appendChild(s); return s; });
  };
  // Typewriter that is a pure function of time: chars visible at t given per-char times.
  const typed = (t, text, t0, cps = 30, holdEvery = 3, holdFrames = 1, fps = 60) => {
    let n = 0, tt = t0;
    for (let i = 0; i < text.length; i++) { tt += 1 / cps + (i % holdEvery === holdEvery - 1 ? holdFrames / fps : 0); if (t >= tt) n = i + 1; }
    return text.slice(0, n);
  };

  // 16-bit PCM WAV from an AudioBuffer, base64 (for window.renderAudio).
  const wavBase64 = (buf) => {
    const ch = buf.numberOfChannels, len = buf.length, sr = buf.sampleRate;
    const dv = new DataView(new ArrayBuffer(44 + len * ch * 2));
    const w = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); dv.setUint32(4, 36 + len * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true); dv.setUint32(24, sr, true);
    dv.setUint32(28, sr * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, len * ch * 2, true);
    const data = [...Array(ch)].map((_, c) => buf.getChannelData(c));
    let o = 44;
    for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) { dv.setInt16(o, clamp(data[c][i], -1, 1) * 0x7fff, true); o += 2; }
    let bin = ''; const u8 = new Uint8Array(dv.buffer);
    for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(bin);
  };

  g.M = { clamp, lerp, prog, ease, bezier, spring, springTrack, kf, logLerp, hash, rng, grid, splitGlyphs, typed, wavBase64 };
})(window);

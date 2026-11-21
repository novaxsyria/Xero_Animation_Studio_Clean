import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SR = 44100;
const FPS = 30;
const SLUG = 'hal-taarif-innaka-tahlum';
const PUB_DIR = path.resolve('studio/public', SLUG);
const ROOT_PUB = path.resolve('public');
const SFX_LIB = path.resolve('studio/library/sfx');
const STORYBOARD_PATH = path.resolve('studio/src/episodes', SLUG, 'storyboard.json');
const VOICE_PATH = path.join(PUB_DIR, 'voice.mp3');

fs.mkdirSync(PUB_DIR, { recursive: true });
fs.mkdirSync(SFX_LIB, { recursive: true });

const writeWav = (filePath, samples) => {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buf);
};

const encodeMp3 = (wavPath, mp3Path) => {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wavPath, '-c:a', 'libmp3lame', '-b:a', '192k', mp3Path]);
};

const decodeToFloat = (audioPath) => {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', audioPath, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 200 * 1024 * 1024 });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
};

// Deterministic PRNG for procedural synthesis
let seed = 1337;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

// Karplus-Strong plucked string (for Arabic Oud & dream harp)
const pluckString = (freq, durSec, brightness = 0.55) => {
  const n = Math.floor(durSec * SR);
  const out = new Float32Array(n);
  const delayLen = Math.max(8, Math.round(SR / freq));
  const ring = new Float32Array(delayLen);
  for (let i = 0; i < delayLen; i++) ring[i] = (rand() * 2 - 1) * 0.9;
  let idx = 0;
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const cur = ring[idx];
    const lp = brightness * cur + (1 - brightness) * prev;
    ring[idx] = lp * 0.996;
    prev = cur;
    out[i] = cur;
    idx = (idx + 1) % delayLen;
  }
  return out;
};

const makeClip = (secs, fn) => {
  const n = Math.floor(secs * SR);
  const buf = new Float32Array(n);
  fn(buf, n);
  // Normalize peak to 0.92
  let mx = 1e-6;
  for (let i = 0; i < n; i++) mx = Math.max(mx, Math.abs(buf[i]));
  const g = 0.92 / mx;
  for (let i = 0; i < n; i++) buf[i] *= g;
  return buf;
};

// 1. Ensure every clip needed by storyboard exists in studio/library/sfx/
const existingLib = fs.readdirSync(SFX_LIB);
const findLib = (name) => existingLib.find((f) => f === `${name}.mp3` || f.startsWith(`${name}-`));

const SYNTH_RECIPES = {
  phone_chime: () =>
    makeClip(0.7, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const env = Math.exp(-t * 6.5);
        b[i] = (Math.sin(2 * Math.PI * 1046.5 * t) * 0.6 + Math.sin(2 * Math.PI * 1568 * t) * 0.4) * env;
      }
    }),
  light_switch: () =>
    makeClip(0.25, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const click = t < 0.03 ? (rand() * 2 - 1) * Math.exp(-t * 140) : 0;
        const thud = Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 45) * 0.6;
        b[i] = click + thud;
      }
    }),
  door_knock_single: () =>
    makeClip(0.45, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const env = Math.exp(-t * 28);
        b[i] = (Math.sin(2 * Math.PI * 125 * t) * 0.7 + Math.sin(2 * Math.PI * 290 * t) * 0.35 + (rand() * 2 - 1) * 0.25) * env;
      }
    }),
  door_knock_triple: () =>
    makeClip(1.85, (b, n) => {
      const hits = [0.05, 0.65, 1.28];
      for (const h of hits) {
        const s0 = Math.floor(h * SR);
        for (let k = 0; k < Math.floor(0.32 * SR) && s0 + k < n; k++) {
          const t = k / SR;
          const env = Math.exp(-t * 26);
          b[s0 + k] += (Math.sin(2 * Math.PI * 122 * t) * 0.7 + Math.sin(2 * Math.PI * 285 * t) * 0.35 + (rand() * 2 - 1) * 0.28) * env;
        }
      }
    }),
  door_creak_open: () =>
    makeClip(1.2, (b, n) => {
      let ph = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const f = 145 + Math.sin(t * 9) * 35 + t * 50;
        ph += (2 * Math.PI * f) / SR;
        const env = Math.sin((Math.PI * t) / 1.2);
        b[i] = (Math.sin(ph) * 0.5 + Math.sin(ph * 2.02) * 0.25 + (rand() * 2 - 1) * 0.08) * env;
      }
    }),
  clock_tick_reverse: () =>
    makeClip(2.4, (b, n) => {
      for (let k = 0; k < 8; k++) {
        const s0 = Math.floor(k * 0.28 * SR);
        for (let i = 0; i < 2200 && s0 + i < n; i++) {
          const t = i / SR;
          b[s0 + i] += Math.sin(2 * Math.PI * (1400 - k * 55) * t) * Math.exp(-t * 90);
        }
      }
    }),
  clock_tick_single: () =>
    makeClip(0.35, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = (Math.sin(2 * Math.PI * 1650 * t) + Math.sin(2 * Math.PI * 920 * t) * 0.5) * Math.exp(-t * 65);
      }
    }),
  clock_forward_tick: () =>
    makeClip(0.55, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = (Math.sin(2 * Math.PI * 880 * t) * 0.6 + Math.sin(2 * Math.PI * 1760 * t) * 0.4) * Math.exp(-t * 28);
      }
    }),
  void_vanish: () =>
    makeClip(1.1, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const f = 320 * Math.exp(-t * 2.4);
        b[i] = (Math.sin(2 * Math.PI * f * t) * 0.65 + (rand() * 2 - 1) * 0.2) * Math.exp(-t * 2.8);
      }
    }),
  whisper_riser: () =>
    makeClip(1.8, (b, n) => {
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        lp = lp * 0.92 + (rand() * 2 - 1) * 0.08;
        const env = Math.pow(t / 1.8, 1.4) * Math.exp(-Math.max(0, t - 1.55) * 10);
        b[i] = (lp * 3.5 + Math.sin(2 * Math.PI * 420 * t) * 0.15) * env;
      }
    }),
  whisper_echo: () =>
    makeClip(1.4, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const env = Math.sin((Math.PI * t) / 1.4) * Math.exp(-t * 0.8);
        b[i] = (Math.sin(2 * Math.PI * 293.66 * t) * 0.5 + Math.sin(2 * Math.PI * 587.33 * t) * 0.25 + (rand() * 2 - 1) * 0.18) * env;
      }
    }),
  footstep_corridor: () =>
    makeClip(0.35, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = (Math.sin(2 * Math.PI * 110 * t) * 0.6 + (rand() * 2 - 1) * 0.45) * Math.exp(-t * 24);
      }
    }),
  footstep_school: () =>
    makeClip(0.32, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = (Math.sin(2 * Math.PI * 150 * t) * 0.5 + (rand() * 2 - 1) * 0.35) * Math.exp(-t * 32);
      }
    }),
  riser_tension: () =>
    makeClip(2.2, (b, n) => {
      let ph = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const f = 90 + (t / 2.2) * 340;
        ph += (2 * Math.PI * f) / SR;
        b[i] = (Math.sin(ph) * 0.55 + Math.sin(ph * 1.5) * 0.25) * (t / 2.2);
      }
    }),
  heartbeat_fast: () =>
    makeClip(1.4, (b, n) => {
      const beats = [0.05, 0.28, 0.62, 0.85];
      for (const h of beats) {
        const s0 = Math.floor(h * SR);
        for (let k = 0; k < Math.floor(0.22 * SR) && s0 + k < n; k++) {
          const t = k / SR;
          b[s0 + k] += Math.sin(2 * Math.PI * 58 * t) * Math.exp(-t * 18);
        }
      }
    }),
  heartbeat_slow: () =>
    makeClip(1.2, (b, n) => {
      for (const h of [0.05, 0.36]) {
        const s0 = Math.floor(h * SR);
        for (let k = 0; k < Math.floor(0.26 * SR) && s0 + k < n; k++) {
          const t = k / SR;
          b[s0 + k] += Math.sin(2 * Math.PI * 54 * t) * Math.exp(-t * 15);
        }
      }
    }),
  silent_scream_sub: () =>
    makeClip(1.4, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const f = 180 * Math.exp(-t * 1.8) + 42;
        b[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 1.9);
      }
    }),
  gasp_wake: () =>
    makeClip(0.75, (b, n) => {
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        lp = lp * 0.78 + (rand() * 2 - 1) * 0.22;
        b[i] = (lp * 1.4 + Math.sin(2 * Math.PI * 240 * t) * 0.25) * Math.exp(-t * 5.2);
      }
    }),
  phone_pickup: () =>
    makeClip(0.35, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = (Math.sin(2 * Math.PI * 520 * t) * 0.4 + (rand() * 2 - 1) * 0.3) * Math.exp(-t * 25);
      }
    }),
  sigh_relief: () =>
    makeClip(0.9, (b, n) => {
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        lp = lp * 0.9 + (rand() * 2 - 1) * 0.1;
        b[i] = lp * Math.sin((Math.PI * t) / 0.9);
      }
    }),
  reality_chime: () =>
    makeClip(1.5, (b, n) => {
      const freqs = [587.33, 880, 1174.66];
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const env = Math.exp(-t * 2.6);
        let s = 0;
        for (const f of freqs) s += Math.sin(2 * Math.PI * f * t);
        b[i] = (s / freqs.length) * env;
      }
    }),
  brain_pulse: () =>
    makeClip(1.2, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const env = Math.sin((Math.PI * t) / 1.2);
        b[i] = (Math.sin(2 * Math.PI * 146.83 * t) * 0.55 + Math.sin(2 * Math.PI * 293.66 * t) * 0.35) * env;
      }
    }),
  eeg_sweep: () =>
    makeClip(1.4, (b, n) => {
      let ph = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const f = 320 + Math.sin(t * 7) * 120;
        ph += (2 * Math.PI * f) / SR;
        b[i] = Math.sin(ph) * Math.sin((Math.PI * t) / 1.4) * 0.6;
      }
    }),
  rem_flutter: () =>
    makeClip(1.0, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = Math.sin(2 * Math.PI * 380 * t) * (0.5 + 0.5 * Math.sin(2 * Math.PI * 14 * t)) * Math.exp(-t * 2.2);
      }
    }),
  memory_spark: () =>
    makeClip(0.9, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = (Math.sin(2 * Math.PI * 784 * t) + Math.sin(2 * Math.PI * 1174.66 * t)) * 0.5 * Math.exp(-t * 4.5);
      }
    }),
  mist_dissolve: () =>
    makeClip(2.0, (b, n) => {
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        lp = lp * 0.94 + (rand() * 2 - 1) * 0.06;
        b[i] = lp * Math.sin((Math.PI * t) / 2.0);
      }
    }),
  sparkle_scatter: () =>
    makeClip(1.2, (b, n) => {
      const notes = [880, 1046.5, 1318.5, 1568];
      notes.forEach((f, idx) => {
        const s0 = Math.floor(idx * 0.14 * SR);
        for (let k = 0; k < Math.floor(0.6 * SR) && s0 + k < n; k++) {
          const t = k / SR;
          b[s0 + k] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 6) * 0.4;
        }
      });
    }),
  synth_build: () =>
    makeClip(1.5, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const env = Math.sin((Math.PI * t) / 1.5);
        b[i] = (Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 329.63 * t) + Math.sin(2 * Math.PI * 440 * t)) * 0.33 * env;
      }
    }),
  dream_whoosh: () =>
    makeClip(0.85, (b, n) => {
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        lp = lp * 0.88 + (rand() * 2 - 1) * 0.12;
        b[i] = lp * Math.sin((Math.PI * t) / 0.85);
      }
    }),
  telekinesis_hum: () =>
    makeClip(1.2, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = (Math.sin(2 * Math.PI * 110 * t) + Math.sin(2 * Math.PI * 164.81 * t) * 0.6) * Math.sin((Math.PI * t) / 1.2);
      }
    }),
  telekinesis_creak: () =>
    makeClip(0.85, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = (Math.sin(2 * Math.PI * (340 + t * 90) * t) * 0.5 + Math.sin(2 * Math.PI * 180 * t) * 0.4) * Math.exp(-t * 3.5);
      }
    }),
  school_bell_distant: () =>
    makeClip(1.4, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const mod = 0.6 + 0.4 * Math.sin(2 * Math.PI * 18 * t);
        b[i] = (Math.sin(2 * Math.PI * 1244 * t) + Math.sin(2 * Math.PI * 1866 * t) * 0.5) * mod * Math.exp(-t * 2.1);
      }
    }),
  paper_rustle: () =>
    makeClip(0.48, (b, n) => {
      let prev = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const r = rand() * 2 - 1;
        const hp = r - prev * 0.85;
        prev = r;
        b[i] = hp * Math.sin((Math.PI * t) / 0.48) * 0.7;
      }
    }),
  tetris_bleep: () =>
    makeClip(0.32, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const f = t < 0.14 ? 523.25 : 659.25;
        b[i] = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 3 * t)) * Math.exp(-t * 9);
      }
    }),
  oud_melody: () =>
    makeClip(3.8, (b, n) => {
      // Hijaz / Maqam motif: D3 - Eb3 - F#3 - G3 - F#3 - D3
      const phrase = [
        [0.05, 146.83, 1.1],
        [0.65, 155.56, 0.9],
        [1.2, 185.0, 1.0],
        [1.8, 196.0, 1.1],
        [2.45, 185.0, 0.9],
        [3.0, 146.83, 1.3],
      ];
      for (const [start, freq, dur] of phrase) {
        const s0 = Math.floor(start * SR);
        const st = pluckString(freq, dur, 0.58);
        for (let k = 0; k < st.length && s0 + k < n; k++) b[s0 + k] += st[k] * 0.65;
      }
    }),
  oud_chord_fade: () =>
    makeClip(2.4, (b, n) => {
      for (const f of [146.83, 220.0, 293.66]) {
        const st = pluckString(f, 2.3, 0.45);
        for (let k = 0; k < st.length && k < n; k++) b[k] += st[k] * 0.45;
      }
    }),
  ground_crack: () =>
    makeClip(1.2, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const cr = Math.sin(2 * Math.PI * (90 - t * 40) * t) * Math.exp(-t * 4);
        const grit = (rand() * 2 - 1) * Math.exp(-t * 7) * 0.8;
        b[i] = cr + grit;
      }
    }),
  sky_city_ambience: () =>
    makeClip(2.5, (b, n) => {
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        lp = lp * 0.95 + (rand() * 2 - 1) * 0.05;
        b[i] = (lp * 1.5 + Math.sin(2 * Math.PI * 196 * t) * 0.12) * Math.sin((Math.PI * t) / 2.5);
      }
    }),
  train_whoosh: () =>
    makeClip(1.3, (b, n) => {
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        lp = lp * 0.88 + (rand() * 2 - 1) * 0.12;
        const env = Math.sin((Math.PI * t) / 1.3);
        b[i] = (lp + Math.sin(2 * Math.PI * (180 + Math.sin(t * 3) * 40) * t) * 0.25) * env;
      }
    }),
  laugh_soft: () =>
    makeClip(0.7, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const env = Math.exp(-t * 4.5);
        b[i] = (Math.sin(2 * Math.PI * 440 * t) + Math.sin(2 * Math.PI * 554.37 * t)) * 0.45 * env;
      }
    }),
  hypnic_jerk: () =>
    makeClip(0.85, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const f = 140 * Math.exp(-t * 7) + 42;
        b[i] = (Math.sin(2 * Math.PI * f * t) * 0.85 + (rand() * 2 - 1) * Math.exp(-t * 14) * 0.6) * Math.exp(-t * 4);
      }
    }),
  bed_jolt: () =>
    makeClip(0.6, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = (Math.sin(2 * Math.PI * 82 * t) * 0.8 + (rand() * 2 - 1) * 0.45) * Math.exp(-t * 9);
      }
    }),
  lucid_chord: () =>
    makeClip(2.4, (b, n) => {
      const chord = [293.66, 369.99, 440.0, 554.37, 659.25]; // D major 9
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const env = Math.min(1, t / 0.15) * Math.exp(-Math.max(0, t - 0.15) * 1.1);
        let s = 0;
        for (const f of chord) s += Math.sin(2 * Math.PI * f * t);
        b[i] = (s / chord.length) * env;
      }
    }),
  lucid_ascend: () =>
    makeClip(1.8, (b, n) => {
      const chord = [293.66, 440.0, 587.33, 739.99];
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const glide = 1 + t * 0.08;
        const env = Math.sin((Math.PI * t) / 1.8);
        let s = 0;
        for (const f of chord) s += Math.sin(2 * Math.PI * f * glide * t);
        b[i] = (s / chord.length) * env;
      }
    }),
  sign_shimmer: () =>
    makeClip(0.9, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = (Math.sin(2 * Math.PI * 987.77 * t) + Math.sin(2 * Math.PI * 1479.98 * t)) * 0.5 * Math.exp(-t * 4);
      }
    }),
  sign_flip: () =>
    makeClip(0.85, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = (Math.sin(2 * Math.PI * (659.25 + t * 440) * t) * 0.6 + (rand() * 2 - 1) * 0.25) * Math.exp(-t * 5);
      }
    }),
  hand_tap_wood: () =>
    makeClip(0.35, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        b[i] = (Math.sin(2 * Math.PI * 165 * t) * 0.7 + (rand() * 2 - 1) * 0.3) * Math.exp(-t * 32);
      }
    }),
  power_off_void: () =>
    makeClip(1.6, (b, n) => {
      let ph = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const f = Math.max(32, 320 * Math.exp(-t * 2.1));
        ph += (2 * Math.PI * f) / SR;
        b[i] = Math.sin(ph) * Math.exp(-t * 1.9);
      }
    }),
  ac_hum: () =>
    makeClip(2.4, (b, n) => {
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        lp = lp * 0.96 + (rand() * 2 - 1) * 0.04;
        b[i] = (lp + Math.sin(2 * Math.PI * 120 * t) * 0.15) * Math.sin((Math.PI * t) / 2.4);
      }
    }),
  curtain_open: () =>
    makeClip(0.85, (b, n) => {
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        lp = lp * 0.8 + (rand() * 2 - 1) * 0.2;
        b[i] = lp * Math.sin((Math.PI * t) / 0.85);
      }
    }),
  morning_birds: () =>
    makeClip(2.4, (b, n) => {
      const chirps = [
        [0.15, 2400, 2900],
        [0.42, 2600, 3200],
        [0.95, 2200, 2800],
        [1.4, 2700, 3400],
        [1.85, 2500, 3000],
      ];
      for (const [st, f0, f1] of chirps) {
        const s0 = Math.floor(st * SR);
        for (let k = 0; k < Math.floor(0.16 * SR) && s0 + k < n; k++) {
          const t = k / SR;
          const f = f0 + (f1 - f0) * Math.sin((Math.PI * t) / 0.16);
          b[s0 + k] += Math.sin(2 * Math.PI * f * t) * Math.sin((Math.PI * t) / 0.16) * 0.65;
        }
      }
    }),
  phone_dial_ring: () =>
    makeClip(1.4, (b, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        if (t < 0.75) {
          b[i] = (Math.sin(2 * Math.PI * 440 * t) + Math.sin(2 * Math.PI * 480 * t)) * 0.35 * Math.sin((Math.PI * t) / 0.75);
        }
      }
    }),
};

const storyboard = JSON.parse(fs.readFileSync(STORYBOARD_PATH, 'utf8'));
const neededClips = new Set();
for (const sc of storyboard) {
  for (const ev of sc.sfxEvents) neededClips.add(ev.clip);
}

const clipAudio = {};
const tmpWav = path.join(PUB_DIR, '_tmp.wav');
let synthesizedCount = 0;

for (const name of neededClips) {
  const existing = findLib(name);
  if (existing) {
    clipAudio[name] = decodeToFloat(path.join(SFX_LIB, existing));
  } else if (SYNTH_RECIPES[name]) {
    const pcm = SYNTH_RECIPES[name]();
    writeWav(tmpWav, pcm);
    const outMp3 = path.join(SFX_LIB, `${name}.mp3`);
    encodeMp3(tmpWav, outMp3);
    clipAudio[name] = pcm;
    synthesizedCount++;
  } else {
    throw new Error(`Missing SFX recipe or library clip: ${name}`);
  }
}
console.log(`SFX library ready: ${neededClips.size} unique clips (${synthesizedCount} newly synthesized)`);

// 2. Decode voiceover & compute smooth speech ducking envelope
const voicePcm = decodeToFloat(VOICE_PATH);
const TOTAL_SAMPLES = voicePcm.length;
const TOTAL_SECS = TOTAL_SAMPLES / SR;
const ENV_STEP = Math.floor(SR / 100); // 10ms envelope resolution
const envLen = Math.ceil(TOTAL_SAMPLES / ENV_STEP);
const speechEnv = new Float32Array(envLen);

for (let i = 0; i < envLen; i++) {
  let sum = 0;
  const s0 = i * ENV_STEP;
  const s1 = Math.min(TOTAL_SAMPLES, s0 + ENV_STEP);
  for (let j = s0; j < s1; j++) sum += voicePcm[j] * voicePcm[j];
  const rms = Math.sqrt(sum / Math.max(1, s1 - s0));
  speechEnv[i] = rms > 0.018 ? 1.0 : 0.0;
}
// Smooth ducking envelope (fast attack ~60ms, gentle release ~450ms)
const duckGain = new Float32Array(envLen);
let curDuck = 1.0;
for (let i = 0; i < envLen; i++) {
  const target = speechEnv[i] > 0.5 ? 0.34 : 0.92; // ~ -8.6 dB during speech
  const coeff = target < curDuck ? 0.28 : 0.045;
  curDuck += (target - curDuck) * coeff;
  duckGain[i] = curDuck;
}

// 3. Mix frame-accurate SFX stem
const sfxMix = new Float32Array(TOTAL_SAMPLES);
for (const sc of storyboard) {
  for (const ev of sc.sfxEvents) {
    const clip = clipAudio[ev.clip];
    const startIdx = Math.floor((ev.triggerFrame / FPS) * SR);
    for (let i = 0; i < clip.length && startIdx + i < TOTAL_SAMPLES; i++) {
      if (startIdx + i >= 0) {
        sfxMix[startIdx + i] += clip[i] * ev.gain;
      }
    }
  }
}
// Soft clip limiter on SFX
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  sfxMix[i] = Math.tanh(sfxMix[i] * 0.95) * 0.85;
}
const sfxWav = path.join(PUB_DIR, 'sfx.wav');
const sfxMp3 = path.join(PUB_DIR, 'sfx.mp3');
writeWav(sfxWav, sfxMix);
encodeMp3(sfxWav, sfxMp3);
fs.unlinkSync(sfxWav);
fs.copyFileSync(sfxMp3, path.join(ROOT_PUB, `${SLUG}-sfx.mp3`));
console.log(`Mixed SFX stem: ${sfxMp3}`);

// 4. Original Act I Cinematic Music kept unchanged, played ONLY during the intro (0.0s -> 10.2s)
const musicMix = new Float32Array(TOTAL_SAMPLES);
const INTRO_FADE_START = 7.8;
const INTRO_END = 10.2;
const introSamples = Math.min(TOTAL_SAMPLES, Math.floor(INTRO_END * SR));
const introSec = { t0: 0, t1: 63.4, notes: [146.83, 220.0, 349.23], pulseHz: 0.5, bright: 0.28, vol: 0.38 };

for (let i = 0; i < introSamples; i++) {
  const t = i / SR;
  const fadeIn = Math.min(1, (t - introSec.t0) / 2.5);
  let pad = 0;
  for (let k = 0; k < introSec.notes.length; k++) {
    const f = introSec.notes[k];
    const vibrato = 1 + 0.0018 * Math.sin(2 * Math.PI * (0.25 + k * 0.11) * t);
    pad += Math.sin(2 * Math.PI * f * vibrato * t) * (1 / (1 + k * 0.25));
    pad += Math.sin(2 * Math.PI * f * 2 * vibrato * t) * introSec.bright * 0.14;
  }
  const pulse = 0.72 + 0.28 * Math.sin(2 * Math.PI * introSec.pulseHz * t);
  const envIdx = Math.min(envLen - 1, Math.floor(i / ENV_STEP));
  musicMix[i] += (pad / introSec.notes.length) * pulse * introSec.vol * fadeIn * duckGain[envIdx];
}

// Original sparse musical bell/arp accents every 3.2s within the intro
for (let step = 0; step * 3.2 < INTRO_END; step++) {
  const t0 = step * 3.2 + 0.4;
  if (t0 >= INTRO_END) continue;
  const note = introSec.notes[(step * 3) % introSec.notes.length] * 2;
  const s0 = Math.floor(t0 * SR);
  const st = pluckString(note, 2.2, 0.38);
  for (let k = 0; k < st.length && s0 + k < introSamples; k++) {
    const envIdx = Math.min(envLen - 1, Math.floor((s0 + k) / ENV_STEP));
    musicMix[s0 + k] += st[k] * 0.16 * duckGain[envIdx];
  }
}

// Original gentle master fade-in (1.5s) + smooth intro fade-out (7.8s -> 10.2s)
for (let i = 0; i < introSamples; i++) {
  const t = i / SR;
  const mIn = Math.min(1, t / 1.5);
  const mOut = t <= INTRO_FADE_START ? 1 : Math.max(0, 1 - (t - INTRO_FADE_START) / (INTRO_END - INTRO_FADE_START));
  musicMix[i] = Math.tanh(musicMix[i] * 1.1) * 0.72 * mIn * mOut;
}

const musicWav = path.join(PUB_DIR, 'music.wav');
const musicMp3 = path.join(PUB_DIR, 'music.mp3');
writeWav(musicWav, musicMix);
encodeMp3(musicWav, musicMp3);
fs.unlinkSync(musicWav);
if (fs.existsSync(tmpWav)) fs.unlinkSync(tmpWav);
fs.copyFileSync(musicMp3, path.join(ROOT_PUB, `${SLUG}-music.mp3`));
console.log(`Mixed original intro-only music stem (0.0s-${INTRO_END}s, total ${TOTAL_SECS.toFixed(2)}s): ${musicMp3}`);

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
  DEFAULT_SAMPLE_RATE,
  applyVoiceCharacterPresets,
  buildHorrorStingSamples,
  readWavMono,
} from '../src/engine/voice_fx.mjs';
import {
  buildClockTickSample,
  buildSubRiserSamples,
  computeVoiceDuckEnvelope,
  mixSpatialSfxEvent,
  renderDynamicHorrorScore,
} from '../src/engine/audio_engine.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const STUDIO_DIR = path.join(ROOT, 'studio');
const SRC_AUDIO = path.join(ROOT, 'public/assets/aistudio/tts-output_10__5aad1f8e.mp3');
const SLUG = 'khizanat-al-ghurfa';
const PUB_DIR = path.join(STUDIO_DIR, 'public', SLUG);
const ROOT_PUB = path.join(ROOT, 'public');
const SFX_DIR = path.join(STUDIO_DIR, 'library/sfx/amberframe');
const EP_DIR = path.join(STUDIO_DIR, 'src/episodes', SLUG);

fs.mkdirSync(PUB_DIR, { recursive: true });
fs.mkdirSync(SFX_DIR, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(EP_DIR, 'manifest.json'), 'utf8'));

const SR = DEFAULT_SAMPLE_RATE;
const FPS = manifest.fps || 30;
const TOTAL_FRAMES = manifest.totalFrames || 960;
const TOTAL_SECS = TOTAL_FRAMES / FPS;
const TOTAL_SAMPLES = Math.round(TOTAL_SECS * SR);

const randSeed = (seed) => {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
};

function writeWav(filePath, samples) {
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
}

function writeWavStereo(filePath, left, right) {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(r * 32767), 44 + i * 4 + 2);
  }
  fs.writeFileSync(filePath, buf);
}

function encodeMp3(wavPath, mp3Path) {
  execSync(`ffmpeg -y -v error -i "${wavPath}" -codec:a libmp3lame -b:a 192k -ar ${SR} "${mp3Path}"`);
}

function makeClip(durSec, fn) {
  const n = Math.floor(durSec * SR);
  const b = new Float32Array(n);
  fn(b, n);
  return b;
}

// 1. Non-destructive Master Narration + 100% Wet Character Voice FX
const rawWav = path.join(PUB_DIR, '_raw_voice.wav');
const voiceWav = path.join(PUB_DIR, 'voice.wav');
const voiceMp3 = path.join(PUB_DIR, 'voice.mp3');

execSync(`ffmpeg -y -v error -i "${SRC_AUDIO}" -ac 1 -ar ${SR} "${rawWav}"`);
const rawSamples = readWavMono(rawWav);

const voiceMix = applyVoiceCharacterPresets({
  rawWavPath: rawWav,
  rawSamples,
  totalSamples: TOTAL_SAMPLES,
  sampleRate: SR,
  tempDir: PUB_DIR,
  segments: manifest.voiceSegments ?? [],
});

writeWav(voiceWav, voiceMix);
encodeMp3(voiceWav, voiceMp3);
fs.copyFileSync(voiceMp3, path.join(ROOT_PUB, `${SLUG}-voice.mp3`));
fs.unlinkSync(rawWav);
fs.unlinkSync(voiceWav);

const { duckGain, envStep } = computeVoiceDuckEnvelope(voiceMix, TOTAL_SAMPLES, SR, 0.02);

// 2. Upgraded Reusable AmberFrame SFX Library
const SFX_SPECS = [
  {
    clip: 'room_tone_bedroom',
    category: 'room-ambience',
    purpose: 'Midnight bedroom room air bed (subtle acoustic warmth without dead digital floor)',
    material: 'air',
    environment: 'bedroom-night',
    mood: 'quiet-suspense',
    durationSec: 4.0,
    build: () =>
      makeClip(4.0, (b, n) => {
        const rand = randSeed(101);
        let lp = 0;
        let lp2 = 0;
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          lp = lp * 0.985 + (rand() * 2 - 1) * 0.015;
          lp2 = lp2 * 0.96 + lp * 0.04;
          const hum = Math.sin(2 * Math.PI * 58 * t) * 0.012 + Math.sin(2 * Math.PI * 116 * t) * 0.004;
          const env = Math.min(1, t / 0.3, (4.0 - t) / 0.3);
          b[i] = (lp2 * 2.2 + hum) * env * 0.35;
        }
      }),
  },
  {
    clip: 'clock_tick',
    category: 'room-ambience',
    purpose: 'Crisp quiet nightstand quartz clock tick building nocturnal dread before dead silence',
    material: 'plastic-quartz',
    environment: 'bedroom-night',
    mood: 'suspense',
    durationSec: 0.085,
    build: () => buildClockTickSample(SR, 1),
  },
  {
    clip: 'closet_breath',
    category: 'psychological-tension',
    purpose: 'Muffled raspy inhale/exhale inside closed wooden wardrobe with subtle latch vibration',
    material: 'wood-cavity',
    environment: 'closet-occluded',
    mood: 'eerie',
    durationSec: 2.7,
    build: () =>
      makeClip(2.7, (b, n) => {
        const rand = randSeed(202);
        let lp = 0;
        let lp2 = 0;
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          const inh = Math.exp(-Math.pow((t - 0.55) / 0.23, 2));
          const exh = Math.exp(-Math.pow((t - 1.52) / 0.38, 2));
          const env = inh * 0.65 + exh * 0.96;
          const white = rand() * 2 - 1;
          lp = lp * 0.88 + white * 0.12;
          lp2 = lp2 * 0.94 + lp * 0.06;
          const rasp = Math.sin(2 * Math.PI * 145 * t + Math.sin(2 * Math.PI * 18 * t) * 0.85) * 0.055;
          const latchTap = Math.exp(-Math.pow((t - 1.35) / 0.018, 2)) * Math.sin(2 * Math.PI * 310 * t) * 0.14;
          b[i] = ((lp2 * 2.6 + rasp) * env + latchTap) * 0.74;
        }
      }),
  },
  {
    clip: 'closet_creak_slow',
    category: 'doors-furniture',
    purpose: 'Slow dry wooden wardrobe hinge creak as door creeps ajar',
    material: 'aged-wood-hinge',
    environment: 'bedroom-night',
    mood: 'tense',
    durationSec: 2.05,
    build: () =>
      makeClip(2.05, (b, n) => {
        const rand = randSeed(303);
        let phase = 0;
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          const stick = Math.max(0, Math.sin(2 * Math.PI * (9.5 - t * 2.2) * t));
          const pitch = 290 + 110 * Math.sin(t * 2.7) + stick * 35;
          phase += (2 * Math.PI * pitch) / SR;
          const tone = Math.sin(phase) * 0.45 + Math.sin(phase * 2.02) * 0.25 + (rand() * 2 - 1) * 0.06;
          const env = Math.sin((Math.PI * t) / 2.05) * (0.38 + 0.62 * Math.pow(stick, 1.5));
          b[i] = tone * env * 0.44;
        }
      }),
  },
  {
    clip: 'bed_rustle',
    category: 'clothing-motion',
    purpose: 'Cotton duvet & pillow/mattress shift',
    material: 'fabric-cotton',
    environment: 'bedroom-night',
    mood: 'neutral',
    durationSec: 0.9,
    build: () =>
      makeClip(0.9, (b, n) => {
        const rand = randSeed(404);
        let lp = 0;
        let hp = 0;
        let prev = 0;
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          const w = rand() * 2 - 1;
          lp = lp * 0.8 + w * 0.2;
          hp = lp - prev * 0.72;
          prev = lp;
          const thud = Math.sin(2 * Math.PI * 68 * t) * Math.exp(-t * 9) * 0.22;
          const env = Math.sin((Math.PI * t) / 0.9);
          b[i] = (hp * 1.4 + thud) * env * 0.5;
        }
      }),
  },
  ...[1, 2, 3, 4, 5].map((idx) => ({
    clip: `step_wood_${idx}`,
    category: 'footsteps',
    purpose: `Soft bare/socked footstep on wooden floorboards (variation ${idx})`,
    material: 'wood',
    environment: 'bedroom-night',
    mood: 'tense',
    durationSec: 0.24,
    build: () =>
      makeClip(0.24, (b, n) => {
        const rand = randSeed(500 + idx * 37);
        const f0 = 78 + idx * 7;
        let lp = 0;
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          lp = lp * 0.84 + (rand() * 2 - 1) * 0.16;
          const heel = Math.sin(2 * Math.PI * (f0 - t * 90) * t) * Math.exp(-t * 28);
          const woodRes = Math.sin(2 * Math.PI * (185 + idx * 12) * t) * Math.exp(-t * 36) * 0.45;
          const scuff = lp * Math.exp(-t * 24) * 0.55;
          b[i] = (heel * 0.65 + woodRes + scuff) * 0.54;
        }
      }),
  })),
  {
    clip: 'closet_whisper_air',
    category: 'psychological-tension',
    purpose: 'Eerie close airy whisper tail drifting out from wardrobe slit',
    material: 'air',
    environment: 'bedroom-close',
    mood: 'dread',
    durationSec: 1.35,
    build: () =>
      makeClip(1.35, (b, n) => {
        const rand = randSeed(606);
        let bp1 = 0;
        let bp2 = 0;
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          const w = rand() * 2 - 1;
          bp1 = bp1 * 0.91 + w * 0.09;
          bp2 = bp2 * 0.72 + (w - bp1) * 0.28;
          const cadence = 0.55 + 0.45 * Math.sin(2 * Math.PI * 1.65 * t);
          const env = Math.sin((Math.PI * t) / 1.35) * cadence;
          b[i] = (bp2 * 1.5 + Math.sin(2 * Math.PI * 310 * t) * 0.022) * env * 0.56;
        }
      }),
  },
  {
    clip: 'riser_horror_swell',
    category: 'horror-stings',
    purpose: 'Ascending bowed sub-riser building anticipation right before phone ring shock cut',
    material: 'strings-air',
    environment: 'non-diegetic',
    mood: 'dread',
    durationSec: 1.15,
    build: () => buildSubRiserSamples(1.15, SR, 777),
  },
  {
    clip: 'phone_ring_vibrate',
    category: 'phones-radios',
    purpose: 'Smartphone sudden ring chime & physical wood nightstand vibration buzz',
    material: 'glass-wood-table',
    environment: 'bedroom-night',
    mood: 'shock',
    durationSec: 2.95,
    build: () =>
      makeClip(2.95, (b, n) => {
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          const burst = (t % 0.95) < 0.68 ? 1 : 0;
          const subT = t % 0.95;
          const tone1 = Math.sin(2 * Math.PI * 880 * t) * Math.exp(-subT * 7) * 0.42;
          const tone2 = subT > 0.14 ? Math.sin(2 * Math.PI * 1174.66 * t) * Math.exp(-(subT - 0.14) * 6) * 0.42 : 0;
          const woodBuzz = Math.sin(2 * Math.PI * 138 * t) * 0.3 * (0.65 + 0.35 * Math.sin(2 * Math.PI * 26 * t));
          const env = Math.min(1, t / 0.015, (2.95 - t) / 0.08) * burst;
          b[i] = (tone1 + tone2 + woodBuzz) * env * 0.7;
        }
      }),
  },
  {
    clip: 'phone_pickup_tap',
    category: 'phones-radios',
    purpose: 'Tactile screen tap answering incoming call',
    material: 'glass',
    environment: 'bedroom-close',
    mood: 'urgent',
    durationSec: 0.16,
    build: () =>
      makeClip(0.16, (b, n) => {
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          const click = Math.sin(2 * Math.PI * 1420 * t) * Math.exp(-t * 65) * 0.45;
          const body = Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 40) * 0.35;
          b[i] = (click + body) * 0.74;
        }
      }),
  },
  {
    clip: 'phone_earpiece_crackle',
    category: 'phones-radios',
    purpose: 'Telephone earpiece carrier noise & cellular coil crackle floor',
    material: 'speaker-coil',
    environment: 'phone-earpiece',
    mood: 'eerie',
    durationSec: 6.8,
    build: () =>
      makeClip(6.8, (b, n) => {
        const rand = randSeed(707);
        let bp = 0;
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          const w = rand() * 2 - 1;
          bp = bp * 0.72 + w * 0.28;
          const pop = rand() > 0.9992 ? (rand() * 2 - 1) * 0.42 : 0;
          const activeCall = t >= 4.5 ? 1.55 : 0.75;
          const env = Math.min(1, t / 0.12, (6.8 - t) / 0.15) * activeCall;
          b[i] = (bp * 0.14 + pop + Math.sin(2 * Math.PI * 217 * t) * 0.018) * env;
        }
      }),
  },
  {
    clip: 'closet_creak_wide',
    category: 'doors-furniture',
    purpose: 'Deep heavy wooden wardrobe door groan swinging open in dead silence',
    material: 'heavy-wood-hinge',
    environment: 'bedroom-night',
    mood: 'terror',
    durationSec: 1.75,
    build: () =>
      makeClip(1.75, (b, n) => {
        const rand = randSeed(808);
        let phase = 0;
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          const groans = 0.55 + 0.45 * Math.sin(2 * Math.PI * 5.2 * t);
          const f = 165 + 48 * Math.sin(t * 3.1) - t * 24;
          phase += (2 * Math.PI * f) / SR;
          const body = Math.sin(phase) * 0.5 + Math.sin(phase * 1.98) * 0.25 + (rand() * 2 - 1) * 0.05;
          const env = Math.sin((Math.PI * t) / 1.75) * groans;
          b[i] = body * env * 0.58;
        }
      }),
  },
  {
    clip: 'closet_inner_presence',
    category: 'psychological-tension',
    purpose: 'Hollow acoustic closet-cavity air pressure shift framing entity presence',
    material: 'wood-cavity',
    environment: 'closet-open',
    mood: 'climax',
    durationSec: 1.75,
    build: () =>
      makeClip(1.75, (b, n) => {
        const rand = randSeed(909);
        let lp = 0;
        for (let i = 0; i < n; i++) {
          const t = i / SR;
          lp = lp * 0.94 + (rand() * 2 - 1) * 0.06;
          const sub = Math.sin(2 * Math.PI * 52 * t) * 0.32;
          const env = Math.min(1, t / 0.14, (1.75 - t) / 0.25);
          b[i] = (lp * 1.45 + sub) * env * 0.54;
        }
      }),
  },
  {
    clip: 'horror_sting_climax',
    category: 'horror-stings',
    purpose: 'Visceral post-dialogue horror sting (chest sub-boom + dissonant bowed screech) firing right after terrifying twist',
    material: 'sub-brass-metal',
    environment: 'dark-void-impact',
    mood: 'horror-climax',
    durationSec: 1.5,
    build: () => buildHorrorStingSamples(1.5, SR, 1313),
  },
];

const catalog = [];
const clipMap = new Map();
for (const spec of SFX_SPECS) {
  const samples = spec.build();
  const wavOut = path.join(SFX_DIR, `${spec.clip}.wav`);
  writeWav(wavOut, samples);
  clipMap.set(spec.clip, samples);
  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  catalog.push({
    clip: spec.clip,
    file: `${spec.clip}.wav`,
    category: spec.category,
    purpose: spec.purpose,
    material: spec.material,
    environment: spec.environment,
    mood: spec.mood,
    durationSec: Number(spec.durationSec.toFixed(2)),
    peakLinear: Number(peak.toFixed(3)),
    channels: 1,
    loopable: spec.clip === 'room_tone_bedroom',
  });
}
fs.writeFileSync(path.join(SFX_DIR, 'sfx_catalog.json'), JSON.stringify(catalog, null, 2));

// 3. Spatial Binaural Stereo SFX Mix (Haas delay + early bedroom reflections)
const sfxL = new Float32Array(TOTAL_SAMPLES);
const sfxR = new Float32Array(TOTAL_SAMPLES);

const rt = clipMap.get('room_tone_bedroom');
if (rt) {
  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SR;
    const sample = rt[i % rt.length] * (t > 21.8 && t < 28.85 ? 0.52 : 0.9);
    sfxL[i] += sample * 0.34;
    sfxR[i] += sample * 0.34;
  }
}

for (const sc of manifest.scenes) {
  for (const ev of sc.sfx) {
    if (ev.clip === 'room_tone_bedroom') continue;
    const clip = clipMap.get(ev.clip);
    if (!clip) throw new Error(`Missing SFX asset: ${ev.clip}`);
    mixSpatialSfxEvent({
      sfxL,
      sfxR,
      clip,
      startFrame: ev.startFrame,
      fps: FPS,
      sampleRate: SR,
      spatialPan: ev.spatialPan ?? 0,
      distance: ev.distance ?? 0.3,
      gain: ev.gain,
      roomReflect: ev.category === 'non-diegetic' ? 0.04 : 0.18,
    });
  }
}

for (let i = 0; i < TOTAL_SAMPLES; i++) {
  sfxL[i] = Math.tanh(sfxL[i] * 0.94) * 0.88;
  sfxR[i] = Math.tanh(sfxR[i] * 0.94) * 0.88;
}

const sfxWav = path.join(PUB_DIR, 'sfx.wav');
const sfxMp3 = path.join(PUB_DIR, 'sfx.mp3');
writeWavStereo(sfxWav, sfxL, sfxR);
encodeMp3(sfxWav, sfxMp3);
fs.unlinkSync(sfxWav);
fs.copyFileSync(sfxMp3, path.join(ROOT_PUB, `${SLUG}-sfx.mp3`));

// 4. Multi-Harmonic Dynamic Bowed Score + Heartbeat + Intentional Silence (21.82s -> 28.85s)
const musicMix = renderDynamicHorrorScore({
  totalSamples: TOTAL_SAMPLES,
  sampleRate: SR,
  duckGain,
  envStep,
  silenceStartSec: 21.82,
  silenceEndSec: 28.85,
  climaxStingSec: 30.5,
});

const musicWav = path.join(PUB_DIR, 'music.wav');
const musicMp3 = path.join(PUB_DIR, 'music.mp3');
writeWav(musicWav, musicMix);
encodeMp3(musicWav, musicMp3);
fs.unlinkSync(musicWav);
fs.copyFileSync(musicMp3, path.join(ROOT_PUB, `${SLUG}-music.mp3`));

console.log(
  `AmberFrame spatial audio ready: ${SFX_SPECS.length} SFX clips, ${manifest.voiceSegments?.length ?? 0} VoiceFX, Haas spatial sfx.mp3, multi-harmonic bowed + heartbeat music.mp3 (${TOTAL_SECS}s)`,
);

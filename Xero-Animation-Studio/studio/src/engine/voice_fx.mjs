import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const DEFAULT_SAMPLE_RATE = 44100;

export function readWavMono(filePath) {
  const buf = fs.readFileSync(filePath);
  const dataOffset = buf.indexOf(Buffer.from('data'));
  if (dataOffset < 0) throw new Error(`Invalid WAV file (no data chunk): ${filePath}`);
  const start = dataOffset + 8;
  const count = Math.floor((buf.length - start) / 2);
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    out[i] = buf.readInt16LE(start + i * 2) / 32768;
  }
  return out;
}

function semitoneRatio(semitones) {
  return Math.pow(2, semitones / 12);
}

/**
 * Generates an aligned pitch-shifted + filtered mono Float32Array over the entire input WAV
 * using FFmpeg asetrate/atempo (exact duration preservation) + acoustic character filter chain.
 */
function renderShiftedLayer(rawWavPath, tmpOutPath, sr, pitchSemitones, extraFilters = []) {
  const ratio = semitoneRatio(pitchSemitones);
  const filters = [];
  if (Math.abs(pitchSemitones) > 0.01) {
    const targetRate = Math.max(12000, Math.round(sr * ratio));
    const tempo = 1 / ratio;
    // atempo accepts 0.5..2.0; clamp or chain if extreme
    filters.push(`asetrate=${targetRate},aresample=${sr},atempo=${tempo.toFixed(6)}`);
  }
  for (const f of extraFilters) {
    if (f) filters.push(f);
  }
  const args = ['-y', '-v', 'error', '-i', rawWavPath];
  if (filters.length > 0) {
    args.push('-af', filters.join(','));
  }
  args.push('-ac', '1', '-ar', String(sr), tmpOutPath);
  execFileSync('ffmpeg', args);
  return readWavMono(tmpOutPath);
}

/**
 * Reusable AmberFrame Character & Perspective Voice Processor.
 *
 * Non-destructively transforms isolated character dialogue windows inside the authoritative
 * narration while keeping clean narrator lines untouched:
 * - 'telephone-caller': Older/strained voice shift (-1.6st default) + 430-2600Hz bandpass + speaker
 *   harmonic saturation + GSM compression + subtle cellular earpiece static (100% wet).
 * - 'closet-horror-entity': Deep terrifying character shift (-3.8st default) + -7st sub-shadow
 *   double + hollow wooden enclosure reverb + eerie crisp air resonance (100% wet).
 * - 'vintage-recorder': Slight pitch drop + analog tape flutter bandpass + mechanical hiss.
 * - 'behind-door': Low-passed occluded cavity voice behind solid wood barrier.
 */
export function applyVoiceCharacterPresets({
  rawWavPath,
  rawSamples,
  totalSamples,
  sampleRate = DEFAULT_SAMPLE_RATE,
  tempDir,
  segments = [],
}) {
  const out = new Float32Array(totalSamples);
  const copyLen = Math.min(rawSamples.length, totalSamples);
  for (let i = 0; i < copyLen; i++) {
    out[i] = rawSamples[i];
  }

  // Deterministic pseudo-random generator for line crackle / tape hiss
  let seed = 918273;
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };

  for (let idx = 0; idx < segments.length; idx++) {
    const seg = segments[idx];
    if (!seg || seg.preset === 'narrator-clean') continue;

    const fadeSec = seg.fadeSec ?? 0.028;
    const wetMix = Math.max(0, Math.min(1, seg.wetMix ?? 1.0));
    const sStart = Math.max(0, Math.floor(seg.startSec * sampleRate));
    const sEnd = Math.min(totalSamples, Math.ceil(seg.endSec * sampleRate));
    if (sEnd <= sStart) continue;

    if (seg.preset === 'telephone-caller') {
      const pitch = seg.pitchSemitones ?? -2.2;
      const tmpPhone = path.join(tempDir, `_fx_phone_${idx}.wav`);
      const phoneLayer = renderShiftedLayer(rawWavPath, tmpPhone, sampleRate, pitch, [
        'highpass=f=480',
        'lowpass=f=2450',
        'equalizer=f=1180:width_type=h:width=600:g=8.5',
        'equalizer=f=2050:width_type=h:width=480:g=4.5',
        'acompressor=threshold=-22dB:ratio=7:attack=2:release=28:makeup=5dB',
      ]);
      if (fs.existsSync(tmpPhone)) fs.unlinkSync(tmpPhone);

      let lpNoise = 0;
      for (let i = sStart; i < sEnd && i < phoneLayer.length; i++) {
        const t = i / sampleRate;
        const inF = Math.min(1, (t - seg.startSec) / fadeSec);
        const outF = Math.min(1, (seg.endSec - t) / fadeSec);
        const env = Math.max(0, Math.min(1, inF, outF));
        const wet = wetMix * env;

        // Micro-speaker harmonic grit + subtle cellular GSM static
        const saturated = Math.tanh(phoneLayer[i] * 2.8) * 0.8;
        const white = nextRand() * 2 - 1;
        lpNoise = lpNoise * 0.65 + white * 0.35;
        const gsmBuzz =
          Math.sin(2 * Math.PI * 217 * t) * 0.011 +
          Math.sin(2 * Math.PI * 60 * t) * 0.007 +
          lpNoise * 0.022;
        const wetSignal = Math.max(-0.98, Math.min(0.98, saturated * 1.24 + gsmBuzz * env));
        out[i] = out[i] * (1 - wet) + wetSignal * wet;
      }
    } else if (seg.preset === 'closet-horror-entity') {
      const pitch = seg.pitchSemitones ?? -3.8;
      const tmpMain = path.join(tempDir, `_fx_horror_main_${idx}.wav`);
      const tmpSub = path.join(tempDir, `_fx_horror_sub_${idx}.wav`);

      const mainLayer = renderShiftedLayer(rawWavPath, tmpMain, sampleRate, pitch, [
        'highpass=f=75',
        'equalizer=f=220:width_type=h:width=150:g=5.5',
        'equalizer=f=880:width_type=h:width=480:g=-3.0',
        'equalizer=f=3050:width_type=h:width=1100:g=5.5',
        'aecho=0.82:0.74:14|31|59:0.34|0.24|0.16',
        'acompressor=threshold=-22dB:ratio=4.5:attack=4:release=45:makeup=5.5dB',
      ]);

      const subLayer = renderShiftedLayer(rawWavPath, tmpSub, sampleRate, -7.0, [
        'lowpass=f=540',
        'equalizer=f=135:width_type=h:width=100:g=6.0',
        'aecho=0.8:0.7:18|42:0.35|0.22',
      ]);

      if (fs.existsSync(tmpMain)) fs.unlinkSync(tmpMain);
      if (fs.existsSync(tmpSub)) fs.unlinkSync(tmpSub);

      for (let i = sStart; i < sEnd && i < mainLayer.length; i++) {
        const t = i / sampleRate;
        const inF = Math.min(1, (t - seg.startSec) / fadeSec);
        const outF = Math.min(1, (seg.endSec - t) / fadeSec);
        const env = Math.max(0, Math.min(1, inF, outF));
        const wet = wetMix * env;

        const sub = i < subLayer.length ? subLayer[i] : 0;
        const mod = 0.91 + 0.09 * Math.sin(2 * Math.PI * 29 * t);
        const breathGrit = (nextRand() * 2 - 1) * Math.min(0.07, Math.abs(mainLayer[i]) * 0.14);
        const combined = Math.tanh((mainLayer[i] * 1.38 * mod + sub * 0.52 + breathGrit) * 1.32) * 0.96;
        out[i] = out[i] * (1 - wet) + combined * wet;
      }
    } else if (seg.preset === 'vintage-recorder') {
      const pitch = seg.pitchSemitones ?? -0.8;
      const tmpTape = path.join(tempDir, `_fx_tape_${idx}.wav`);
      const tapeLayer = renderShiftedLayer(rawWavPath, tmpTape, sampleRate, pitch, [
        'highpass=f=320',
        'lowpass=f=3100',
        'aecho=0.8:0.6:22:0.2',
        'acompressor=threshold=-20dB:ratio=4:attack=3:release=35:makeup=3dB',
      ]);
      if (fs.existsSync(tmpTape)) fs.unlinkSync(tmpTape);

      for (let i = sStart; i < sEnd && i < tapeLayer.length; i++) {
        const t = i / sampleRate;
        const inF = Math.min(1, (t - seg.startSec) / fadeSec);
        const outF = Math.min(1, (seg.endSec - t) / fadeSec);
        const wet = wetMix * Math.max(0, Math.min(1, inF, outF));
        const hiss = (nextRand() * 2 - 1) * 0.012;
        const val = Math.tanh(tapeLayer[i] * 1.6) * 0.86 + hiss;
        out[i] = out[i] * (1 - wet) + val * wet;
      }
    } else if (seg.preset === 'behind-door') {
      const pitch = seg.pitchSemitones ?? -1.2;
      const tmpDoor = path.join(tempDir, `_fx_door_${idx}.wav`);
      const doorLayer = renderShiftedLayer(rawWavPath, tmpDoor, sampleRate, pitch, [
        'lowpass=f=950',
        'aecho=0.8:0.7:16|34:0.35|0.2',
      ]);
      if (fs.existsSync(tmpDoor)) fs.unlinkSync(tmpDoor);

      for (let i = sStart; i < sEnd && i < doorLayer.length; i++) {
        const t = i / sampleRate;
        const inF = Math.min(1, (t - seg.startSec) / fadeSec);
        const outF = Math.min(1, (seg.endSec - t) / fadeSec);
        const wet = wetMix * Math.max(0, Math.min(1, inF, outF));
        out[i] = out[i] * (1 - wet) + doorLayer[i] * 1.15 * wet;
      }
    }
  }

  return out;
}

/**
 * Reusable visceral Horror Sting generator ("sfx بعدها رعب"):
 * Combines a sub-bass chest drop, dissonant bowed horror screech cluster, and dark air sweep
 * to land immediately after terrifying dialogue reveals.
 */
export function buildHorrorStingSamples(durSec = 1.85, sampleRate = DEFAULT_SAMPLE_RATE, seedVal = 1313) {
  const n = Math.floor(durSec * sampleRate);
  const b = new Float32Array(n);
  let seed = seedVal | 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };

  let subPhase = 0;
  let bp = 0;
  let lp = 0;

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / 0.018);

    // 1. Chest-rattling horror sub-boom pitch drop (115Hz -> 34Hz)
    const subFreq = 34 + 81 * Math.exp(-t * 9.5);
    subPhase += (2 * Math.PI * subFreq) / sampleRate;
    const subHit = Math.sin(subPhase) * Math.exp(-t * 1.65) * 0.85;

    // 2. Dissonant bowed/metallic horror screech (minor second + tritone cluster)
    const vib = 1 + 0.008 * Math.sin(2 * Math.PI * 6.5 * t);
    const screech =
      (Math.sin(2 * Math.PI * 587.33 * vib * t) * 0.34 +
        Math.sin(2 * Math.PI * 622.25 * vib * t) * 0.36 +
        Math.sin(2 * Math.PI * 830.61 * vib * t) * 0.22 +
        Math.sin(2 * Math.PI * 1244.5 * t) * 0.16) *
      Math.exp(-t * 2.1) *
      Math.min(1, t / 0.035);

    // 3. Sharp dark wind/metal impact tail
    const w = rand() * 2 - 1;
    lp = lp * 0.84 + w * 0.16;
    bp = bp * 0.72 + (w - lp) * 0.28;
    const airImpact = bp * Math.exp(-t * 2.6) * 0.55;

    const fadeOut = Math.min(1, (durSec - t) / 0.22);
    b[i] = Math.tanh((subHit + screech * 0.78 + airImpact) * 1.25) * attack * fadeOut * 0.92;
  }

  return b;
}

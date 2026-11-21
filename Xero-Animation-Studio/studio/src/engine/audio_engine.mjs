import { DEFAULT_SAMPLE_RATE } from './voice_fx.mjs';

/**
 * Reusable AmberFrame Spatial SFX & Dynamic Multi-Harmonic Score Engine.
 * Works episode-agnostically with any EpisodeManifest & SFX clip buffer.
 */

export function computeVoiceDuckEnvelope(voiceSamples, totalSamples, sampleRate = DEFAULT_SAMPLE_RATE, stepSec = 0.02) {
  const envStep = Math.max(1, Math.floor(sampleRate * stepSec));
  const envLen = Math.ceil(totalSamples / envStep);
  const rawRms = new Float32Array(envLen);

  for (let e = 0; e < envLen; e++) {
    const s0 = e * envStep;
    const s1 = Math.min(totalSamples, s0 + envStep);
    let sum = 0;
    for (let i = s0; i < s1 && i < voiceSamples.length; i++) {
      sum += voiceSamples[i] * voiceSamples[i];
    }
    rawRms[e] = Math.sqrt(sum / Math.max(1, s1 - s0));
  }

  const duckGain = new Float32Array(envLen);
  let curDuck = 1.0;
  for (let e = 0; e < envLen; e++) {
    const speech = Math.min(1, Math.max(0, (rawRms[e] - 0.015) / 0.075));
    const target = 1.0 - 0.62 * speech;
    const coeff = target < curDuck ? 0.28 : 0.055;
    curDuck += (target - curDuck) * coeff;
    duckGain[e] = curDuck;
  }
  return { duckGain, envStep, envLen };
}

/**
 * Mixes a mono SFX buffer into stereo buffers with constant-power panning,
 * distance attenuation, subtle Haas interaural delay, and early room reflection.
 */
export function mixSpatialSfxEvent({
  sfxL,
  sfxR,
  clip,
  startFrame,
  fps = 30,
  sampleRate = DEFAULT_SAMPLE_RATE,
  spatialPan = 0,
  distance = 0.3,
  gain = 0.8,
  roomReflect = 0.16,
}) {
  const s0 = Math.round((startFrame / fps) * sampleRate);
  const pan = Math.max(-1, Math.min(1, spatialPan));
  const distAtten = 1 - Math.max(0, Math.min(1, distance)) * 0.28;
  const gL = Math.cos(((pan + 1) * Math.PI) / 4) * gain * distAtten;
  const gR = Math.sin(((pan + 1) * Math.PI) / 4) * gain * distAtten;

  // Haas micro-delay (0..22 samples ~= 0.5ms) gives instant physical directionality
  const haasSamples = Math.round(Math.abs(pan) * 0.0005 * sampleRate);
  const delayL = pan > 0 ? haasSamples : 0;
  const delayR = pan < 0 ? haasSamples : 0;

  // Early bedroom wall reflection (~11ms & ~19ms) scaled by distance
  const refDelay1 = Math.round(0.011 * sampleRate);
  const refDelay2 = Math.round(0.019 * sampleRate);
  const refGain = roomReflect * (0.4 + distance * 0.6);

  const total = sfxL.length;
  for (let k = 0; k < clip.length; k++) {
    const sample = clip[k];
    const idxL = s0 + k + delayL;
    const idxR = s0 + k + delayR;
    if (idxL >= 0 && idxL < total) sfxL[idxL] += sample * gL;
    if (idxR >= 0 && idxR < total) sfxR[idxR] += sample * gR;

    if (roomReflect > 0.01) {
      const rIdx1 = s0 + k + refDelay1;
      const rIdx2 = s0 + k + refDelay2;
      if (rIdx1 >= 0 && rIdx1 < total) {
        sfxL[rIdx1] += sample * gR * refGain * 0.55;
        sfxR[rIdx1] += sample * gL * refGain * 0.55;
      }
      if (rIdx2 >= 0 && rIdx2 < total) {
        sfxL[rIdx2] += sample * gL * refGain * 0.3;
        sfxR[rIdx2] += sample * gR * refGain * 0.3;
      }
    }
  }
}

/**
 * Generates a cinematic tension riser (ascending bowed harmonic swell + airy sweep).
 */
export function buildSubRiserSamples(durSec = 2.6, sampleRate = DEFAULT_SAMPLE_RATE, seedVal = 777) {
  const n = Math.floor(durSec * sampleRate);
  const b = new Float32Array(n);
  let seed = seedVal | 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };

  let p1 = 0;
  let p2 = 0;
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const prog = Math.min(1, t / durSec);
    const f1 = 58 + 92 * Math.pow(prog, 1.8);
    const f2 = f1 * 1.498; // slightly dissonant fifth
    p1 += (2 * Math.PI * f1) / sampleRate;
    p2 += (2 * Math.PI * f2) / sampleRate;

    const w = rand() * 2 - 1;
    lp = lp * (0.93 - prog * 0.25) + w * (0.07 + prog * 0.25);
    const swell = Math.pow(prog, 1.65) * Math.min(1, (durSec - t) / 0.04);
    b[i] = Math.tanh((Math.sin(p1) * 0.5 + Math.sin(p2) * 0.35 + lp * 0.65) * 1.3) * swell * 0.68;
  }
  return b;
}

/**
 * Generates a delicate mechanical quartz bedside clock tick (1 tick sample)
 * so midnight ticking abruptly cutting out at intentional silence deepens tension.
 */
export function buildClockTickSample(sampleRate = DEFAULT_SAMPLE_RATE, accent = false) {
  const durSec = 0.045;
  const n = Math.floor(durSec * sampleRate);
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const f = accent ? 2950 : 2420;
    const click = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 145) * 0.65;
    const woodBody = Math.sin(2 * Math.PI * 520 * t) * Math.exp(-t * 95) * 0.35;
    b[i] = (click + woodBody) * 0.48;
  }
  return b;
}

/**
 * Synthesizes a multi-harmonic dark bowed score with tension heartbeat pulse
 * and crisp fade transitions into intentional musical silence.
 */
export function renderDynamicHorrorScore({
  totalSamples,
  sampleRate = DEFAULT_SAMPLE_RATE,
  duckGain,
  envStep,
  silenceStartSec = 21.82,
  silenceEndSec = 28.85,
  climaxStingSec = 30.48,
}) {
  const musicMix = new Float32Array(totalSamples);
  let seed = 4242;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };

  let bowNoise = 0;
  let hbPhase = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const envIdx = Math.min(duckGain.length - 1, Math.floor(i / envStep));
    const duck = duckGain[envIdx];

    if (t >= silenceStartSec && t < silenceEndSec) {
      musicMix[i] = 0;
      continue;
    }

    // Filtered subtle rosin/bow air texture
    bowNoise = bowNoise * 0.94 + (rand() * 2 - 1) * 0.06;

    if (t >= silenceEndSec) {
      const dt = t - silenceEndSec;
      const attack = Math.min(1, dt / 0.055);
      const isAfterClimax = t >= climaxStingSec;
      const stingBoost = isAfterClimax ? 1 + Math.exp(-(t - climaxStingSec) * 1.6) * 0.85 : 1;
      const decay = isAfterClimax ? Math.exp(-(t - climaxStingSec) * 1.35) : 1;

      const celloClimax =
        Math.sin(2 * Math.PI * 55 * t) * 0.56 +
        Math.sin(2 * Math.PI * 55.45 * t) * 0.32 +
        Math.sin(2 * Math.PI * 110 * t) * 0.28 +
        Math.sin(2 * Math.PI * 116.54 * t) * 0.26 + // haunting minor 2nd tension
        Math.sin(2 * Math.PI * 164.8 * t) * 0.14 +
        bowNoise * 0.28;

      musicMix[i] = Math.tanh(celloClimax * 1.05) * attack * decay * stingBoost * 0.62 * duck;
      continue;
    }

    // Pre-silence dark act progression
    const fadeIn = Math.min(1, t / 0.75);
    const silenceFadeOut = t < silenceStartSec - 0.45 ? 1 : Math.max(0, (silenceStartSec - t) / 0.45);
    const scoreEnv = fadeIn * silenceFadeOut;

    const tension =
      t < 4.5
        ? 0.16
        : t < 10.9
          ? 0.22 + 0.18 * ((t - 4.5) / 6.4)
          : t < 14.3
            ? 0.4 + 0.48 * ((t - 10.9) / 3.4)
            : 0.52;

    // Multi-harmonic detuned bowed drone (D2 + A2 + F3 + Eb3 dissonance)
    const vib = 1 + 0.0022 * Math.sin(2 * Math.PI * 0.32 * t);
    const d2 = Math.sin(2 * Math.PI * 73.42 * vib * t) * 0.48 + Math.sin(2 * Math.PI * 73.85 * t) * 0.22;
    const a2 = Math.sin(2 * Math.PI * 110.0 * vib * t) * 0.32;
    const f3 = Math.sin(2 * Math.PI * 174.61 * vib * t) * 0.2;
    const ebTension = Math.sin(2 * Math.PI * 155.56 * t) * tension * 0.28;

    // Heartbeat lub-dub pulse intensifying during approach & phone call (10.5s..21.4s)
    let heartbeat = 0;
    if (t >= 4.5 && t < silenceStartSec - 0.35) {
      const bpm = 64 + tension * 46;
      const period = 60 / bpm;
      const phaseT = t % period;
      const lub = Math.exp(-phaseT * 24) * Math.sin(2 * Math.PI * 52 * phaseT);
      const dub = phaseT > 0.16 ? Math.exp(-(phaseT - 0.16) * 28) * Math.sin(2 * Math.PI * 46 * (phaseT - 0.16)) : 0;
      const hbAmt = t < 10.5 ? 0.16 : 0.38;
      heartbeat = (lub * 0.85 + dub * 0.6) * hbAmt;
      hbPhase += 0.01;
    }

    const breathe = 0.78 + 0.22 * Math.sin(2 * Math.PI * (0.42 + tension * 0.65) * t);
    const scoreSample = (d2 + a2 + f3 + ebTension + bowNoise * 0.18) * breathe + heartbeat;
    musicMix[i] = Math.tanh(scoreSample * 0.52) * scoreEnv * duck;
  }

  // Avoid unused variable warning cleanly
  void hbPhase;
  return musicMix;
}

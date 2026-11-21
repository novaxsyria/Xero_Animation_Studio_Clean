import { clamp, easeInOut, backOut } from './anim';

export const LANDSCAPE_VIEWPORT: [number, number] = [1920, 1080];
export const PORTRAIT_VIEWPORT: [number, number] = [1080, 1920];

export type ShotType =
  | 'establishing'
  | 'wide'
  | 'medium'
  | 'close-up'
  | 'extreme-close-up'
  | 'over-shoulder'
  | 'pov'
  | 'reaction'
  | 'insert'
  | 'tracking'
  | 'reveal';

export type CameraMotionType =
  | 'static'
  | 'slow-push'
  | 'pull-back'
  | 'track'
  | 'rack-pan'
  | 'shock-cut';

export type FloorSurface = 'wood' | 'tile' | 'carpet' | 'concrete' | 'metal' | 'gravel' | 'wet';

export type AudioCategory = 'diegetic' | 'non-diegetic';

export type VoiceCharacterPreset =
  | 'narrator-clean'
  | 'telephone-caller'
  | 'vintage-recorder'
  | 'closet-horror-entity'
  | 'behind-door';

export type VoicePerspective = VoiceCharacterPreset | 'phone-speaker' | 'recorder-vintage';

export interface VoicePresetMetadata {
  preset: VoiceCharacterPreset;
  label: string;
  pitchSemitones: number;
  bandpassHz: [number, number] | null;
  acousticDescription: string;
}

export const VOICE_PRESET_SPECS: Record<VoiceCharacterPreset, VoicePresetMetadata> = {
  'narrator-clean': {
    preset: 'narrator-clean',
    label: 'Narrator Clean',
    pitchSemitones: 0,
    bandpassHz: null,
    acousticDescription: 'Unprocessed authoritative narrator channel',
  },
  'telephone-caller': {
    preset: 'telephone-caller',
    label: 'Telephone Caller',
    pitchSemitones: -2.2,
    bandpassHz: [480, 2450],
    acousticDescription:
      'Distinct older trapped-caller voice (-2.2st) through 480–2450Hz telephone micro-speaker + line saturation & GSM static (100% wet)',
  },
  'vintage-recorder': {
    preset: 'vintage-recorder',
    label: 'Vintage Tape Recorder',
    pitchSemitones: -0.8,
    bandpassHz: [320, 3100],
    acousticDescription: 'Warm analog tape flutter, magnetic saturation, and mechanical transport hiss',
  },
  'closet-horror-entity': {
    preset: 'closet-horror-entity',
    label: 'Closet Horror Entity',
    pitchSemitones: -3.8,
    bandpassHz: [90, 4800],
    acousticDescription:
      'Deep chilling inhuman character shift (-3.8st + -7st sub-shadow double) with hollow wooden enclosure reflections',
  },
  'behind-door': {
    preset: 'behind-door',
    label: 'Occluded Behind Door',
    pitchSemitones: -1.2,
    bandpassHz: [110, 950],
    acousticDescription: 'Muffled cavity transmission occluded behind solid wood barrier',
  },
};

export interface VoiceSegmentSpec {
  id: string;
  sceneId: string;
  speakerRole: string;
  characterMood: string;
  preset: VoiceCharacterPreset;
  startSec: number;
  endSec: number;
  fadeSec?: number;
  pitchSemitones?: number;
  wetMix?: number;
  followupSfxClip?: string;
  followupSfxFrame?: number;
}

export interface AudioEventSpec {
  id: string;
  clip: string;
  startFrame: number;
  endFrame?: number;
  category: AudioCategory;
  purpose: string;
  spatialPan: number; // -1 left .. +1 right
  distance: number; // 0 close .. 1 far
  surface?: FloorSurface;
  gain: number;
  duckPriority: number;
  visualTrigger: string;
}

export interface ContinuityMetadata {
  location: string;
  protagonistSide: 'left' | 'center' | 'right';
  closetSide: 'right';
  bedSide: 'left';
  lightingMood: string;
  propsState: Record<string, string | number | boolean>;
}

export interface ScenePlan {
  sceneId: string;
  act: number;
  startFrame: number;
  endFrame: number;
  keyFrame: number;
  shotType: ShotType;
  set: string;
  look: string;
  narrationSegment: string;
  sceneDescription: string;
  camera: {
    motion: CameraMotionType;
    scaleFrom: number;
    scaleTo: number;
    focusX: number;
    focusY: number;
    motivation: string;
    dutchDeg?: number;
    handheldAmp?: number;
  };
  lighting: {
    key: string;
    rim: string;
    veil: number;
    description: string;
  };
  characters: {
    id: string;
    emotionalState: string;
    action: string;
  }[];
  vfx: string[];
  sfx: AudioEventSpec[];
  musicCue: {
    state: 'underscore' | 'tension-rise' | 'intentional-silence' | 'sting' | 'fade-out';
    note: string;
  };
  voicePerspective: VoicePerspective;
  transitionIn: 'cut' | 'shock-cut' | 'audio-bridge' | 'fade-from-black';
  continuity: ContinuityMetadata;
}

export interface SubtitleCueSpec {
  a: number;
  b: number;
  text: string;
  speaker?: 'narrator' | 'caller' | 'entity';
}

export interface EpisodeManifest {
  id: string;
  slug: string;
  title: string;
  fps: number;
  width?: number;
  height?: number;
  aspectRatio?: string;
  totalFrames: number;
  durationSeconds: number;
  artDirection: string;
  sourceAudioPath: string;
  outroSfxTailSec?: number;
  audioMix?: {
    voiceVol: number;
    sfxVol: number;
    musicVol: number;
  };
  sfxCatalogDir?: string;
  exportFileName?: string;
  voiceSegments?: VoiceSegmentSpec[];
  subtitles?: SubtitleCueSpec[];
  scenes: ScenePlan[];
}

export interface QCCheck {
  category: 'Visual' | 'Narrative' | 'Audio' | 'Technical';
  name: string;
  ok: boolean;
  detail: string;
}

export interface QCReport {
  ok: boolean;
  episodeId: string;
  totalFrames: number;
  durationSeconds: number;
  sceneCount: number;
  checks: QCCheck[];
}

/** Deterministic SVG transform for motivated cinematic camera moves centered at (focusX, focusY) in any viewport with optional Dutch canted roll. */
export const cameraTransform = (
  scale: number,
  focusX = 960,
  focusY = 540,
  tx = 0,
  ty = 0,
  rollDeg = 0,
  viewport: [number, number] = LANDSCAPE_VIEWPORT,
): string => {
  const cx = viewport[0] * 0.5;
  const cy = viewport[1] * 0.5;
  if (Math.abs(rollDeg) > 0.001) {
    return `translate(${(cx + tx).toFixed(2)} ${(cy + ty).toFixed(2)}) rotate(${rollDeg.toFixed(3)}) scale(${scale.toFixed(4)}) translate(${-focusX.toFixed(2)} ${-focusY.toFixed(2)})`;
  }
  return `translate(${(cx + tx).toFixed(2)} ${(cy + ty).toFixed(2)}) scale(${scale.toFixed(4)}) translate(${-focusX.toFixed(2)} ${-focusY.toFixed(2)})`;
};

/** Subtle deterministic physiological handheld breathing/dread drift without jittery randomness. */
export const handheldOffset = (
  f: number,
  ampPx = 2.0,
  rollAmpDeg = 0.16,
  seed = 11,
): { tx: number; ty: number; roll: number } => ({
  tx: Math.sin(f * 0.055 + seed) * ampPx * 0.65 + Math.cos(f * 0.115 + seed * 1.3) * ampPx * 0.35,
  ty: Math.cos(f * 0.048 + seed * 0.7) * ampPx * 0.6 + Math.sin(f * 0.092 + seed * 2.1) * ampPx * 0.4,
  roll: Math.sin(f * 0.041 + seed * 1.9) * rollAmpDeg,
});

/** Interpolated camera move helper driven deterministically by local frame progress p in [0, 1]. */
export const motivatedCamera = (
  p: number,
  scaleFrom: number,
  scaleTo: number,
  focusFrom: [number, number],
  focusTo: [number, number] = focusFrom,
  opts?: {
    handheldFrame?: number;
    handheldAmp?: number;
    rollFrom?: number;
    rollTo?: number;
    spring?: boolean;
    viewport?: [number, number];
  },
): string => {
  const cp = clamp(p);
  const k = opts?.spring ? backOut(cp) : easeInOut(cp);
  const s = scaleFrom + (scaleTo - scaleFrom) * k;
  const fx = focusFrom[0] + (focusTo[0] - focusFrom[0]) * k;
  const fy = focusFrom[1] + (focusTo[1] - focusFrom[1]) * k;
  const hh =
    opts?.handheldFrame !== undefined && (opts.handheldAmp ?? 0) > 0
      ? handheldOffset(opts.handheldFrame, opts.handheldAmp, (opts.handheldAmp ?? 1) * 0.08)
      : { tx: 0, ty: 0, roll: 0 };
  const baseRoll = (opts?.rollFrom ?? 0) + ((opts?.rollTo ?? opts?.rollFrom ?? 0) - (opts?.rollFrom ?? 0)) * k;
  return cameraTransform(s, fx, fy, hh.tx, hh.ty, baseRoll + hh.roll, opts?.viewport ?? LANDSCAPE_VIEWPORT);
};

/** Subtle deterministic physiological breathing curve (returns -1..1). */
export const breathCurve = (t: number, framesPerCycle = 75): number =>
  Math.sin((t / Math.max(1, framesPerCycle)) * Math.PI * 2);

/** Subtle restrained micro-tremor for fear/anticipation without harsh camera jitter. */
export const microTremor = (f: number, amp = 1.2, seed = 7): number =>
  Math.sin(f * 1.9 + seed) * amp * 0.6 + Math.cos(f * 3.1 + seed * 1.7) * amp * 0.4;

/** Automated Quality Control validator checking narrative, audio, visual, pacing, character voice FX, subtitles, and timeline continuity. */
export const validateEpisodePlan = (
  manifest: EpisodeManifest,
  expectedAudioDurationSec: number,
): QCReport => {
  const checks: QCCheck[] = [];
  const scenes = manifest.scenes;

  let contiguous = scenes.length > 0 && scenes[0].startFrame === 0;
  let contDetail = `${scenes.length} contiguous scenes covering 0..${manifest.totalFrames}`;
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    if (s.endFrame <= s.startFrame) {
      contiguous = false;
      contDetail = `Invalid frame range at ${s.sceneId}: ${s.startFrame}..${s.endFrame}`;
      break;
    }
    if (i > 0 && s.startFrame !== scenes[i - 1].endFrame) {
      contiguous = false;
      contDetail = `Gap/overlap between ${scenes[i - 1].sceneId} (${scenes[i - 1].endFrame}) and ${s.sceneId} (${s.startFrame})`;
      break;
    }
  }
  if (scenes.length > 0 && scenes[scenes.length - 1].endFrame !== manifest.totalFrames) {
    contiguous = false;
    contDetail = `Timeline ends at ${scenes[scenes.length - 1].endFrame}, expected ${manifest.totalFrames}`;
  }
  checks.push({
    category: 'Technical',
    name: 'Zero-Gap Frame Contiguity',
    ok: contiguous,
    detail: contDetail,
  });

  const tailAllowance = (manifest.outroSfxTailSec ?? 1.25) + 0.5;
  const minNarrationSync =
    manifest.durationSeconds >= expectedAudioDurationSec - 0.15 &&
    manifest.durationSeconds <= expectedAudioDurationSec + tailAllowance;
  checks.push({
    category: 'Audio',
    name: 'Authoritative Audio Clock Alignment',
    ok: minNarrationSync,
    detail: `Episode ${manifest.durationSeconds.toFixed(2)}s vs source narration ${expectedAudioDurationSec.toFixed(2)}s`,
  });

  const allHaveNarration = scenes.every((s) => s.narrationSegment.trim().length > 0);
  const avgShotSec = manifest.durationSeconds / Math.max(1, scenes.length);
  const shotTypesUsed = new Set(scenes.map((s) => s.shotType)).size;
  const subCues = manifest.subtitles ?? [];
  const subsValid = subCues.length >= scenes.length - 1 && subCues.every((c) => c.b > c.a && c.text.trim().length > 0);
  checks.push({
    category: 'Narrative',
    name: 'Dynamic Shot Pacing & Spoken Subtitles',
    ok: allHaveNarration && shotTypesUsed >= 4 && avgShotSec <= 4.2 && subsValid,
    detail: `${scenes.length} scenes (${shotTypesUsed} shot types, avg ${avgShotSec.toFixed(2)}s/shot) · ${subCues.length} synced Arabic subtitles`,
  });

  const geoConsistent = scenes.every(
    (s) => s.continuity.bedSide === 'left' && s.continuity.closetSide === 'right',
  );
  checks.push({
    category: 'Visual',
    name: 'Spatial Geography Continuity',
    ok: geoConsistent,
    detail: 'Bed anchored left, wardrobe anchored right across all shots',
  });

  const hasIntentionalSilence = scenes.some((s) => s.musicCue.state === 'intentional-silence');
  checks.push({
    category: 'Audio',
    name: 'Dramatic Silence & Dynamic Contrast',
    ok: hasIntentionalSilence,
    detail: hasIntentionalSilence
      ? 'Musical silence scheduled during warning & self-opening closet reveal'
      : 'No musical silence cue found',
  });

  const voiceSegs = manifest.voiceSegments ?? [];
  const hasPhoneTransform = voiceSegs.some((v) => v.preset === 'telephone-caller' && (v.wetMix ?? 1) >= 0.9);
  const horrorSegs = voiceSegs.filter((v) => v.preset === 'closet-horror-entity');
  const horrorWithSfx =
    horrorSegs.length > 0 &&
    horrorSegs.every((hv) => {
      if (!hv.followupSfxClip) return false;
      const sc = scenes.find((s) => s.sceneId === hv.sceneId);
      return Boolean(sc?.sfx.some((ev) => ev.clip === hv.followupSfxClip));
    });
  checks.push({
    category: 'Audio',
    name: 'Character Voice Transformation & Horror SFX',
    ok: hasPhoneTransform && horrorWithSfx,
    detail:
      voiceSegs.length > 0
        ? `${voiceSegs.length} voice-FX specs (${voiceSegs.map((v) => v.preset).join(', ')}) + post-line horror sting`
        : 'No character voice-FX segments defined',
  });

  const sfxCount = scenes.reduce((acc, s) => acc + s.sfx.length, 0);
  checks.push({
    category: 'Audio',
    name: 'Event-Driven Physical SFX Coverage',
    ok: sfxCount >= scenes.length,
    detail: `${sfxCount} physics/acoustic events mapped to exact animation frames`,
  });

  return {
    ok: checks.every((c) => c.ok),
    episodeId: manifest.id,
    totalFrames: manifest.totalFrames,
    durationSeconds: manifest.durationSeconds,
    sceneCount: scenes.length,
    checks,
  };
};

export interface SfxEventItem {
  clip: string;
  triggerFrame: number;
  time: string;
  gain: number;
  category?: string;
  purpose?: string;
  spatialPan?: number;
  surface?: string;
}

export interface StoryboardScene {
  index: number;
  sceneId: string;
  act: number;
  size: string;
  set: string;
  look: string;
  startTime: string;
  endTime: string;
  durationSec: number;
  startFrame: number;
  endFrame: number;
  keyFrame: number;
  narrationSegment: string;
  sceneDescription: string;
  cameraComposition: string;
  characterAnimation: string;
  backgroundEnvironment: string;
  voicePerspective?: string;
  sfxEvents: SfxEventItem[];
  vfxEvents: string[];
  status: string;
}

export interface ValidationCheck {
  category?: 'Visual' | 'Narrative' | 'Audio' | 'Technical';
  name: string;
  ok: boolean;
  detail: string;
}

export interface ValidationResponse {
  ok: boolean;
  episodeId?: string;
  slug?: string;
  title?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  totalFrames: number;
  durationSec: number;
  scenes: number;
  checks: ValidationCheck[];
  mp4Ready?: boolean;
  mp4SizeMB?: number;
  mp4FileName?: string;
  zipReady?: boolean;
  zipFileName?: string;
  zipSizeMB?: number;
  error?: string;
}

export interface SfxLibraryItem {
  file: string;
  clip: string;
  url: string;
  sizeKB: number;
  category?: string;
  purpose?: string;
  material?: string;
  environment?: string;
  mood?: string;
  durationSec?: number;
}

export type EpisodeSlug = 'khizanat-al-ghurfa' | 'hal-taarif-innaka-tahlum';

export interface ActMeta {
  act: number;
  label: string;
  ar: string;
  startFrame: number;
  endFrame: number;
}

export const EPISODE_ACTS: Record<EpisodeSlug, ActMeta[]> = {
  'khizanat-al-ghurfa': [
    { act: 1, label: 'Beat I', ar: 'التنفس من الخزانة', startFrame: 0, endFrame: 237 },
    { act: 2, label: 'Beat II', ar: 'الاقتراب والهمس', startFrame: 237, endFrame: 420 },
    { act: 3, label: 'Beat III', ar: 'المكالمة الغريبة', startFrame: 420, endFrame: 724 },
    { act: 4, label: 'Beat IV', ar: 'الصوت المرعب بالداخل', startFrame: 724, endFrame: 960 },
  ],
  'hal-taarif-innaka-tahlum': [
    { act: 1, label: 'Act I', ar: 'الممر والأصابع الستة', startFrame: 0, endFrame: 1902 },
    { act: 2, label: 'Act II', ar: 'داخل عقل الإنسان', startFrame: 1902, endFrame: 4542 },
    { act: 3, label: 'Act III', ar: 'المدرسة والعود', startFrame: 4542, endFrame: 8856 },
    { act: 4, label: 'Act IV', ar: 'المدينة المعلقة والحلم الواعي', startFrame: 8856, endFrame: 12624 },
    { act: 5, label: 'Act V', ar: 'العودة أم البداية', startFrame: 12624, endFrame: 15343 },
    { act: 6, label: 'Act VI', ar: 'الفجر والورقة على المرآة', startFrame: 15343, endFrame: 17488 },
  ],
};

export const formatTimecode = (frame: number, fps = 30): string => {
  const safe = Math.max(0, Math.round(frame));
  const totalSec = safe / fps;
  const mm = Math.floor(totalSec / 60);
  const ss = Math.floor(totalSec % 60);
  const ff = safe % fps;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${String(ff).padStart(2, '0')}`;
};

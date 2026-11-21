import React from 'react';
import { clamp, lerp, rnd } from './anim';
import { KitDefs } from './kit';
import { SetDefs } from './light';

export * from './anim';
export * from './rig';
export * from './props';
export * from './kit';
export * from './light';
export * from './room';
export * from './furnish';
export * from './ui';
export * from './fonts.pure';
export * from './sets/study';
export * from './sets/stairwell';
export * from './sets/classroom';
export * from './sets/rooftop';
export * from './sets/kitchen';
export * from './sets/schematic';
export * from './sets/bedroom';
export * from './sets/rakan_bedroom';
export * from './sets/blue_corridor';
export * from './sets/elementary_school';
export * from './sets/music_room';
export * from './sets/cloud_city';
export * from './sets/dream_science';
export * from './sets/dawn_street';
export * from './sets/closet_bedroom';
export * from './amberframe';

export type Seg = {
  shot: string;
  a: number;
  b: number;
  t0: number;
  t1: number;
  look?: string;
  line?: string;
};
export type ShotInfo = { id: string; size: string; key: number; len: number; first: number; line?: string; note?: string };
export type Fx = {
  f: number;
  kind: 'flash' | 'shake' | 'letterbox' | 'danger';
  color?: string;
  o?: number;
  len?: number;
  amp?: number;
  barPx?: number;
};
export type SubtitleCue = {
  a: number;
  b: number;
  text: string;
  speaker?: 'narrator' | 'caller' | 'entity';
};
export type Timeline = {
  slug: string;
  title: string;
  fps: number;
  width?: number;
  height?: number;
  total: number;
  segments: Seg[];
  shots: ShotInfo[];
  fx: Fx[];
  subtitles?: SubtitleCue[];
  audio: { voice?: string; sfx?: string; music?: string; voiceVol?: number; sfxVol?: number; musicVol?: number };
};

export type ShotProps = { t: number; len: number; f: number };
export type ShotMap = Record<string, React.FC<ShotProps>>;

export type LookDef = {
  grade?: (lv: number) => string;
  jitter?: number;
  Overlay?: React.FC<{ f: number; lv: number; p: number; n: number }>;
};

export const segAt = (tl: Timeline, f: number) =>
  tl.segments.find((s) => f >= s.a && f < s.b) ?? tl.segments[tl.segments.length - 1];

export const subtitleAt = (tl: Timeline, f: number): { cue: SubtitleCue | null; fade: number } => {
  const cue = tl.subtitles?.find((c) => f >= c.a && f < c.b) ?? null;
  if (!cue) return { cue: null, fade: 0 };
  const inFade = clamp((f - cue.a + 1) / 3);
  const outFade = clamp((cue.b - f) / 3);
  return { cue, fade: Math.min(inFade, outFade) };
};

export const clockAt = (s: Seg, f: number) =>
  s.t1 - s.t0 === s.b - s.a ? s.t0 + (f - s.a) : lerp(s.t0, s.t1, (f - s.a) / Math.max(1, s.b - s.a));

export const lookRuns = (tl: Timeline) => {
  const runs: { look: string; a: number; b: number; n: number }[] = [];
  const count: Record<string, number> = {};
  for (const s of tl.segments) {
    if (!s.look) continue;
    const last = runs[runs.length - 1];
    if (last && last.look === s.look && last.b === s.a) last.b = s.b;
    else {
      runs.push({ look: s.look, a: s.a, b: s.b, n: count[s.look] ?? 0 });
      count[s.look] = (count[s.look] ?? 0) + 1;
    }
  }
  return runs;
};

export const fxAt = (tl: Timeline, f: number) => {
  let flash: { color: string; o: number } | null = null;
  let x = 0;
  let y = 0;
  let letterbox = 0;
  let danger = 0;
  for (const e of tl.fx) {
    if (e.kind === 'flash') {
      if (f === e.f) flash = { color: e.color ?? '#FFFFFF', o: e.o ?? 0.85 };
      else if (f === e.f + 1) flash = { color: e.color ?? '#FFFFFF', o: (e.o ?? 0.85) * 0.42 };
      else if (f === e.f + 2) flash = { color: e.color ?? '#FFFFFF', o: (e.o ?? 0.85) * 0.14 };
    } else if (e.kind === 'shake') {
      const len = e.len ?? 8;
      const amp = e.amp ?? 12;
      if (f >= e.f && f < e.f + len) {
        const k = amp * (1 - (f - e.f) / len);
        x += Math.sin(f * 2.9) * k;
        y += Math.cos(f * 3.7) * k * 0.7;
      }
    } else if (e.kind === 'letterbox') {
      const len = e.len ?? 99999;
      if (f >= e.f && f < e.f + len) {
        letterbox = Math.max(letterbox, e.barPx ?? 42);
      }
    } else if (e.kind === 'danger') {
      const len = e.len ?? 30;
      if (f >= e.f && f < e.f + len) {
        const p = 1 - (f - e.f) / len;
        danger = Math.max(danger, (e.o ?? 0.25) * p);
      }
    }
  }
  return { flash, x, y, letterbox, danger };
};

/**
 * Shared Cinematic Post-FX Overlay rendered identically in both Web Stage and Headless MP4 Export.
 * Uses pure vector primitives & gradients (no expensive feTurbulence filter) so Resvg stays ultra-fast.
 */
export const CinematicSvgOverlay: React.FC<{
  f: number;
  width?: number;
  height?: number;
  flash?: { color: string; o: number } | null;
  letterbox?: number;
  danger?: number;
  grain?: boolean;
  vignette?: number;
}> = ({ f, width = 1920, height = 1080, flash = null, letterbox = 0, danger = 0, grain = true, vignette = 1 }) => {
  const seed = Math.floor(f / 2);
  return (
    <g pointerEvents="none">
      <defs>
        <radialGradient id="amberCineVig" cx="50%" cy="50%" r="74%">
          <stop offset="52%" stopColor="#000" stopOpacity={0} />
          <stop offset="76%" stopColor="#000" stopOpacity={0.18 * vignette} />
          <stop offset="92%" stopColor="#000" stopOpacity={0.38 * vignette} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.62 * vignette} />
        </radialGradient>
        {danger > 0.01 ? (
          <radialGradient id="amberDangerRim" cx="50%" cy="50%" r="65%">
            <stop offset="56%" stopColor="#FF2E24" stopOpacity={0} />
            <stop offset="100%" stopColor="#FF2E24" stopOpacity={Math.min(0.48, danger)} />
          </radialGradient>
        ) : null}
      </defs>
      {vignette > 0 ? <rect width={width} height={height} fill="url(#amberCineVig)" /> : null}
      {danger > 0.01 ? <rect width={width} height={height} fill="url(#amberDangerRim)" /> : null}
      {grain ? (
        <g opacity={0.055}>
          {Array.from({ length: 28 }).map((_, i) => (
            <rect
              key={`gr${i}`}
              x={rnd(seed + 13, i) * Math.max(100, width - 4)}
              y={rnd(seed + 29, i) * Math.max(100, height - 4)}
              width={2 + rnd(seed + 5, i) * 3}
              height={1.8}
              fill={i % 2 === 0 ? '#FFFFFF' : '#000000'}
            />
          ))}
        </g>
      ) : null}
      {letterbox > 0.5 ? (
        <g>
          <rect x={0} y={0} width={width} height={letterbox} fill="#04050A" />
          <rect x={0} y={height - letterbox} width={width} height={letterbox} fill="#04050A" />
        </g>
      ) : null}
      {flash ? <rect width={width} height={height} fill={flash.color} opacity={flash.o} /> : null}
    </g>
  );
};

/** Crisp SVG film finish for web thumbnails/stage. */
export const Grade: React.FC<{ f: number; width?: number; height?: number; grain?: boolean; vignette?: boolean }> = ({
  f,
  width = 1920,
  height = 1080,
  grain = false,
  vignette = true,
}) => (
  <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <CinematicSvgOverlay f={f} width={width} height={height} grain={grain} vignette={vignette ? 0.72 : 0} />
  </svg>
);

export const ShotFrame: React.FC<{ width?: number; height?: number; children: React.ReactNode }> = ({
  width = 1920,
  height = 1080,
  children,
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox={`0 0 ${width} ${height}`}
    preserveAspectRatio="xMidYMid meet"
    shapeRendering="geometricPrecision"
    textRendering="geometricPrecision"
  >
    <KitDefs />
    <SetDefs />
    {children}
  </svg>
);

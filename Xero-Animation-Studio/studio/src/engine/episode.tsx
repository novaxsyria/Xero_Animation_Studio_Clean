import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { clamp } from './anim';
import {
  Timeline,
  ShotMap,
  LookDef,
  ShotFrame,
  CinematicSvgOverlay,
  ArabicSubtitleBar,
  segAt,
  subtitleAt,
  clockAt,
  lookRuns,
  fxAt,
} from './core';

export { clamp };
export type { Timeline, LookDef };
export type EpisodeProps = { timeline: Timeline; shots: ShotMap; looks?: Record<string, LookDef>; grain?: boolean; vignette?: boolean; bg?: string };

export const Episode: React.FC<EpisodeProps> = ({ timeline: tl, shots, looks = {}, grain = false, vignette = true, bg = '#090B14' }) => {
  const f = useCurrentFrame();
  const w = tl.width ?? 1920;
  const h = tl.height ?? 1080;
  const seg = segAt(tl, f);
  const Shot = shots[seg.shot];
  const info = tl.shots.find((s) => s.id === seg.shot);
  const run = lookRuns(tl).find((r) => f >= r.a && f < r.b);
  const def = run ? looks[run.look] : undefined;
  const lv = run ? Math.min(clamp((f - run.a + 1) / 2), clamp((run.b - f) / 2)) : 0;
  const jitter = def?.jitter && lv > 0 ? Math.sin(f * 13.7) * def.jitter * lv : 0;
  const { flash, x, y, letterbox, danger } = fxAt(tl, f);
  const { cue: subCue, fade: subFade } = subtitleAt(tl, f);
  const A = tl.audio;
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <AbsoluteFill style={{ transform: `translate(${x + jitter}px, ${y}px) scale(${x || y ? 1.02 : 1})`, filter: def?.grade && lv > 0 ? def.grade(lv) : undefined }}>
        <ShotFrame width={w} height={h}>{Shot ? <Shot t={clockAt(seg, f)} len={info?.len ?? seg.b - seg.a} f={f} /> : null}</ShotFrame>
      </AbsoluteFill>
      {def?.Overlay && run ? (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, opacity: lv }}>
          <def.Overlay f={f} lv={lv} p={clamp((f - run.a) / Math.max(1, run.b - run.a))} n={run.n} />
        </svg>
      ) : null}
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <CinematicSvgOverlay f={f} width={w} height={h} flash={flash} letterbox={letterbox} danger={danger} grain={grain} vignette={vignette ? 0.85 : 0} />
        {subCue ? <ArabicSubtitleBar text={subCue.text} speaker={subCue.speaker} width={w} height={h} fade={subFade} /> : null}
      </svg>
      {A.voice ? <Audio src={staticFile(A.voice)} volume={A.voiceVol ?? 1} /> : null}
      {A.sfx ? <Audio src={staticFile(A.sfx)} volume={A.sfxVol ?? 1} /> : null}
      {A.music ? <Audio src={staticFile(A.music)} volume={A.musicVol ?? 1} /> : null}
    </AbsoluteFill>
  );
};

export const Board: React.FC<{ timeline: Timeline; shots: ShotMap; grain?: boolean; vignette?: boolean; bg?: string }> = ({ timeline: tl, shots, grain = false, vignette = true, bg = '#090B14' }) => {
  const f = useCurrentFrame();
  const w = tl.width ?? 1920;
  const h = tl.height ?? 1080;
  const info = tl.shots[Math.min(f, tl.shots.length - 1)];
  const Shot = shots[info.id];
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <ShotFrame width={w} height={h}>{Shot ? <Shot t={info.key} len={info.len} f={info.first + info.key} /> : null}</ShotFrame>
      <Grade f={info.key} width={w} height={h} grain={grain} vignette={vignette} />
    </AbsoluteFill>
  );
};

export const defineEpisode = (id: string, p: EpisodeProps) => ({
  id,
  width: p.timeline.width ?? 1920,
  height: p.timeline.height ?? 1080,
  total: p.timeline.total,
  shotCount: p.timeline.shots.length,
  Main: () => <Episode {...p} />,
  Board: () => <Board timeline={p.timeline} shots={p.shots} grain={p.grain} vignette={p.vignette} bg={p.bg} />,
});
export type EpisodeDef = ReturnType<typeof defineEpisode>;

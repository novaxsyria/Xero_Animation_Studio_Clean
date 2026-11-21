import React from 'react';
import {
  Timeline,
  ShotFrame,
  CinematicSvgOverlay,
  ArabicSubtitleBar,
  segAt,
  subtitleAt,
  clockAt,
  lookRuns,
  fxAt,
  clamp,
} from '@/studio/src/engine/core';
import { SHOTS as DREAM_SHOTS } from '@/studio/src/episodes/hal-taarif-innaka-tahlum/shots';
import { SHOTS as KHIZANAT_SHOTS } from '@/studio/src/episodes/khizanat-al-ghurfa/shots';

interface EpisodeStageProps {
  timeline: Timeline;
  frame: number;
  className?: string;
}

const LOOK_FILTERS: Record<string, (lv: number) => string> = {
  amberNoir: (lv) => `contrast(${1 + 0.06 * lv}) saturate(${1 + 0.08 * lv})`,
  dream: (lv) => `saturate(${1 + 0.08 * lv}) contrast(${1 + 0.04 * lv})`,
  science: (lv) => `contrast(${1 + 0.05 * lv}) saturate(${1 + 0.06 * lv})`,
  memory: (lv) => `sepia(${0.12 * lv}) saturate(${1 + 0.14 * lv})`,
  lucid: (lv) => `brightness(${1 + 0.04 * lv}) saturate(${1 + 0.15 * lv})`,
  dawn: (lv) => `brightness(${1 + 0.03 * lv}) saturate(${1 + 0.12 * lv})`,
};

export const getShotsForSlug = (slug: string) =>
  slug === 'khizanat-al-ghurfa' ? KHIZANAT_SHOTS : DREAM_SHOTS;

export const EpisodeStage: React.FC<EpisodeStageProps> = ({ timeline, frame, className = '' }) => {
  const w = timeline.width ?? 1920;
  const h = timeline.height ?? 1080;
  const isPortrait = h > w;

  const seg = segAt(timeline, frame);
  const shots = getShotsForSlug(timeline.slug);
  const Shot = shots[seg.shot];
  const info = timeline.shots.find((s) => s.id === seg.shot);
  const run = lookRuns(timeline).find((r) => frame >= r.a && frame < r.b);
  const lv = run ? Math.min(clamp((frame - run.a + 1) / 2), clamp((run.b - frame) / 2)) : 0;
  const filterFn = run?.look ? LOOK_FILTERS[run.look] : undefined;
  const { flash, x, y, letterbox, danger } = fxAt(timeline, frame);
  const { cue: subCue, fade: subFade } = subtitleAt(timeline, frame);

  return (
    <div
      className={`relative bg-[#080A14] overflow-hidden select-none ${
        isPortrait ? 'w-full max-w-[430px] aspect-[9/16] mx-auto border-x border-slate-800/70' : 'w-full aspect-video'
      } ${className}`}
    >
      <div
        className="w-full h-full"
        style={{
          transform: `translate(${x}px, ${y}px) scale(${x || y ? 1.02 : 1})`,
          filter: filterFn && lv > 0 ? filterFn(lv) : undefined,
        }}
      >
        <ShotFrame width={w} height={h}>
          {Shot ? <Shot t={clockAt(seg, frame)} len={info?.len ?? seg.b - seg.a} f={frame} /> : null}
        </ShotFrame>
      </div>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${h}`}
        className="absolute inset-0 pointer-events-none"
      >
        <CinematicSvgOverlay
          f={frame}
          width={w}
          height={h}
          flash={flash}
          letterbox={letterbox}
          danger={danger}
          grain={false}
          vignette={0.82}
        />
        {subCue ? (
          <ArabicSubtitleBar
            text={subCue.text}
            speaker={subCue.speaker}
            width={w}
            height={h}
            fade={subFade}
          />
        ) : null}
      </svg>
      {run?.look === 'lucid' && lv > 0 ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: '#7AE8FF',
            opacity: clamp((0.06 + 0.03 * Math.sin(frame * 0.12)) * lv),
            mixBlendMode: 'screen',
          }}
        />
      ) : null}
    </div>
  );
};

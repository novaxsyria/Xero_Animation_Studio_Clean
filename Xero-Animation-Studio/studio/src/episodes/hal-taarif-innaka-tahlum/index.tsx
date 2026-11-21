import React from 'react';
import { defineEpisode, LookDef, Timeline, clamp } from '../../engine/episode';
import { SHOTS } from './shots';
import timelineJson from './timeline.json';

export const EPISODE_TIMELINE = timelineJson as Timeline;

export const EPISODE_LOOKS: Record<string, LookDef> = {
  dream: {
    grade: (lv) => `saturate(${1 + 0.08 * lv}) contrast(${1 + 0.04 * lv})`,
    Overlay: ({ lv }) => (
      <g opacity={0.14 * lv}>
        <radialGradient id="dreamEdge" cx="50%" cy="50%" r="70%">
          <stop offset="58%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#1A3C7A" stopOpacity={0.65} />
        </radialGradient>
        <rect width={1920} height={1080} fill="url(#dreamEdge)" />
      </g>
    ),
  },
  science: {
    grade: (lv) => `contrast(${1 + 0.05 * lv}) saturate(${1 + 0.06 * lv})`,
  },
  memory: {
    grade: (lv) => `sepia(${0.12 * lv}) saturate(${1 + 0.14 * lv})`,
    Overlay: ({ lv }) => (
      <g opacity={0.12 * lv}>
        <rect width={1920} height={1080} fill="#FFB85C" opacity={0.14} />
      </g>
    ),
  },
  lucid: {
    grade: (lv) => `brightness(${1 + 0.04 * lv}) saturate(${1 + 0.15 * lv})`,
    Overlay: ({ f, lv }) => {
      const pulse = 0.08 + 0.04 * Math.sin(f * 0.12);
      return <rect width={1920} height={1080} fill="#7AE8FF" opacity={clamp(pulse * lv)} style={{ mixBlendMode: 'screen' }} />;
    },
  },
  dawn: {
    grade: (lv) => `brightness(${1 + 0.03 * lv}) saturate(${1 + 0.12 * lv})`,
  },
};

export const dreamEpisode = defineEpisode('HalTaarifInnakaTahlum', {
  timeline: EPISODE_TIMELINE,
  shots: SHOTS,
  looks: EPISODE_LOOKS,
  grain: false,
  vignette: true,
  bg: '#080A14',
});

export default dreamEpisode;

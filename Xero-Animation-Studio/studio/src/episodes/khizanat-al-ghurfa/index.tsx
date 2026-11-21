import React from 'react';
import { defineEpisode } from '../../engine/episode';
import { LookDef, Timeline } from '../../engine/core';
import { SHOTS } from './shots';
import timelineJson from './timeline.json';

export const KHIZANAT_TIMELINE = timelineJson as Timeline;

export const KHIZANAT_LOOKS: Record<string, LookDef> = {
  amberNoir: {
    grade: (lv) => `contrast(${1 + 0.06 * lv}) saturate(${1 + 0.08 * lv})`,
    Overlay: ({ lv }) => (
      <g opacity={0.18 * lv}>
        <radialGradient id="amberNoirRim" cx="50%" cy="50%" r="72%">
          <stop offset="56%" stopColor="#04050A" stopOpacity={0} />
          <stop offset="100%" stopColor="#050710" stopOpacity={0.72} />
        </radialGradient>
        <rect
          width={KHIZANAT_TIMELINE.width ?? 1080}
          height={KHIZANAT_TIMELINE.height ?? 1920}
          fill="url(#amberNoirRim)"
        />
      </g>
    ),
  },
};

export const khizanatEpisode = defineEpisode('KhizanatAlGhurfa', {
  timeline: KHIZANAT_TIMELINE,
  shots: SHOTS,
  looks: KHIZANAT_LOOKS,
  grain: false,
  vignette: true,
  bg: '#080A14',
});

export default khizanatEpisode;

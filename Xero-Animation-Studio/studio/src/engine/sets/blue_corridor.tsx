import React from 'react';
import { makeRoom, pts } from '../room';
import { Glow, LightVeil, Dust } from '../light';

export const CORRIDOR = makeRoom({ x: 960, y: 495 }, { x0: 760, x1: 1160, y0: 380, y1: 660 }, 4.6);

/** Ornate surreal clock that can spin backwards or tick forward cleanly. */
export const CorridorClock: React.FC<{
  x: number;
  y: number;
  r: number;
  angleMin: number;
  angleHour: number;
  glowColor?: string;
}> = ({ x, y, r, angleMin, angleHour, glowColor = '#7FB4FF' }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * 1.35} fill={glowColor} opacity={0.14} />
    <circle r={r} fill="#0D1633" stroke="#C5A368" strokeWidth={Math.max(4, r * 0.09)} />
    <circle r={r * 0.86} fill="none" stroke="#6884C4" strokeWidth={2} opacity={0.65} />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return (
        <line
          key={i}
          x1={Math.sin(a) * r * 0.72}
          y1={-Math.cos(a) * r * 0.72}
          x2={Math.sin(a) * r * 0.83}
          y2={-Math.cos(a) * r * 0.83}
          stroke="#EAE2D0"
          strokeWidth={i % 3 === 0 ? 4 : 2}
          strokeLinecap="round"
        />
      );
    })}
    <line
      x1={0}
      y1={0}
      x2={Math.sin((angleHour * Math.PI) / 180) * r * 0.48}
      y2={-Math.cos((angleHour * Math.PI) / 180) * r * 0.48}
      stroke="#FFE2A8"
      strokeWidth={Math.max(4, r * 0.06)}
      strokeLinecap="round"
    />
    <line
      x1={0}
      y1={0}
      x2={Math.sin((angleMin * Math.PI) / 180) * r * 0.72}
      y2={-Math.cos((angleMin * Math.PI) / 180) * r * 0.72}
      stroke="#82C6FF"
      strokeWidth={Math.max(3, r * 0.04)}
      strokeLinecap="round"
    />
    <circle r={Math.max(4, r * 0.06)} fill="#FFB85C" />
  </g>
);

export const BlueCorridor: React.FC<{
  t: number;
  id?: string;
  stretch?: number;
  reverseSpeed?: number;
  showMirror?: boolean;
  veil?: number;
}> = ({ t, id = 'bcorr', stretch = 0, reverseSpeed = -7, showMirror = true, veil = 0.36 }) => {
  // stretch pushes the back wall box smaller to create the unsettling endless-hallway vertigo effect
  const shrink = 1 - Math.min(0.45, stretch * 0.45);
  const r = makeRoom(
    { x: 960, y: 495 },
    {
      x0: 960 - 200 * shrink,
      x1: 960 + 200 * shrink,
      y0: 495 - 115 * shrink,
      y1: 495 + 165 * shrink,
    },
    4.6 + stretch * 2.2,
  );
  const { P, Q } = r;

  return (
    <g>
      {/* Ceiling, floor, side walls, back wall */}
      <polygon points={Q([[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]])} fill="#080F26" />
      <polygon points={Q([[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]])} fill="#0A1330" />
      <polygon points={Q([[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]])} fill="#10204A" />
      <polygon points={Q([[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]])} fill="#0E1C42" />
      <polygon points={Q([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]])} fill="#0B1638" />

      {/* Perspective floor runners & checkerboard depth strips */}
      {[0.12, 0.25, 0.38, 0.52, 0.67, 0.83].map((w, i) => (
        <line
          key={`fl${i}`}
          x1={P(0, 1, w).x}
          y1={P(0, 1, w).y}
          x2={P(1, 1, w).x}
          y2={P(1, 1, w).y}
          stroke="#1E3675"
          strokeWidth={2}
          opacity={0.55}
        />
      ))}
      <polygon points={Q([[0.28, 1, 0], [0.72, 1, 0], [0.72, 1, 1], [0.28, 1, 1]])} fill="#16285A" opacity={0.7} />

      {/* Wall molding & repeating recessed frames with sconces */}
      {[0.16, 0.38, 0.62, 0.84].map((w, i) => {
        const s = r.s(w);
        const lP = P(0, 0.42, w);
        const rP = P(1, 0.42, w);
        const lBase = P(0, 0.88, w);
        const rBase = P(1, 0.88, w);
        const flicker = 0.72 + 0.28 * Math.sin(t * 0.11 + i * 1.9);
        return (
          <g key={`sc${i}`}>
            <line x1={lBase.x} y1={lBase.y} x2={P(0, 0.14, w).x} y2={P(0, 0.14, w).y} stroke="#09112A" strokeWidth={3 * s} />
            <line x1={rBase.x} y1={rBase.y} x2={P(1, 0.14, w).x} y2={P(1, 0.14, w).y} stroke="#09112A" strokeWidth={3 * s} />
            <circle cx={lP.x + 8 * s} cy={lP.y} r={5 * s} fill="#88C4FF" opacity={flicker} />
            <circle cx={rP.x - 8 * s} cy={rP.y} r={5 * s} fill="#88C4FF" opacity={flicker} />
            <circle cx={lP.x + 8 * s} cy={lP.y} r={34 * s} fill="#4D8BFF" opacity={0.18 * flicker} style={{ mixBlendMode: 'screen' }} />
            <circle cx={rP.x - 8 * s} cy={rP.y} r={34 * s} fill="#4D8BFF" opacity={0.18 * flicker} style={{ mixBlendMode: 'screen' }} />
          </g>
        );
      })}

      {/* Giant reverse-spinning clock at the back wall */}
      {(() => {
        const cPos = P(0.5, 0.34, 0);
        const cRad = (r.back.x1 - r.back.x0) * 0.24;
        return <CorridorClock x={cPos.x} y={cPos.y} r={cRad} angleMin={t * reverseSpeed} angleHour={t * reverseSpeed * 0.12 - 90} />;
      })()}

      {/* Ornate Mirror directly under the clock */}
      {showMirror ? (
        <g>
          <polygon
            points={pts([
              P(0.35, 0.56, 0),
              P(0.65, 0.56, 0),
              P(0.65, 0.96, 0),
              P(0.35, 0.96, 0),
            ])}
            fill="#1D2E5E"
            stroke="#C5A368"
            strokeWidth={4}
          />
          <polygon
            points={pts([
              P(0.37, 0.58, 0),
              P(0.63, 0.58, 0),
              P(0.63, 0.94, 0),
              P(0.37, 0.94, 0),
            ])}
            fill="#2B4687"
            opacity={0.75}
          />
        </g>
      ) : null}

      <LightVeil
        id={`${id}v`}
        o={veil}
        lights={[
          [960, 495, 290],
          [320, 460, 220],
          [1600, 460, 220],
        ]}
      />
      <Glow x={960} y={465} r={240} kind="cool" o={0.4} />
      <Dust t={t} seed={21} x0={360} y0={220} w={1200} h={620} n={28} o={0.45} />
    </g>
  );
};

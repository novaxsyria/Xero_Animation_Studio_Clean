import React from 'react';
import { makeRoom, Box, pts } from '../room';
import { Glow, LightVeil, Dust } from '../light';
import { RoomShell, FloorShadow, WallFrame } from '../furnish';

export const MUSIC_ROOM = makeRoom({ x: 940, y: 500 }, { x0: 490, x1: 1430, y0: 320, y1: 740 }, 3.4);

/** Detailed procedural Arabic Oud instrument with carved soundbox, rosette, and vibrating strings. */
export const Oud: React.FC<{ x: number; y: number; rot?: number; scale?: number; strum?: number }> = ({
  x,
  y,
  rot = -28,
  scale = 1,
  strum = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    {/* Soundbox */}
    <ellipse cx={0} cy={0} rx={58} ry={76} fill="#7B4B2A" stroke="#1E120C" strokeWidth={4} />
    <ellipse cx={-6} cy={-4} rx={50} ry={66} fill="#966039" />
    {/* Decorative soundholes / rosettes */}
    <circle cx={0} cy={-18} r={22} fill="#2A160D" stroke="#D9A86C" strokeWidth={3} />
    <circle cx={0} cy={-18} r={14} fill="none" stroke="#D9A86C" strokeWidth={1.5} strokeDasharray="3 3" />
    <circle cx={-26} cy={14} r={7} fill="#2A160D" stroke="#D9A86C" strokeWidth={2} />
    <circle cx={26} cy={14} r={7} fill="#2A160D" stroke="#D9A86C" strokeWidth={2} />
    {/* Bridge */}
    <rect x={-28} y={32} width={56} height={10} rx={3} fill="#361E13" stroke="#1E120C" strokeWidth={2} />
    {/* Neck & Pegbox */}
    <rect x={-12} y={-148} width={24} height={78} rx={3} fill="#4D2C1B" stroke="#1E120C" strokeWidth={3.5} />
    <path d="M -11 -148 L -22 -184 L 2 -188 L 11 -148 Z" fill="#3B2114" stroke="#1E120C" strokeWidth={3.5} strokeLinejoin="round" />
    {[-178, -170, -162, -154].map((py, i) => (
      <g key={i}>
        <circle cx={-19} cy={py} r={3} fill="#E6C38A" />
        <circle cx={9} cy={py} r={3} fill="#E6C38A" />
      </g>
    ))}
    {/* Strings (subtle vibration when strum > 0) */}
    {[-8, -4, 0, 4, 8].map((sx, i) => {
      const vib = strum > 0 ? Math.sin(strum * 1.9 + i * 2) * 2.5 : 0;
      return (
        <path
          key={i}
          d={`M ${sx} -146 Q ${sx + vib} -54 ${sx * 1.4} 34`}
          stroke="#F2DFC2"
          strokeWidth={1.5}
          fill="none"
          opacity={0.85}
        />
      );
    })}
  </g>
);

export const MusicRoom: React.FC<{ t: number; id?: string; mist?: number; veil?: number }> = ({
  t,
  id = 'mroom',
  mist = 0,
  veil = 0.36,
}) => {
  const r = MUSIC_ROOM;
  const { P, Q } = r;
  const chairP = P(0.62, 0.84, 0.25);
  const lampP = P(0.79, 0.85, 0.16);

  return (
    <g>
      <g opacity={1 - mist * 0.82}>
        <RoomShell r={r} id={id} wall="#3F2D38" side="#30212B" floorC="#2A1E24" ceiling="#1E151B" lines="#1A1116" />

        {/* Acoustic wood slats on back wall */}
        {[0.12, 0.16, 0.2, 0.24, 0.28].map((u, i) => (
          <line key={i} x1={P(u, 0.12, 0).x} y1={P(u, 0.12, 0).y} x2={P(u, 0.88, 0).x} y2={P(u, 0.88, 0).y} stroke="#5E4039" strokeWidth={8} opacity={0.55} />
        ))}
        <WallFrame x={900} y={370} w={130} h={160} art={1} />

        {/* Warm velvet rug */}
        <polygon points={Q([[0.28, 0.99, 0.15], [0.84, 0.99, 0.15], [0.84, 0.99, 0.62], [0.28, 0.99, 0.62]])} fill="#5C2A36" stroke="#8C4B58" strokeWidth={3} />

        {/* Stool / Armchair for Father */}
        <FloorShadow r={r} u={[0.55, 0.69]} w={[0.18, 0.32]} />
        <Box r={r} u={[0.56, 0.68]} v={[0.74, 0.98]} w={[0.19, 0.31]} front="#4F342A" top="#6B4739" side="#3B261E" rim />

        {/* Music Stand */}
        <line x1={chairP.x - 130} y1={chairP.y + 40} x2={chairP.x - 130} y2={chairP.y - 80} stroke="#2A2229" strokeWidth={6} />
        <polygon points={`${chairP.x - 165},${chairP.y - 105} ${chairP.x - 95},${chairP.y - 105} ${chairP.x - 90},${chairP.y - 68} ${chairP.x - 170},${chairP.y - 68}`} fill="#EDE4D5" stroke="#2A2229" strokeWidth={3} />

        {/* Warm Standing Floor Lamp */}
        <line x1={lampP.x} y1={lampP.y} x2={lampP.x} y2={lampP.y - 240} stroke="#2C2224" strokeWidth={7} />
        <polygon points={`${lampP.x - 38},${lampP.y - 295} ${lampP.x + 38},${lampP.y - 295} ${lampP.x + 56},${lampP.y - 220} ${lampP.x - 56},${lampP.y - 220}`} fill="#FFE1A8" stroke="#241B1D" strokeWidth={3} />

        <LightVeil id={`${id}v`} o={veil} lights={[[lampP.x, lampP.y - 240, 420], [chairP.x - 30, chairP.y - 90, 340]]} />
        <Glow x={lampP.x} y={lampP.y - 240} r={340} kind="warm" o={0.55} />
        <Dust t={t} seed={55} x0={620} y0={280} w={740} h={460} n={32} o={0.5} />
      </g>

      {/* Dissolving dream fog layers when mist > 0 */}
      {mist > 0.02 ? (
        <g opacity={mist}>
          <rect x={0} y={0} width={1920} height={1080} fill="#14182D" opacity={mist * 0.72} />
          {[0, 1, 2, 3, 4].map((i) => {
            const cx = 220 + i * 380 + Math.sin(t * 0.04 + i * 1.4) * 55;
            const cy = 620 - i * 45 + Math.cos(t * 0.03 + i) * 24;
            return <ellipse key={i} cx={cx} cy={cy} rx={420} ry={170} fill="#B8C7EB" opacity={0.18 * mist} />;
          })}
        </g>
      ) : null}
    </g>
  );
};

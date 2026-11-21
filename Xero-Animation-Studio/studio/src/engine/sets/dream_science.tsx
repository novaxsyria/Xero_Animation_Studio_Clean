import React from 'react';
import { clamp, easeOut } from '../anim';
import { FONT } from '../fonts.pure';

export const BlueprintGrid: React.FC<{ id?: string; accent?: string }> = ({ id = 'dsci', accent = '#58B4FF' }) => (
  <g>
    <rect width={1920} height={1080} fill="#080D1B" />
    <defs>
      <pattern id={`${id}sm`} width={48} height={48} patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke={accent} strokeWidth={0.7} opacity={0.12} />
      </pattern>
      <pattern id={`${id}lg`} width={240} height={240} patternUnits="userSpaceOnUse">
        <rect width={240} height={240} fill={`url(#${id}sm)`} />
        <path d="M 240 0 L 0 0 0 240" fill="none" stroke={accent} strokeWidth={1.2} opacity={0.25} />
      </pattern>
    </defs>
    <rect width={1920} height={1080} fill={`url(#${id}lg)`} />
    {/* Crisp registration corner ticks */}
    {[
      [48, 48, 1, 1],
      [1872, 48, -1, 1],
      [48, 1032, 1, -1],
      [1872, 1032, -1, -1],
    ].map(([x, y, sx, sy], i) => (
      <path key={i} d={`M ${x} ${y + 28 * sy} L ${x} ${y} L ${x + 28 * sx} ${y}`} fill="none" stroke="#85C8FF" strokeWidth={2.5} opacity={0.55} />
    ))}
  </g>
);

/** Crisp lateral brain schematic with selectable Prefrontal Cortex & REM activity glow. */
export const BrainDiagram: React.FC<{
  x: number;
  y: number;
  scale?: number;
  t: number;
  pfcActive?: number;
  visualActive?: number;
}> = ({ x, y, scale = 1, t, pfcActive = 0.25, visualActive = 0.95 }) => {
  const pulse = 0.8 + 0.2 * Math.sin(t * 0.14);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Outer cortex silhouette */}
      <path
        d="M -210 20 C -220 -95, -135 -175, -10 -175 C 125 -175, 225 -95, 220 20 C 218 90, 155 125, 88 122 C 60 120, 42 155, 18 178 L -18 178 C -10 140, -14 118, -42 115 C -135 112, -205 85, -210 20 Z"
        fill="#132245"
        stroke="#82C4FF"
        strokeWidth={4}
      />
      {/* Sulci gyri contour lines */}
      <path d="M -125 -80 Q -65 -115 -10 -78 T 95 -88 M -150 -10 Q -80 -38 -25 -5 T 115 -22 M -90 55 Q -20 35 45 62" fill="none" stroke="#5385C7" strokeWidth={3} strokeLinecap="round" opacity={0.65} />

      {/* Prefrontal Cortex region (left/front) */}
      <circle cx={-125} cy={-35} r={62} fill={pfcActive > 0.5 ? '#75F0B5' : '#4C608A'} opacity={0.22 + 0.45 * pfcActive} />
      <circle cx={-125} cy={-35} r={42} fill="none" stroke={pfcActive > 0.5 ? '#75F0B5' : '#7388B5'} strokeWidth={2.5} strokeDasharray="6 6" />

      {/* Visual & Limbic REM activity region (back/center) */}
      <circle cx={115} cy={-10} r={74} fill="#FFB85C" opacity={0.25 * visualActive * pulse} />
      <circle cx={20} cy={12} r={54} fill="#FF7396" opacity={0.25 * visualActive * pulse} />
    </g>
  );
};

/** Live oscillating EEG / Sleep Stage Waveform. */
export const EEGWave: React.FC<{ x: number; y: number; w: number; h: number; t: number; freq?: number; amp?: number; color?: string }> = ({
  x,
  y,
  w,
  h,
  t,
  freq = 0.04,
  amp = 0.75,
  color = '#7AE8FF',
}) => {
  const pts: string[] = [];
  for (let i = 0; i <= 72; i++) {
    const px = (i / 72) * w;
    const py =
      Math.sin(i * freq * 8 + t * 0.28) * (h * 0.32 * amp) +
      Math.cos(i * freq * 19 - t * 0.42) * (h * 0.18 * amp);
    pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1={0} y1={0} x2={w} y2={0} stroke="#2B4275" strokeWidth={1.5} strokeDasharray="6 6" />
      <path d={pts.join(' ')} fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** Animated Tetris blocks cascading smoothly for the Tetris Effect science scene. */
export const TetrisCascade: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const shapes = [
    { color: '#63D9FF', cells: [[0, 0], [1, 0], [2, 0], [3, 0]], ox: 0, sp: 2.1 },
    { color: '#FFB85C', cells: [[0, 0], [1, 0], [0, 1], [1, 1]], ox: 150, sp: 1.7 },
    { color: '#D47AFF', cells: [[0, 0], [1, 0], [2, 0], [1, 1]], ox: 300, sp: 2.4 },
    { color: '#70F0A4', cells: [[1, 0], [2, 0], [0, 1], [1, 1]], ox: 440, sp: 1.9 },
    { color: '#FF708A', cells: [[0, 0], [1, 0], [1, 1], [2, 1]], ox: 580, sp: 2.2 },
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      {shapes.map((sh, i) => {
        const dy = ((t * sh.sp * 2.2 + i * 95) % 440) - 60;
        const o = clamp(1 - Math.abs(dy - 180) / 240);
        return (
          <g key={i} transform={`translate(${sh.ox} ${dy})`} opacity={o}>
            {sh.cells.map(([cx, cy], ci) => (
              <rect key={ci} x={cx * 32} y={cy * 32} width={30} height={30} rx={4} fill={sh.color} stroke="#091024" strokeWidth={2.5} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

/** Hypnogram sleep cycle bar chart highlighting REM bursts. */
export const HypnogramChart: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const prog = easeOut(clamp(t / 55));
  const stages = [
    { label: 'Awake', y: 0, w: 70, c: '#9EB3D8' },
    { label: 'N1', y: 46, w: 100, c: '#6598E6' },
    { label: 'N2', y: 92, w: 160, c: '#4876C4' },
    { label: 'N3', y: 138, w: 180, c: '#2E4C8F' },
    { label: 'REM', y: 24, w: 210, c: '#FFB85C' },
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-20} y={-35} width={780} height={240} rx={12} fill="#0D1630" stroke="#2D467D" strokeWidth={2} />
      {stages.map((st, i) => (
        <g key={i}>
          <text x={0} y={st.y + 18} fontFamily={FONT.ui} fontSize={20} fill={st.label === 'REM' ? '#FFB85C' : '#8BA4D0'}>
            {st.label}
          </text>
        </g>
      ))}
      <path
        d="M 95 10 L 165 10 L 165 56 L 265 56 L 265 102 L 425 102 L 425 148 L 545 148 L 545 34 L 735 34"
        fill="none"
        stroke="#7AE8FF"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={1000}
        strokeDashoffset={1000 * (1 - prog)}
      />
      <rect x={545} y={14} width={190 * prog} height={42} rx={6} fill="#FFB85C" opacity={0.22} />
    </g>
  );
};

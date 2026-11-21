import React from 'react';
import { rnd } from '../anim';
import { Hero, LOOKS, walkPose, poseAt } from '../rig';

export const DawnStreet: React.FC<{ t: number; id?: string }> = ({ t, id = 'dawnst' }) => {
  const lightCycle = (t % 120) < 75 ? 'red' : 'green';
  return (
    <g>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B5D9E" />
          <stop offset="55%" stopColor="#94A8D6" />
          <stop offset="100%" stopColor="#FFD29E" />
        </linearGradient>
      </defs>
      <rect width={1920} height={1080} fill={`url(#${id}sky)`} />

      {/* Warm morning sun low over the skyline */}
      <circle cx={1460} cy={380} r={190} fill="#FFE2A8" opacity={0.28} />
      <circle cx={1460} cy={380} r={76} fill="#FFF2CE" />

      {/* Distant cityscape silhouettes */}
      {[
        { x: 0, w: 220, h: 460, c: '#33446B' },
        { x: 210, w: 180, h: 520, c: '#293859' },
        { x: 380, w: 260, h: 410, c: '#384B75' },
        { x: 630, w: 200, h: 560, c: '#2C3B5E' },
        { x: 820, w: 240, h: 430, c: '#3D507D' },
        { x: 1050, w: 190, h: 490, c: '#2E3D63' },
        { x: 1230, w: 260, h: 390, c: '#3B4D78' },
        { x: 1480, w: 220, h: 510, c: '#2A395C' },
        { x: 1690, w: 250, h: 440, c: '#364770' },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={760 - b.h} width={b.w} height={b.h} fill={b.c} />
      ))}

      {/* Street & Sidewalk */}
      <rect x={0} y={760} width={1920} height={90} fill="#5C5F73" />
      <rect x={0} y={850} width={1920} height={230} fill="#2A2D3D" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={80 + i * 200} y={950} width={96} height={12} rx={4} fill="#D9CFAF" opacity={0.55} />
      ))}

      {/* Traffic Signal */}
      <g transform="translate(1320 560)">
        <rect x={-8} y={0} width={16} height={220} fill="#262A38" />
        <rect x={-26} y={-88} width={52} height={110} rx={10} fill="#1B1E29" stroke="#3E455C" strokeWidth={3} />
        <circle cx={0} cy={-60} r={12} fill={lightCycle === 'red' ? '#FF594A' : '#4A2624'} />
        <circle cx={0} cy={-30} r={12} fill="#4D4224" />
        <circle cx={0} cy={0} r={12} fill={lightCycle === 'green' ? '#58E68C' : '#224730'} />
      </g>

      {/* Cars waiting at the traffic light */}
      {[
        { x: 860, c: '#48608C', w: 210 },
        { x: 580, c: '#7A4D58', w: 195 },
        { x: 290, c: '#3F6E6A', w: 205 },
      ].map((car, i) => {
        const creep = lightCycle === 'green' ? (t - 75) * 4 : Math.sin(t * 0.25 + i) * 1.2;
        return (
          <g key={i} transform={`translate(${car.x + creep} 865)`}>
            <path d={`M 0 18 L 24 -26 L ${car.w - 58} -26 L ${car.w - 18} 8 L ${car.w} 18 L ${car.w} 46 L 0 46 Z`} fill={car.c} stroke="#141826" strokeWidth={3} />
            <path d={`M 36 -18 L ${car.w - 64} -18 L ${car.w - 34} 6 L 24 6 Z`} fill="#A9CEFF" opacity={0.75} />
            <circle cx={42} cy={48} r={20} fill="#181A24" stroke="#505870" strokeWidth={4} />
            <circle cx={car.w - 42} cy={48} r={20} fill="#181A24" stroke="#505870" strokeWidth={4} />
            <circle cx={car.w - 4} cy={24} r={6} fill="#FFE79E" />
          </g>
        );
      })}

      {/* Walking commuters on sidewalk */}
      <Hero pose={walkPose(260 + t * 2.2, t * 0.35, 790, 0.56, { expr: 'neutral' }, 1)} look={LOOKS.commuter} rimId="rimR" />
      <Hero pose={walkPose(1620 - t * 1.8, t * 0.32, 795, 0.58, { expr: 'happy' }, -1)} look={LOOKS.mom} rimId="rimR" />
      <Hero pose={poseAt(t, [{ f: 0, p: { x: 1120, y: 715, scale: 0.55, yaw: 0.3 } }])} look={LOOKS.suit} rimId="rimR" />

      {/* Flying Morning Birds */}
      {[0, 1, 2, 3, 4].map((i) => {
        const bx = 340 + i * 165 + t * (2.6 + (i % 2) * 0.7);
        const by = 180 + rnd(33, i) * 140 + Math.sin(t * 0.14 + i) * 16;
        const flap = Math.sin(t * 0.36 + i * 1.3) * 12;
        return (
          <path
            key={i}
            d={`M ${bx - 18} ${by + flap} Q ${bx - 6} ${by - 10} ${bx} ${by} Q ${bx + 6} ${by - 10} ${bx + 18} ${by + flap}`}
            fill="none"
            stroke="#1D2642"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

import React from 'react';
import { rnd } from '../anim';
import { FONT } from '../fonts.pure';

/** Swimming luminous sky-fish for Rakan's surreal city above the clouds. */
export const SkyFish: React.FC<{ x: number; y: number; scale?: number; dir?: 1 | -1; t: number; color?: string }> = ({
  x,
  y,
  scale = 1,
  dir = 1,
  t,
  color = '#7CE8FF',
}) => {
  const wag = Math.sin(t * 0.22) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * scale} ${scale})`}>
      <ellipse cx={0} cy={0} rx={46} ry={18} fill={color} opacity={0.88} />
      <ellipse cx={8} cy={-4} rx={28} ry={8} fill="#FFFFFF" opacity={0.28} />
      <path d={`M -40 0 L ${-74} ${-22 + wag} L ${-64} 0 L ${-74} ${22 + wag} Z`} fill={color} opacity={0.78} />
      <path d="M -8 -16 Q 6 -34 22 -14 Z" fill={color} opacity={0.7} />
      <circle cx={28} cy={-4} r={4} fill="#0F1836" />
      <circle cx={29} cy={-5} r={1.4} fill="#FFFFFF" />
    </g>
  );
};

/** Hovering flying sky-car with twin headlight glow. */
export const SkyCar: React.FC<{ x: number; y: number; scale?: number; dir?: 1 | -1; color?: string }> = ({
  x,
  y,
  scale = 1,
  dir = 1,
  color = '#3B4878',
}) => (
  <g transform={`translate(${x} ${y}) scale(${dir * scale} ${scale})`}>
    <path d="M -48 8 L -34 -16 L 18 -16 L 44 4 L 54 14 L -50 14 Z" fill={color} stroke="#14182E" strokeWidth={2.5} />
    <path d="M -24 -12 L 14 -12 L 30 2 L -28 2 Z" fill="#82D4FF" opacity={0.8} />
    <ellipse cx={-28} cy={17} rx={12} ry={4} fill="#72F0FF" opacity={0.85} />
    <ellipse cx={28} cy={17} rx={12} ry={4} fill="#72F0FF" opacity={0.85} />
    <circle cx={52} cy={9} r={4} fill="#FFE8A3" />
    <polygon points="52,6 150,-10 150,28 52,12" fill="#FFE8A3" opacity={0.14} />
  </g>
);

/** Elevated sky-train gliding smoothly on a light rail between floating towers. */
export const SkyTrain: React.FC<{ y: number; progress: number; cars?: number }> = ({ y, progress, cars = 4 }) => {
  const x = -400 + (progress % 1) * 2720;
  return (
    <g>
      <line x1={-100} y1={y + 26} x2={2020} y2={y + 26} stroke="#5F8BFF" strokeWidth={3} opacity={0.35} />
      <g transform={`translate(${x} ${y})`}>
        {Array.from({ length: cars }).map((_, i) => (
          <g key={i} transform={`translate(${-i * 126} 0)`}>
            <rect x={0} y={-14} width={116} height={34} rx={8} fill="#25325C" stroke="#85B8FF" strokeWidth={2.5} />
            {[16, 40, 64, 88].map((wx, wi) => (
              <rect key={wi} x={wx} y={-6} width={14} height={12} rx={2} fill="#FFE29E" opacity={0.9} />
            ))}
          </g>
        ))}
      </g>
    </g>
  );
};

export const CloudCity: React.FC<{
  t: number;
  id?: string;
  lucid?: number;
  tilt?: number;
  billboardText?: string;
}> = ({ t, id = 'ccity', lucid = 0, tilt = 0, billboardText }) => {
  const skyTop = lucid > 0.5 ? '#12214A' : '#18143B';
  const skyMid = lucid > 0.5 ? '#254C82' : '#3C2763';
  const skyBot = lucid > 0.5 ? '#6DA2D6' : '#85588A';

  return (
    <g transform={`rotate(${tilt} 960 540)`}>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="58%" stopColor={skyMid} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
        <linearGradient id={`${id}twr`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1D264D" />
          <stop offset="100%" stopColor="#2F3D73" />
        </linearGradient>
      </defs>
      <rect x={-200} y={-200} width={2320} height={1480} fill={`url(#${id}sky)`} />

      {/* Stars high above */}
      {Array.from({ length: 48 }).map((_, i) => (
        <circle
          key={`st${i}`}
          cx={rnd(11, i) * 1920}
          cy={rnd(13, i) * 420}
          r={1 + rnd(15, i) * 1.8}
          fill="#F4F7FF"
          opacity={0.35 + 0.5 * Math.sin(t * 0.06 + i)}
        />
      ))}

      {/* Far floating cloud banks */}
      {Array.from({ length: 10 }).map((_, i) => {
        const cx = ((i * 250 + t * (0.4 + (i % 3) * 0.25)) % 2300) - 200;
        const cy = 760 + (i % 3) * 85;
        return <ellipse key={`clb${i}`} cx={cx} cy={cy} rx={240 + (i % 2) * 80} ry={66} fill="#B8C8EB" opacity={0.28} />;
      })}

      {/* Floating Skyscraper Spires */}
      {[
        { x: 180, y: 260, w: 140, h: 520, bob: 0 },
        { x: 420, y: 190, w: 170, h: 640, bob: 1.4 },
        { x: 760, y: 240, w: 150, h: 560, bob: 2.3 },
        { x: 1120, y: 160, w: 190, h: 680, bob: 0.8 },
        { x: 1450, y: 220, w: 160, h: 580, bob: 2.9 },
        { x: 1690, y: 290, w: 135, h: 490, bob: 1.8 },
      ].map((b, i) => {
        const dy = lucid > 0.5 ? 0 : Math.sin(t * 0.045 + b.bob) * 14;
        return (
          <g key={`tw${i}`} transform={`translate(0 ${dy})`}>
            <polygon points={`${b.x},${b.y} ${b.x + b.w},${b.y} ${b.x + b.w - 16},${b.y + b.h} ${b.x + 16},${b.y + b.h}`} fill={`url(#${id}twr)`} stroke="#111630" strokeWidth={3} />
            <polygon points={`${b.x + b.w * 0.35},${b.y} ${b.x + b.w * 0.5},${b.y - 44} ${b.x + b.w * 0.65},${b.y}`} fill="#3C4E8C" />
            {Array.from({ length: 12 }).map((_, wi) => (
              <rect
                key={wi}
                x={b.x + 22 + (wi % 3) * (b.w * 0.25)}
                y={b.y + 28 + Math.floor(wi / 3) * 44}
                width={16}
                height={22}
                rx={2}
                fill={lucid > 0.5 ? '#FFE6A8' : '#85C4FF'}
                opacity={0.45 + 0.4 * rnd(7 + i, wi)}
              />
            ))}
          </g>
        );
      })}

      {/* Sky-Train passing between towers */}
      <SkyTrain y={435} progress={0.18 + t * 0.0042} />

      {/* Flying Cars */}
      <SkyCar x={((t * 4.5 + 200) % 2300) - 200} y={320} scale={0.9} dir={1} />
      <SkyCar x={2100 - ((t * 3.8 + 600) % 2300)} y={580} scale={0.75} dir={-1} color="#58467A" />

      {/* Swimming Sky-Fish */}
      <SkyFish x={((t * 2.4 + 340) % 2200) - 140} y={240 + Math.sin(t * 0.07) * 24} scale={1.05} dir={1} t={t} />
      <SkyFish x={2080 - ((t * 1.9 + 900) % 2200)} y={520 + Math.cos(t * 0.06) * 22} scale={0.82} dir={-1} t={t + 12} color="#FFA9D6" />

      {/* Optional Tower Billboard ("العودة" or "البداية") */}
      {billboardText ? (
        <g transform="translate(1215 160)">
          <rect x={-165} y={-76} width={330} height={110} rx={12} fill="#0E1530" stroke="#7AE8FF" strokeWidth={5} />
          <text
            x={0}
            y={-4}
            textAnchor="middle"
            direction="rtl"
            fontFamily={FONT.ar}
            fontWeight={800}
            fontSize={58}
            fill="#FFE28A"
            style={{ filter: 'drop-shadow(0 0 14px rgba(255,226,138,0.65))' }}
          >
            {billboardText}
          </text>
        </g>
      ) : null}

      {/* Near foreground rolling clouds */}
      {Array.from({ length: 7 }).map((_, i) => {
        const cx = ((i * 340 - t * 0.7) % 2400 + 2400) % 2400 - 220;
        return <ellipse key={`clf${i}`} cx={cx} cy={960 + (i % 2) * 35} rx={300} ry={92} fill="#E4ECFF" opacity={0.34} />;
      })}
    </g>
  );
};

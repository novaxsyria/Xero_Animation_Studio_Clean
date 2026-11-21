import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, basePose, Pose, LOOKS, CastName, KitDefs, SetDefs, RakanBedroom, FONT } from './engine';

const Label: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT.ui} fontSize={22} fill="#F6EFE3" letterSpacing={2}>
    {text}
  </text>
);

const P = (o: Partial<Pose>): Pose => ({ ...basePose, ...o });

const XERO_CAST: { key: CastName; label: string; scale?: number }[] = [
  { key: 'amberNoir', label: 'AMBER NOIR', scale: 0.85 },
  { key: 'rakan', label: 'RAKAN (DREAM)', scale: 0.85 },
  { key: 'rakanSleep', label: 'RAKAN (SLEEP)', scale: 0.85 },
  { key: 'youngRakan', label: 'RAKAN (AGE 9)', scale: 0.68 },
  { key: 'father', label: 'FATHER', scale: 0.88 },
  { key: 'commuter', label: 'COMMUTER', scale: 0.84 },
];

export const CastSheet: React.FC = () => {
  const row1 = 440;
  const row2 = 885;
  const poses: { name: string; p: Partial<Pose> }[] = [
    { name: 'shock', p: { armL: { a: -50, b: -30 }, armR: { a: 50, b: 30 }, expr: 'shock', yaw: -0.35, look: -0.6 } },
    { name: '6-fingers', p: { armL: { a: -65, b: -35 }, handL: 'six', expr: 'worried', yaw: 0.25 } },
    { name: 'telekinesis', p: { armR: { a: -86, b: -6 }, handR: 'point', expr: 'cool', yaw: -0.7, glint: 1, glintColor: '#7AE8FF' } },
    { name: 'lucid calm', p: { armL: { a: -20, b: -12 }, armR: { a: 20, b: 12 }, expr: 'happy', glint: 1, glintColor: '#FFE28A' } },
    { name: 'dawn peace', p: { armL: { a: -115, b: -20 }, armR: { a: 115, b: 20 }, expr: 'happy', yaw: 0.1 } },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0E1224' }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" shapeRendering="geometricPrecision">
        <KitDefs />
        <SetDefs />
        <RakanBedroom t={0} id="cast" dawn veil={0.45} />
        <rect width={1920} height={1080} fill="#080B18" opacity={0.55} />
        {XERO_CAST.map((c, i) => {
          const x = 180 + i * 310;
          const sc = c.scale ?? 0.84;
          return (
            <g key={c.key}>
              <Hero look={LOOKS[c.key]} pose={P({ x, y: row1 + (0.88 - sc) * 320, scale: sc, yaw: i % 2 ? -0.3 : 0.3, expr: 'happy' })} shadow={0.6} />
              <Label x={x} y={row1 + 170} text={c.label} />
            </g>
          );
        })}
        {poses.map((q, i) => (
          <g key={q.name}>
            <Hero look={LOOKS.rakan} pose={P({ x: 220 + i * 370, y: row2 - 30, scale: 0.74, ...q.p })} shadow={0.6} />
            <Label x={220 + i * 370} y={row2 + 115} text={q.name.toUpperCase()} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

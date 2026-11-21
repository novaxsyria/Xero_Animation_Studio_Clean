import React from 'react';
import { makeRoom, Box, Pt } from '../room';
import { Glow, Cone, LightVeil, Dust } from '../light';
import { RoomShell, BackWindow, WallFrame, FloorShadow, FloorPlant } from '../furnish';
import { FONT } from '../fonts.pure';

export const RAKAN_ROOM = makeRoom({ x: 940, y: 500 }, { x0: 470, x1: 1450, y0: 310, y1: 745 }, 3.4);

const BED = { u0: 0.04, u1: 0.42, top: 0.78, w1: 0.48 };
export const RAKAN_WINDOW = { x0: 1060, x1: 1350, y0: 360, y1: 605, moon: { x: 1140, y: 420 } };

export const rakanBedSit = (u = 0.23, w = 0.09) => {
  const p = RAKAN_ROOM.P(u, BED.top - 0.02, w);
  return { x: p.x, y: p.y, scale: (0.64 * 422 * RAKAN_ROOM.s(w)) / 378 };
};

export const RAKAN_LAMP: Pt = (() => {
  const p = RAKAN_ROOM.P(0.51, 0.77, 0.055);
  return { x: p.x, y: p.y - 96 };
})();

export const RakanDuvet: React.FC<{ from?: number; knees?: number; dawn?: boolean }> = ({ from = 0.14, knees = 0, dawn = false }) => {
  const { Q, P } = RAKAN_ROOM;
  const kn = P(0.22, BED.top, from + 0.14);
  const topC = dawn ? '#5A6D9E' : '#3C4B78';
  const frontC = dawn ? '#495A87' : '#2E3A60';
  const sideC = dawn ? '#3D4B74' : '#252F50';
  return (
    <g>
      <polygon points={Q([[BED.u0 - 0.01, BED.top - 0.01, from], [BED.u1 + 0.01, BED.top - 0.01, from], [BED.u1 + 0.012, BED.top - 0.01, BED.w1 + 0.012], [BED.u0 - 0.01, BED.top - 0.01, BED.w1 + 0.012]])} fill={topC} />
      <polygon points={Q([[BED.u0 - 0.01, BED.top - 0.01, BED.w1 + 0.012], [BED.u1 + 0.012, BED.top - 0.01, BED.w1 + 0.012], [BED.u1 + 0.012, 0.94, BED.w1 + 0.012], [BED.u0 - 0.01, 0.94, BED.w1 + 0.012]])} fill={frontC} />
      <polygon points={Q([[BED.u1 + 0.012, BED.top - 0.01, from], [BED.u1 + 0.012, BED.top - 0.01, BED.w1 + 0.012], [BED.u1 + 0.012, 0.95, BED.w1 + 0.012], [BED.u1 + 0.012, 0.95, from]])} fill={sideC} />
      {[0.23, 0.32, 0.41].map((w, i) => (
        <path key={i} d={`M ${P(BED.u0, BED.top - 0.01, w).x} ${P(BED.u0, BED.top - 0.01, w).y} L ${P(BED.u1, BED.top - 0.01, w).x} ${P(BED.u1, BED.top - 0.01, w).y}`} stroke="#232C4A" strokeWidth={2.5} opacity={0.65} />
      ))}
      <polygon points={Q([[BED.u0 - 0.01, BED.top - 0.012, from], [BED.u1 + 0.012, BED.top - 0.012, from], [BED.u1 + 0.012, BED.top - 0.012, from + 0.035], [BED.u0 - 0.01, BED.top - 0.012, from + 0.035]])} fill="#E4DDD0" />
      {knees > 0 ? <ellipse cx={kn.x} cy={kn.y - 16 * knees} rx={72 * RAKAN_ROOM.s(from + 0.14)} ry={24 * knees * RAKAN_ROOM.s(from + 0.14)} fill={topC} /> : null}
    </g>
  );
};

export const RakanBedroom: React.FC<{
  t: number;
  id?: string;
  veil?: number;
  duvet?: boolean;
  lamp?: number;
  phoneGlow?: number;
  phoneTime?: string;
  doorOpen?: number;
  knockWave?: number;
  dawn?: number;
  curtainOpen?: number;
  stickyNote?: boolean;
  acOn?: boolean;
}> = ({
  t,
  id = 'rbed',
  veil = 0.42,
  duvet = true,
  lamp = 0.85,
  phoneGlow = 0.9,
  phoneTime = '03:07',
  doorOpen = 0,
  knockWave = 0,
  dawn = 0,
  curtainOpen = 0.15,
  stickyNote = false,
  acOn = false,
}) => {
  const r = RAKAN_ROOM;
  const { P, Q } = r;
  const wallC = dawn > 0.5 ? '#3C405E' : '#262B45';
  const sideC = dawn > 0.5 ? '#2E334D' : '#1E2238';
  const floorC = dawn > 0.5 ? '#352B36' : '#221C2A';
  const ceilC = dawn > 0.5 ? '#24273E' : '#121524';
  const phoneP = P(0.455, 0.77, 0.08);
  const lampP = P(0.51, 0.77, 0.055);
  const kPhone = r.s(0.08);
  const kLamp = r.s(0.055);

  return (
    <g>
      <RoomShell r={r} id={id} wall={wallC} side={sideC} floorC={floorC} ceiling={ceilC} lines="#151320" />

      {/* AC unit high on back wall */}
      <g>
        <rect x={680} y={322} width={220} height={52} rx={8} fill={dawn > 0.5 ? '#D4D9E6' : '#8A93AD'} stroke="#1A1D2B" strokeWidth={3} />
        <rect x={695} y={358} width={190} height={8} rx={3} fill="#252A3D" />
        <circle cx={882} cy={340} r={4} fill={acOn ? '#6BF09E' : '#4A5268'} />
        {acOn
          ? [0, 1, 2].map((i) => {
              const dy = ((t * 1.4 + i * 16) % 48);
              return (
                <path
                  key={`ac${i}`}
                  d={`M ${710 + i * 65} ${372 + dy} Q ${725 + i * 65} ${382 + dy} ${740 + i * 65} ${372 + dy}`}
                  stroke="#A8D8FF"
                  strokeWidth={2.5}
                  fill="none"
                  opacity={Math.max(0, 0.55 - dy / 50)}
                />
              );
            })
          : null}
      </g>

      {/* Left wall: Bedroom door (closed, knocking, or opening onto blue corridor) */}
      <g>
        <polygon points={Q([[0, 0.18, 0.48], [0, 0.18, 0.78], [0, 1, 0.78], [0, 1, 0.48]])} fill="#141726" />
        {doorOpen > 0.02 ? (
          <polygon points={Q([[0, 0.21, 0.5], [0, 0.21, 0.5 + 0.24 * doorOpen], [0, 1, 0.5 + 0.24 * doorOpen], [0, 1, 0.5]])} fill="#1B3C7A" />
        ) : null}
        <polygon
          points={Q([
            [0.05 * doorOpen, 0.21, 0.5 + 0.24 * doorOpen],
            [0, 0.21, 0.76],
            [0, 1, 0.76],
            [0.05 * doorOpen, 1, 0.5 + 0.24 * doorOpen],
          ])}
          fill="#37314B"
          stroke="#191626"
          strokeWidth={3}
        />
        <circle cx={P(0.04 * doorOpen, 0.61, 0.53 + 0.2 * doorOpen).x} cy={P(0.04 * doorOpen, 0.61, 0.53 + 0.2 * doorOpen).y} r={8} fill="#D9B16A" />
        {knockWave > 0 ? (
          <g>
            {[0, 1].map((i) => {
              const rW = 24 + (knockWave + i * 0.35) * 90;
              return <circle key={i} cx={P(0, 0.52, 0.63).x} cy={P(0, 0.52, 0.63).y} r={rW} fill="none" stroke="#FFB85C" strokeWidth={4} opacity={Math.max(0, 0.75 - knockWave - i * 0.25)} />;
            })}
          </g>
        ) : null}
      </g>

      {/* Wall frame above bed */}
      <WallFrame x={535} y={392} w={118} h={148} art={1} />
      <WallFrame x={682} y={406} w={98} h={120} art={2} />

      {/* Back window: night moon OR warm dawn sunrise */}
      <BackWindow
        r={r}
        id={`${id}w`}
        t={t}
        x0={RAKAN_WINDOW.x0}
        x1={RAKAN_WINDOW.x1}
        y0={RAKAN_WINDOW.y0}
        y1={RAKAN_WINDOW.y1}
        sun={RAKAN_WINDOW.moon}
        cols={2}
        night={dawn < 0.5}
      />

      {/* Curtains with animated opening */}
      {(() => {
        const wSpan = RAKAN_WINDOW.x1 - RAKAN_WINDOW.x0;
        const cW = (wSpan * 0.48) * (1 - curtainOpen * 0.78);
        const sway = Math.sin(t * 0.05) * 4;
        return (
          <g>
            <rect x={RAKAN_WINDOW.x0 - 14} y={RAKAN_WINDOW.y0 - 12} width={wSpan + 28} height={10} rx={5} fill="#262030" />
            <path d={`M ${RAKAN_WINDOW.x0} ${RAKAN_WINDOW.y0} L ${RAKAN_WINDOW.x0 + cW + sway} ${RAKAN_WINDOW.y0} L ${RAKAN_WINDOW.x0 + cW - sway} ${RAKAN_WINDOW.y1 + 40} L ${RAKAN_WINDOW.x0} ${RAKAN_WINDOW.y1 + 40} Z`} fill="#2C3252" stroke="#181B2E" strokeWidth={2} />
            <path d={`M ${RAKAN_WINDOW.x1 - cW - sway} ${RAKAN_WINDOW.y0} L ${RAKAN_WINDOW.x1} ${RAKAN_WINDOW.y0} L ${RAKAN_WINDOW.x1} ${RAKAN_WINDOW.y1 + 40} L ${RAKAN_WINDOW.x1 - cW + sway} ${RAKAN_WINDOW.y1 + 40} Z`} fill="#2C3252" stroke="#181B2E" strokeWidth={2} />
            {dawn > 0.35 ? (
              <polygon
                points={`${RAKAN_WINDOW.x0 + cW},${RAKAN_WINDOW.y0} ${RAKAN_WINDOW.x1 - cW},${RAKAN_WINDOW.y0} ${RAKAN_WINDOW.x1 + 120},980 ${RAKAN_WINDOW.x0 - 180},980`}
                fill="#FFD696"
                opacity={0.22 * dawn}
                style={{ mixBlendMode: 'screen' }}
              />
            ) : null}
          </g>
        );
      })()}

      {/* Right wall: Tall Mirror with optional yellow sticky note */}
      <g>
        <polygon points={Q([[1, 0.24, 0.36], [1, 0.24, 0.64], [1, 0.82, 0.64], [1, 0.82, 0.36]])} fill="#2A2029" stroke="#171219" strokeWidth={4} />
        <polygon points={Q([[1, 0.265, 0.38], [1, 0.265, 0.62], [1, 0.795, 0.62], [1, 0.795, 0.38]])} fill={dawn > 0.5 ? '#6B7EA3' : '#25314F'} opacity={0.85} />
        {stickyNote ? (
          <g transform={`translate(${P(1, 0.44, 0.42).x - 28} ${P(1, 0.44, 0.42).y}) rotate(-4)`}>
            <rect width={42} height={42} rx={3} fill="#FFE27A" stroke="#C9A234" strokeWidth={2} />
            <path d="M 8 14 L 34 14 M 10 24 L 32 24 M 14 33 L 28 33" stroke="#362C1E" strokeWidth={2.5} strokeLinecap="round" />
          </g>
        ) : null}
      </g>

      {/* Bed Frame & Headboard */}
      <FloorShadow r={r} u={[BED.u0, BED.u1]} w={[0.02, BED.w1]} />
      <Box r={r} u={[BED.u0, BED.u1]} v={[0.56, 0.96]} w={[0, 0.03]} front="#493530" top="#614740" side="#342522" rim />
      <Box r={r} u={[BED.u0, BED.u1]} v={[BED.top, 0.95]} w={[0.03, BED.w1]} front="#3A2A27" top="#EFE8D9" side="#2B1E1C" />
      <polygon points={Q([[BED.u0 + 0.04, BED.top - 0.04, 0.04], [BED.u1 - 0.04, BED.top - 0.04, 0.04], [BED.u1 - 0.04, BED.top, 0.13], [BED.u0 + 0.04, BED.top, 0.13]])} fill="#EAE2D3" />
      {duvet ? <RakanDuvet dawn={dawn > 0.5} /> : null}

      {/* Nightstand with Smartphone + Bedside Lamp */}
      <FloorShadow r={r} u={[0.43, 0.54]} w={[0.01, 0.12]} />
      <Box r={r} u={[0.43, 0.54]} v={[0.77, 1]} w={[0.01, 0.12]} front="#48342F" top="#60463F" side="#352522" rim />
      {/* Smartphone glowing on nightstand */}
      <g transform={`translate(${phoneP.x} ${phoneP.y - 6})`}>
        <rect x={-26 * kPhone} y={-8 * kPhone} width={52 * kPhone} height={14 * kPhone} rx={4} fill="#141828" stroke="#080A12" strokeWidth={2} />
        {phoneGlow > 0.05 ? (
          <g opacity={phoneGlow}>
            <rect x={-22 * kPhone} y={-6 * kPhone} width={44 * kPhone} height={10 * kPhone} rx={2} fill="#5DA8FF" />
            <text x={0} y={-14 * kPhone} textAnchor="middle" fontFamily={FONT.ui} fontSize={18} fill="#A8D4FF">
              {phoneTime}
            </text>
          </g>
        ) : null}
      </g>
      {/* Lamp */}
      <g>
        <rect x={lampP.x - 6 * kLamp} y={lampP.y - 64 * kLamp} width={12 * kLamp} height={64 * kLamp} fill="#362A30" />
        <polygon
          points={`${lampP.x - 22 * kLamp},${lampP.y - 98 * kLamp} ${lampP.x + 22 * kLamp},${lampP.y - 98 * kLamp} ${lampP.x + 36 * kLamp},${lampP.y - 54 * kLamp} ${lampP.x - 36 * kLamp},${lampP.y - 54 * kLamp}`}
          fill={lamp > 0.1 ? '#FFE4A8' : '#4E4B5E'}
          stroke="#1D1A26"
          strokeWidth={3}
        />
        {lamp > 0.1 ? <Cone d={`M ${lampP.x - 30} ${lampP.y - 54} L ${lampP.x + 30} ${lampP.y - 54} L ${lampP.x + 150} 920 L ${lampP.x - 150} 920 Z`} o={0.35 * lamp} /> : null}
      </g>

      <FloorPlant r={r} u={0.89} w={0.22} />

      <LightVeil
        id={`${id}v`}
        o={dawn > 0.5 ? veil * 0.35 : veil}
        lights={[
          ...(lamp > 0.05 ? [[RAKAN_LAMP.x, RAKAN_LAMP.y, 380 * lamp] as [number, number, number]] : []),
          ...(phoneGlow > 0.1 ? [[phoneP.x, phoneP.y, 140] as [number, number, number]] : []),
          [1205, 482, dawn > 0.5 ? 520 : 280],
        ]}
      />
      {lamp > 0.05 ? <Glow x={RAKAN_LAMP.x} y={RAKAN_LAMP.y} r={320} kind="warm" o={0.55 * lamp} /> : null}
      {phoneGlow > 0.1 ? <Glow x={phoneP.x} y={phoneP.y - 10} r={120} kind="cool" o={0.35 * phoneGlow} /> : null}
      {dawn > 0.3 ? <Dust t={t} seed={9} x0={820} y0={360} w={560} h={420} n={32} o={0.55 * dawn} /> : null}
    </g>
  );
};

import React from 'react';
import { makeRoom, Box } from '../room';
import { Glow, LightVeil, Dust } from '../light';
import { RoomShell, FloorShadow } from '../furnish';
import { FONT } from '../fonts.pure';

export const SCHOOL_HALL = makeRoom({ x: 960, y: 490 }, { x0: 540, x1: 1380, y0: 300, y1: 715 }, 3.6);

export const FrozenClock: React.FC<{ x: number; y: number; r?: number; hour?: number; min?: number }> = ({ x, y, r = 34, hour = 3, min = 7 }) => {
  const mDeg = (min / 60) * 360;
  const hDeg = ((hour + min / 60) / 12) * 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#F4EDE0" stroke="#2D2638" strokeWidth={4} />
      <line x1={0} y1={0} x2={Math.sin((hDeg * Math.PI) / 180) * r * 0.5} y2={-Math.cos((hDeg * Math.PI) / 180) * r * 0.5} stroke="#231D2E" strokeWidth={4} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.sin((mDeg * Math.PI) / 180) * r * 0.74} y2={-Math.cos((mDeg * Math.PI) / 180) * r * 0.74} stroke="#C9483B" strokeWidth={2.5} strokeLinecap="round" />
      <circle r={3.5} fill="#231D2E" />
    </g>
  );
};

export const ElementarySchool: React.FC<{ t: number; id?: string; showMusicDoor?: boolean; veil?: number }> = ({
  t,
  id = 'schl',
  showMusicDoor = false,
  veil = 0.28,
}) => {
  const r = SCHOOL_HALL;
  const { P, Q } = r;

  return (
    <g>
      <RoomShell r={r} id={id} wall="#564C5E" side="#443B4C" floorC="#473832" ceiling="#2F2838" lines="#29212D" />

      {/* Warm sunlit school windows along left wall */}
      {[0.18, 0.45, 0.72].map((w, i) => (
        <g key={`win${i}`}>
          <polygon points={Q([[0, 0.14, w], [0, 0.14, w + 0.18], [0, 0.56, w + 0.18], [0, 0.56, w]])} fill="#FFD59A" opacity={0.72} stroke="#2C2330" strokeWidth={4} />
          <polygon
            points={Q([[0, 0.56, w], [0.42, 1, w], [0.42, 1, w + 0.18], [0, 0.56, w + 0.18]])}
            fill="#FFCF86"
            opacity={0.14}
            style={{ mixBlendMode: 'screen' }}
          />
        </g>
      ))}

      {/* Lockers along right wall */}
      <Box r={r} u={[0.88, 1]} v={[0.35, 1]} w={[0.05, 0.65]} front="#4B667A" top="#5D7D94" side="#384E5E" rim />
      {[0.14, 0.26, 0.38, 0.5].map((w, i) => (
        <line key={`lk${i}`} x1={P(0.88, 0.36, w).x} y1={P(0.88, 0.36, w).y} x2={P(0.88, 0.99, w).x} y2={P(0.88, 0.99, w).y} stroke="#23313D" strokeWidth={3} />
      ))}

      {/* Back wall door & plaque */}
      <FloorShadow r={r} u={[0.36, 0.64]} w={[0, 0.04]} />
      <polygon points={Q([[0.38, 0.26, 0], [0.62, 0.26, 0], [0.62, 1, 0], [0.38, 1, 0]])} fill="#5C4034" stroke="#261B17" strokeWidth={4} />
      <polygon points={Q([[0.42, 0.32, 0], [0.58, 0.32, 0], [0.58, 0.56, 0], [0.42, 0.56, 0]])} fill={showMusicDoor ? '#FFC978' : '#3C2A24'} opacity={showMusicDoor ? 0.78 : 1} />
      <circle cx={P(0.59, 0.66, 0).x} cy={P(0.59, 0.66, 0).y} r={6} fill="#E0BA74" />

      {showMusicDoor ? (
        <g transform={`translate(${P(0.5, 0.2, 0).x} ${P(0.5, 0.2, 0).y})`}>
          <rect x={-96} y={-22} width={192} height={42} rx={6} fill="#251C1B" stroke="#E0BA74" strokeWidth={2.5} />
          <text y={8} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontWeight={700} fontSize={23} fill="#FFE2A8">
            غرفة الموسيقى
          </text>
        </g>
      ) : null}

      {/* Wall Clocks frozen at 03:07 */}
      <FrozenClock x={P(0.22, 0.26, 0).x} y={P(0.22, 0.26, 0).y} r={34} />
      <FrozenClock x={P(0.76, 0.26, 0).x} y={P(0.76, 0.26, 0).y} r={34} />

      <LightVeil id={`${id}v`} o={veil} lights={[[960, 480, 480], [280, 400, 320]]} />
      <Glow x={960} y={420} r={360} kind="warm" o={0.35} />
      <Dust t={t} seed={42} x0={420} y0={220} w={1080} h={600} n={34} o={0.5} />
    </g>
  );
};

import React from 'react';
import { makeRoom, Box, Pt, Room } from '../room';
import { Glow, Dust } from '../light';
import { BackWindow, FloorShadow, RoomShell, WallFrame } from '../furnish';
import { ShadowEntity } from '../rig';
import { FONT } from '../fonts.pure';

/**
 * A6 Amber Noir Midnight Bedroom (Multi-plane Parallax + Volumetric Moonlight + Wardrobe Entity Rig):
 * Supports both 16:9 ('landscape', 1920x1080) and 9:16 ('portrait', 1080x1920) architectural presets
 * with fixed room geography: Bed & Nightstand LEFT, Moonlight Window BACK, Towering Wardrobe RIGHT.
 */
export const CLOSET_ROOM = makeRoom({ x: 940, y: 500 }, { x0: 470, x1: 1450, y0: 310, y1: 748 }, 3.4);
export const CLOSET_ROOM_PORTRAIT = makeRoom({ x: 540, y: 840 }, { x0: 150, x1: 930, y0: 460, y1: 1220 }, 2.65);

export type BedroomVariant = 'landscape' | 'portrait';

const ROOM_CFG = {
  landscape: {
    room: CLOSET_ROOM,
    bed: { u0: 0.04, u1: 0.39, top: 0.785, w1: 0.48 },
    ns: { u0: 0.42, u1: 0.53, v0: 0.77, w0: 0.01, w1: 0.12 },
    closet: { u0: 0.81, u1: 0.995, v0: 0.12, v1: 1.0, w0: 0.14, w1: 0.52 },
    win: { x0: 840, x1: 1120, y0: 355, y1: 615, moon: { x: 935, y: 420 } },
    frames: [
      { x: 520, y: 392, w: 112, h: 142, art: 1 as const },
      { x: 658, y: 408, w: 92, h: 116, art: 2 as const },
    ],
    beamPts: '900,380 1060,380 1270,1040 690,1040',
    beamSubPts: '936,615 1005,615 975,1040 805,1040',
    dustBox: { x0: 780, y0: 375, w: 500, h: 430 },
    phoneU: 0.475,
    phoneW: 0.08,
    clockU: 0.435,
    clockW: 0.035,
    charHScale: 0.64 * 422,
    vw: 1920,
    vh: 1080,
  },
  portrait: {
    room: CLOSET_ROOM_PORTRAIT,
    bed: { u0: 0.03, u1: 0.42, top: 0.79, w1: 0.44 },
    ns: { u0: 0.44, u1: 0.57, v0: 0.775, w0: 0.01, w1: 0.14 },
    closet: { u0: 0.74, u1: 0.995, v0: 0.06, v1: 1.0, w0: 0.08, w1: 0.6 },
    win: { x0: 365, x1: 645, y0: 515, y1: 885, moon: { x: 465, y: 600 } },
    frames: [
      { x: 185, y: 580, w: 115, h: 152, art: 1 as const },
      { x: 196, y: 755, w: 94, h: 118, art: 2 as const },
    ],
    beamPts: '410,540 605,540 785,1720 280,1720',
    beamSubPts: '445,885 560,885 595,1720 390,1720',
    dustBox: { x0: 320, y0: 560, w: 410, h: 860 },
    phoneU: 0.505,
    phoneW: 0.09,
    clockU: 0.46,
    clockW: 0.035,
    charHScale: 0.52 * 760,
    vw: 1080,
    vh: 1920,
  },
} as const;

export const getClosetRoom = (variant: BedroomVariant = 'landscape'): Room => ROOM_CFG[variant].room;

export const CLOSET_WINDOW = ROOM_CFG.landscape.win;
export const CLOSET_WINDOW_PORTRAIT = ROOM_CFG.portrait.win;

export const closetBedSit = (u = 0.22, w = 0.1, variant: BedroomVariant = 'landscape') => {
  const cfg = ROOM_CFG[variant];
  const p = cfg.room.P(u, cfg.bed.top - 0.02, w);
  return { x: p.x, y: p.y, scale: (cfg.charHScale * cfg.room.s(w)) / 378 };
};

export const getClosetHandlePt = (variant: BedroomVariant = 'landscape'): Pt => {
  const cfg = ROOM_CFG[variant];
  return cfg.room.P(cfg.closet.u0 - 0.008, 0.57, (cfg.closet.w0 + cfg.closet.w1) * 0.5 - 0.02);
};

export const getClosetPhonePt = (variant: BedroomVariant = 'landscape'): Pt => {
  const cfg = ROOM_CFG[variant];
  return cfg.room.P(cfg.phoneU, cfg.ns.v0 - 0.006, cfg.phoneW);
};

export const CLOSET_HANDLE: Pt = getClosetHandlePt('landscape');
export const CLOSET_PHONE: Pt = getClosetPhonePt('landscape');
export const CLOSET_HANDLE_PORTRAIT: Pt = getClosetHandlePt('portrait');
export const CLOSET_PHONE_PORTRAIT: Pt = getClosetPhonePt('portrait');

export const ClosetBedDuvet: React.FC<{ from?: number; knees?: number; variant?: BedroomVariant }> = ({
  from = 0.13,
  knees = 0.6,
  variant = 'landscape',
}) => {
  const cfg = ROOM_CFG[variant];
  const { Q, P, s } = cfg.room;
  const BED = cfg.bed;
  const kn = P((BED.u0 + BED.u1) * 0.5, BED.top, from + 0.14);
  return (
    <g>
      <polygon
        points={Q([
          [BED.u0 - 0.01, BED.top - 0.01, from],
          [BED.u1 + 0.01, BED.top - 0.01, from],
          [BED.u1 + 0.012, BED.top - 0.01, BED.w1 + 0.012],
          [BED.u0 - 0.01, BED.top - 0.01, BED.w1 + 0.012],
        ])}
        fill="#2B3452"
      />
      <polygon
        points={Q([
          [BED.u0 - 0.01, BED.top - 0.01, BED.w1 + 0.012],
          [BED.u1 + 0.012, BED.top - 0.01, BED.w1 + 0.012],
          [BED.u1 + 0.012, 0.94, BED.w1 + 0.012],
          [BED.u0 - 0.01, 0.94, BED.w1 + 0.012],
        ])}
        fill="#212842"
      />
      <polygon
        points={Q([
          [BED.u1 + 0.012, BED.top - 0.01, from],
          [BED.u1 + 0.012, BED.top - 0.01, BED.w1 + 0.012],
          [BED.u1 + 0.012, 0.95, BED.w1 + 0.012],
          [BED.u1 + 0.012, 0.95, from],
        ])}
        fill="#1A1F36"
      />
      {[0.2, 0.28, 0.36, 0.42].map((w, i) => (
        <path
          key={i}
          d={`M ${P(BED.u0, BED.top - 0.01, w).x} ${P(BED.u0, BED.top - 0.01, w).y} Q ${P((BED.u0 + BED.u1) * 0.5, BED.top - 0.015, w).x} ${P((BED.u0 + BED.u1) * 0.5, BED.top - 0.015, w).y} ${P(BED.u1, BED.top - 0.01, w).x} ${P(BED.u1, BED.top - 0.01, w).y}`}
          stroke="#182036"
          strokeWidth={2.3}
          fill="none"
          opacity={0.78}
        />
      ))}
      <polygon
        points={Q([
          [BED.u0 - 0.01, BED.top - 0.012, from],
          [BED.u1 + 0.012, BED.top - 0.012, from],
          [BED.u1 + 0.012, BED.top - 0.012, from + 0.035],
          [BED.u0 - 0.01, BED.top - 0.012, from + 0.035],
        ])}
        fill="#D6CFC4"
      />
      {knees > 0 ? (
        <ellipse
          cx={kn.x}
          cy={kn.y - 16 * knees}
          rx={62 * s(from + 0.14)}
          ry={21 * knees * s(from + 0.14)}
          fill="#2F3959"
        />
      ) : null}
    </g>
  );
};

export interface ClosetBedroomProps {
  t: number;
  id?: string;
  variant?: BedroomVariant;
  veil?: number;
  duvet?: boolean;
  closetOpen?: number; // 0 = shut, 0.095 = ajar, 0.5+ = open
  closetRattle?: number; // 0..1 subtle door vibration
  closetPresence?: number; // 0..1 eerie ShadowEntity visibility inside wardrobe
  closetLunge?: number; // 0..1 terrifying entity lunge forward
  closetClaw?: number; // 0..1 shadow fingers gripping door edge
  breathMist?: number; // 0..1 cold whisper/breath wisps escaping door slit
  phoneGlow?: number; // 0..1 screen brightness & wall amber bounce
  phoneMode?: 'dim' | 'incoming' | 'connected';
  phoneBuzz?: number; // 0..1 vibration tremor
  fgParallax?: number; // 0..1 foreground framing vignette silhouettes
  dangerGlow?: number; // 0..1 crimson/cold danger edge inside wardrobe
  clockMute?: boolean; // dims colon blink during dead silence
  phoneLabel?: boolean; // show floating "رقم غريب" caller label on nightstand
  footDust?: { u: number; w: number; p: number } | null; // dust puff on floorboard impact
}

export const ClosetBedroom: React.FC<ClosetBedroomProps> = ({
  t,
  id = 'cbed',
  variant = 'landscape',
  veil = 0.5,
  duvet = true,
  closetOpen = 0,
  closetRattle = 0,
  closetPresence = 0,
  closetLunge = 0,
  closetClaw = 0,
  breathMist = 0,
  phoneGlow = 0.15,
  phoneMode = 'dim',
  phoneBuzz = 0,
  fgParallax = 0.35,
  dangerGlow = 0,
  clockMute = false,
  phoneLabel = true,
  footDust = null,
}) => {
  const cfg = ROOM_CFG[variant];
  const r = cfg.room;
  const { P, Q, back } = r;
  const BED = cfg.bed;
  const NS = cfg.ns;
  const CLOSET = cfg.closet;
  const WIN = cfg.win;

  const wallC = '#1F233A';
  const sideC = '#171A2D';
  const floorC = '#1B1624';
  const ceilC = '#0E111E';

  const hingeW = CLOSET.w0 + 0.02;
  const doorMidW = (CLOSET.w0 + CLOSET.w1) * 0.5;
  const rattle = closetRattle * Math.sin(t * 1.45) * 0.006;
  const openAmt = Math.max(0, closetOpen + rattle);
  const swingU = CLOSET.u0 - openAmt * 0.175;
  const swingW = doorMidW - openAmt * 0.165;

  const handleU = CLOSET.u0 - openAmt * 0.155;
  const handleW = doorMidW - 0.02 - openAmt * 0.145;
  const handlePt = P(handleU, 0.57, handleW);
  const doorEdgePt = P(swingU, 0.51, swingW);

  const basePhone = getClosetPhonePt(variant);
  const phX = basePhone.x + (phoneBuzz > 0 ? Math.sin(t * 2.9) * 3.8 * phoneBuzz : 0);
  const phY = basePhone.y + (phoneBuzz > 0 ? Math.cos(t * 3.5) * 1.8 * phoneBuzz : 0);
  const kPhone = r.s(NS.w1) * (variant === 'portrait' ? 1.25 : 1.05);

  const entityAnchor = P(CLOSET.u0 + 0.008, 0.61, (CLOSET.w0 + doorMidW) * 0.5 + 0.035);
  const entityScale = r.s(doorMidW) * (variant === 'portrait' ? 1.08 : 0.96);
  const clockColonOn = clockMute ? true : Math.floor(t / 15) % 2 === 0;

  return (
    <g>
      <defs>
        <linearGradient id={`${id}moonBeam`} x1="0%" y1="0%" x2="25%" y2="100%">
          <stop offset="0%" stopColor="#8DB4F7" stopOpacity={0.24} />
          <stop offset="55%" stopColor="#6D96DE" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#4668A8" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}phoneBounce`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={phoneMode === 'dim' ? '#5E98E8' : '#FF8A3D'} stopOpacity={0.42 * phoneGlow} />
          <stop offset="48%" stopColor={phoneMode === 'dim' ? '#5E98E8' : '#FF8A3D'} stopOpacity={0.16 * phoneGlow} />
          <stop offset="100%" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}amberVeil`} cx="50%" cy="46%" r="68%">
          <stop offset="0%" stopColor="#07040C" stopOpacity={Math.max(0, veil * 0.2)} />
          <stop offset="55%" stopColor="#07040C" stopOpacity={veil * 0.72} />
          <stop offset="100%" stopColor="#04050A" stopOpacity={Math.min(0.92, veil * 1.15)} />
        </radialGradient>
        <radialGradient id={`${id}mistGrad`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#BFD6FF" stopOpacity={0.36} />
          <stop offset="55%" stopColor="#A7C4F2" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#8DB4F7" stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}closetCavClip`}>
          <polygon
            points={Q([
              [CLOSET.u0 - 0.002, CLOSET.v0 + 0.025, CLOSET.w0 + 0.015],
              [CLOSET.u0 - 0.002, CLOSET.v0 + 0.025, CLOSET.w1 - 0.015],
              [CLOSET.u0 - 0.002, CLOSET.v1 - 0.025, CLOSET.w1 - 0.015],
              [CLOSET.u0 - 0.002, CLOSET.v1 - 0.025, CLOSET.w0 + 0.015],
            ])}
          />
        </clipPath>
      </defs>

      <RoomShell r={r} id={id} wall={wallC} side={sideC} floorC={floorC} ceiling={ceilC} lines="#110E18" texture={false} />

      {/* Woven bedroom rug anchoring floor center */}
      <polygon
        points={Q([
          [0.32, 0.999, 0.17],
          [0.72, 0.999, 0.17],
          [0.74, 0.999, 0.52],
          [0.3, 0.999, 0.52],
        ])}
        fill="#241D31"
        stroke="#352A47"
        strokeWidth={2.5}
      />
      <polygon
        points={Q([
          [0.35, 0.999, 0.21],
          [0.69, 0.999, 0.21],
          [0.71, 0.999, 0.48],
          [0.33, 0.999, 0.48],
        ])}
        fill="none"
        stroke="#48385E"
        strokeWidth={1.8}
        opacity={0.7}
      />

      {/* Organic wooden floorboard seams & grain streaks */}
      {[0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84].map((u, i) => {
        const a = P(u, 1, 0);
        const b = P(u, 1, 1);
        return <line key={`fl${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#110E17" strokeWidth={2.2} opacity={0.62} />;
      })}
      {[0.18, 0.38, 0.62, 0.78].map((w, i) => {
        const a = P(0.05 + i * 0.14, 1, w);
        const b = P(0.2 + i * 0.14, 1, w);
        return <line key={`fg${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#120F1A" strokeWidth={1.6} opacity={0.48} />;
      })}

      {/* Wall crown trim & framed art above bed */}
      <line x1={back.x0} y1={back.y0 + 4} x2={back.x1} y2={back.y0 + 4} stroke="#141729" strokeWidth={4} />
      {cfg.frames.map((fr, fi) => (
        <WallFrame key={`wf${fi}`} x={fr.x} y={fr.y} w={fr.w} h={fr.h} art={fr.art} />
      ))}

      {/* Back night window with moon, stars & drifting clouds */}
      <BackWindow
        r={r}
        id={`${id}w`}
        t={t}
        x0={WIN.x0}
        x1={WIN.x1}
        y0={WIN.y0}
        y1={WIN.y1}
        sun={WIN.moon}
        cols={2}
        night
      />

      {/* Subtle exterior cloud wisps sliding past the moon inside window bounds */}
      <g opacity={0.16}>
        <ellipse
          cx={WIN.x0 + 70 + ((t * 0.45) % 140)}
          cy={WIN.moon.y + 42}
          rx={56}
          ry={11}
          fill="#CFE0FF"
        />
        <ellipse
          cx={WIN.x1 - 70 - ((t * 0.32) % 120)}
          cy={WIN.moon.y - 24}
          rx={44}
          ry={9}
          fill="#B6CEF8"
        />
      </g>

      {/* Curtains with draft sway + Volumetric diagonal moonlight beam */}
      {(() => {
        const sway = Math.sin(t * 0.045) * 4.2;
        return (
          <g>
            <rect x={WIN.x0 - 12} y={WIN.y0 - 10} width={WIN.x1 - WIN.x0 + 24} height={9} rx={4} fill="#1E1A2B" />
            <path
              d={`M ${WIN.x0} ${WIN.y0} L ${WIN.x0 + 60 + sway} ${WIN.y0} L ${WIN.x0 + 52 - sway} ${WIN.y1 + 48} L ${WIN.x0} ${WIN.y1 + 48} Z`}
              fill="#232944"
              stroke="#121526"
              strokeWidth={2}
            />
            <path
              d={`M ${WIN.x1 - 60 - sway} ${WIN.y0} L ${WIN.x1} ${WIN.y0} L ${WIN.x1} ${WIN.y1 + 48} L ${WIN.x1 - 52 + sway} ${WIN.y1 + 48} Z`}
              fill="#232944"
              stroke="#121526"
              strokeWidth={2}
            />
            <polygon points={cfg.beamPts} fill={`url(#${id}moonBeam)`} />
            <polygon points={cfg.beamSubPts} fill="#9CC0FF" opacity={0.075} />
          </g>
        );
      })()}

      {/* Bed Frame & Headboard (Left) */}
      <FloorShadow r={r} u={[BED.u0, BED.u1]} w={[0.02, BED.w1]} />
      <Box r={r} u={[BED.u0, BED.u1]} v={[0.56, 0.96]} w={[0, 0.03]} front="#3A2A28" top="#4F3B36" side="#291E1D" rim />
      <Box r={r} u={[BED.u0, BED.u1]} v={[BED.top, 0.95]} w={[0.03, BED.w1]} front="#2F2323" top="#DED6C8" side="#211819" />
      <polygon
        points={Q([
          [BED.u0 + 0.04, BED.top - 0.04, 0.04],
          [BED.u1 - 0.04, BED.top - 0.04, 0.04],
          [BED.u1 - 0.04, BED.top, 0.13],
          [BED.u0 + 0.04, BED.top, 0.13],
        ])}
        fill="#DDD5C6"
      />
      {duvet ? <ClosetBedDuvet variant={variant} /> : null}

      {/* Nightstand & Smartphone & Digital 03:07 Clock */}
      <FloorShadow r={r} u={[NS.u0, NS.u1]} w={[NS.w0, NS.w1]} />
      <Box r={r} u={[NS.u0, NS.u1]} v={[NS.v0, 1]} w={[NS.w0, NS.w1]} front="#3B2C28" top="#4E3B35" side="#291F1C" rim />
      {(() => {
        const clk = P(cfg.clockU, NS.v0 - 0.015, cfg.clockW);
        const ks = variant === 'portrait' ? 1.2 : 1;
        return (
          <g transform={`translate(${clk.x} ${clk.y}) scale(${ks})`}>
            <rect x={-19} y={-9} width={38} height={16} rx={3} fill="#0F121D" stroke="#06070B" strokeWidth={1.5} />
            <text x={0} y={2} textAnchor="middle" fontFamily={FONT.ui} fontSize={8.5} fill="#76A7EE" opacity={0.92}>
              {clockColonOn ? '03:07' : '03 07'}
            </text>
          </g>
        );
      })()}

      {/* Dynamic amber bounce pool from smartphone */}
      {phoneGlow > 0.08 ? <circle cx={phX} cy={phY - 12} r={220} fill={`url(#${id}phoneBounce)`} /> : null}

      {/* Smartphone resting flat on nightstand */}
      <g transform={`translate(${phX} ${phY})`}>
        <rect x={-30 * kPhone} y={-8 * kPhone} width={60 * kPhone} height={14 * kPhone} rx={4} fill="#101320" stroke="#06080E" strokeWidth={2} />
        {phoneGlow > 0.04 ? (
          <g opacity={phoneGlow}>
            <rect
              x={-26 * kPhone}
              y={-6 * kPhone}
              width={52 * kPhone}
              height={10 * kPhone}
              rx={2.5}
              fill={phoneMode === 'incoming' ? '#FF8A3D' : phoneMode === 'connected' ? '#FFB85C' : '#5E98E8'}
            />
            {phoneMode === 'incoming' ? (
              <g>
                <circle cx={0} cy={-26} r={14 + (t % 14) * 2.2} fill="none" stroke="#FF8A3D" strokeWidth={2.5} opacity={Math.max(0, 1 - (t % 14) / 14)} />
                {phoneLabel ? (
                  <text
                    x={0}
                    y={-42}
                    textAnchor="middle"
                    direction="rtl"
                    fontFamily={FONT.ar}
                    fontWeight={700}
                    fontSize={variant === 'portrait' ? 25 : 22}
                    fill="#FFD080"
                    stroke="#080A14"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    paintOrder="stroke"
                  >
                    رقم غريب
                  </text>
                ) : null}
              </g>
            ) : null}
          </g>
        ) : null}
      </g>

      {/* Floorboard dust scuff puff on footsteps */}
      {footDust && footDust.p > 0.01 && footDust.p < 1 ? (
        <g opacity={(1 - footDust.p) * 0.42}>
          {(() => {
            const fp = P(footDust.u, 1, footDust.w);
            return (
              <>
                <ellipse cx={fp.x - 10 - footDust.p * 18} cy={fp.y - footDust.p * 8} rx={12 + footDust.p * 12} ry={5 + footDust.p * 4} fill="#B8C8E8" />
                <ellipse cx={fp.x + 12 + footDust.p * 16} cy={fp.y - footDust.p * 6} rx={10 + footDust.p * 10} ry={4 + footDust.p * 4} fill="#B8C8E8" />
              </>
            );
          })()}
        </g>
      ) : null}

      {/* RIGHT WALL FOCAL ANCHOR: Tall Wooden Wardrobe (الخزانة) */}
      <FloorShadow r={r} u={[CLOSET.u0 - 0.03, 1]} w={[CLOSET.w0, CLOSET.w1 + 0.02]} o={0.62} />
      <Box
        r={r}
        u={[CLOSET.u0, CLOSET.u1]}
        v={[CLOSET.v0, CLOSET.v1]}
        w={[CLOSET.w0, CLOSET.w1]}
        front="#2E2229"
        side="#261C22"
        top="#3D2E36"
      />
      {/* Wardrobe top cornice crown molding */}
      <Box
        r={r}
        u={[CLOSET.u0 - 0.012, CLOSET.u1]}
        v={[Math.max(0.01, CLOSET.v0 - 0.024), CLOSET.v0]}
        w={[CLOSET.w0 - 0.01, CLOSET.w1 + 0.01]}
        front="#3A2B33"
        side="#2B2026"
        top="#47363F"
      />
      {/* Pitch-black inner wardrobe cavity */}
      <polygon
        points={Q([
          [CLOSET.u0 - 0.002, CLOSET.v0 + 0.03, CLOSET.w0 + 0.02],
          [CLOSET.u0 - 0.002, CLOSET.v0 + 0.03, CLOSET.w1 - 0.02],
          [CLOSET.u0 - 0.002, CLOSET.v1 - 0.03, CLOSET.w1 - 0.02],
          [CLOSET.u0 - 0.002, CLOSET.v1 - 0.03, CLOSET.w0 + 0.02],
        ])}
        fill="#030408"
      />
      {/* Hanging clothes rod & ShadowEntity clipped strictly inside open wardrobe cavity */}
      <g clipPath={`url(#${id}closetCavClip)`}>
        {openAmt > 0.04 ? (
          <g opacity={Math.min(1, openAmt * 2.8)}>
            {[0.17, 0.23, 0.48].map((cw, ci) => {
              const topP = P(CLOSET.u0 + 0.015, 0.22, cw);
              const botP = P(CLOSET.u0 + 0.015, 0.65, cw);
              return (
                <path
                  key={`coat${ci}`}
                  d={`M ${topP.x - 10} ${topP.y} Q ${topP.x} ${topP.y - 10} ${topP.x + 10} ${topP.y} L ${botP.x + 14} ${botP.y} L ${botP.x - 14} ${botP.y} Z`}
                  fill="#11121D"
                  opacity={0.85}
                />
              );
            })}
            {dangerGlow > 0.05 ? (
              <ellipse cx={entityAnchor.x} cy={entityAnchor.y - 40} rx={58} ry={145} fill="#FF3B2F" opacity={dangerGlow * 0.22} />
            ) : null}
          </g>
        ) : null}

        {openAmt > 0.05 && closetPresence > 0.01 ? (
          <ShadowEntity
            x={entityAnchor.x}
            y={entityAnchor.y}
            scale={entityScale}
            t={t}
            presence={closetPresence}
            lunge={closetLunge}
            gripDoorX={closetClaw > 0.1 ? doorEdgePt.x : undefined}
            gripDoorY={closetClaw > 0.1 ? doorEdgePt.y - 12 : undefined}
            crimsonEyes={dangerGlow}
          />
        ) : null}
      </g>

      {/* Back/right static wardrobe door leaf */}
      <polygon
        points={Q([
          [CLOSET.u0, CLOSET.v0 + 0.025, doorMidW + 0.004],
          [CLOSET.u0, CLOSET.v0 + 0.025, CLOSET.w1 - 0.02],
          [CLOSET.u0, CLOSET.v1 - 0.025, CLOSET.w1 - 0.02],
          [CLOSET.u0, CLOSET.v1 - 0.025, doorMidW + 0.004],
        ])}
        fill="#35272F"
        stroke="#171116"
        strokeWidth={3}
      />

      {/* Hinged front/left wardrobe door leaf */}
      <polygon
        points={Q([
          [CLOSET.u0, CLOSET.v0 + 0.025, hingeW],
          [swingU, CLOSET.v0 + 0.025, swingW],
          [swingU, CLOSET.v1 - 0.025, swingW],
          [CLOSET.u0, CLOSET.v1 - 0.025, hingeW],
        ])}
        fill="#3C2C35"
        stroke="#150F14"
        strokeWidth={3.5}
      />
      <polygon
        points={Q([
          [lerp(CLOSET.u0, swingU, 0.16), CLOSET.v0 + 0.09, lerp(hingeW, swingW, 0.16)],
          [lerp(CLOSET.u0, swingU, 0.84), CLOSET.v0 + 0.09, lerp(hingeW, swingW, 0.84)],
          [lerp(CLOSET.u0, swingU, 0.84), CLOSET.v1 - 0.09, lerp(hingeW, swingW, 0.84)],
          [lerp(CLOSET.u0, swingU, 0.16), CLOSET.v1 - 0.09, lerp(hingeW, swingW, 0.16)],
        ])}
        fill="none"
        stroke="#271D23"
        strokeWidth={2.5}
      />

      {/* Articulated shadow claws wrapping in front of the swinging wardrobe door edge */}
      {openAmt > 0.05 && closetClaw > 0.05 ? (
        <g transform={`translate(${doorEdgePt.x} ${doorEdgePt.y - 12})`} opacity={Math.min(1, closetClaw)}>
          {[-16, -6, 4, 14].map((dy, fi) => (
            <g key={`doorclaw${fi}`}>
              <path
                d={`M -6 ${dy + 2} Q 4 ${dy - 3} 14 ${dy + 1}`}
                stroke="#04050B"
                strokeWidth={5.2}
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M -4 ${dy + 1} Q 4 ${dy - 3} 12 ${dy}`}
                stroke="#647AA6"
                strokeWidth={1.3}
                strokeLinecap="round"
                fill="none"
                opacity={0.65}
              />
            </g>
          ))}
        </g>
      ) : null}

      {/* Brass handles */}
      <rect x={handlePt.x - 4} y={handlePt.y - 16} width={8} height={32} rx={3} fill="#D9A858" stroke="#181216" strokeWidth={2} />
      <rect
        x={P(CLOSET.u0, 0.57, doorMidW + 0.022).x - 4}
        y={P(CLOSET.u0, 0.57, doorMidW + 0.022).y - 16}
        width={8}
        height={32}
        rx={3}
        fill="#B88E4A"
        stroke="#181216"
        strokeWidth={2}
      />

      {/* Cold breath mist seeping softly out from the closet door seam */}
      {breathMist > 0.02 ? (
        <g opacity={breathMist}>
          {[0, 1, 2, 3].map((i) => {
            const p = P(CLOSET.u0 - 0.015, 0.41 + i * 0.06, doorMidW);
            const drift = (t * 0.95 + i * 15) % 64;
            return (
              <ellipse
                key={`bm${i}`}
                cx={p.x - drift * 1.45}
                cy={p.y + Math.sin((t + i * 10) * 0.1) * 5.5}
                rx={22 + drift * 0.58}
                ry={11 + drift * 0.25}
                fill={`url(#${id}mistGrad)`}
                opacity={Math.max(0, 1 - drift / 66)}
              />
            );
          })}
        </g>
      ) : null}

      {/* Depth Veil + Volumetric Dust in Moonlight Shaft */}
      <rect x={-400} y={-400} width={cfg.vw + 800} height={cfg.vh + 800} fill={`url(#${id}amberVeil)`} />
      <Glow x={handlePt.x - 36} y={handlePt.y} r={150} kind="warm" o={0.16} />
      {phoneGlow > 0.08 ? <Glow x={phX} y={phY - 12} r={175} kind={phoneMode === 'dim' ? 'cool' : 'warm'} o={0.58 * phoneGlow} /> : null}
      <Dust t={t} seed={23} x0={cfg.dustBox.x0} y0={cfg.dustBox.y0} w={cfg.dustBox.w} h={cfg.dustBox.h} n={22} o={0.35} />

      {/* Foreground out-of-focus depth framing corners (parallax visual plane) */}
      {fgParallax > 0.02 ? (
        <g opacity={fgParallax} pointerEvents="none">
          <path d={`M -80 ${cfg.vh} L -80 ${cfg.vh * 0.52} Q 18 ${cfg.vh * 0.72} 48 ${cfg.vh} Z`} fill="#04050B" />
          <path d={`M ${cfg.vw + 80} ${cfg.vh} L ${cfg.vw + 80} ${cfg.vh * 0.48} Q ${cfg.vw - 22} ${cfg.vh * 0.72} ${cfg.vw - 48} ${cfg.vh} Z`} fill="#04050B" />
        </g>
      ) : null}
    </g>
  );
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

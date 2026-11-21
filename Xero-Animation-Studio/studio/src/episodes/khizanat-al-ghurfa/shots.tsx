import React from 'react';
import {
  Actor,
  ArabicTitleCard,
  CLOSET_HANDLE_PORTRAIT,
  CLOSET_PHONE_PORTRAIT,
  CLOSET_ROOM_PORTRAIT,
  ClosetBedDuvet,
  ClosetBedroom,
  LEG_LEN,
  LOOKS,
  PORTRAIT_VIEWPORT,
  Pose,
  ShotMap,
  basePose,
  breathCurve,
  cameraTransform,
  clamp,
  closetBedSit,
  easeInOut,
  easeOut,
  joints,
  lerp,
  microTremor,
  motivatedCamera,
  reachAngle,
  toWorld,
  walkPose,
} from '../../engine/core';

const AMBER_HERO = LOOKS.amberNoir;
const floorY = (u = 0.5, w = 0.28) => CLOSET_ROOM_PORTRAIT.P(u, 1, w).y;
const floorX = (u = 0.5, w = 0.28) => CLOSET_ROOM_PORTRAIT.P(u, 1, w).x;
const floorScale = (w = 0.28) => (0.52 * 760 * CLOSET_ROOM_PORTRAIT.s(w)) / 378;

const HeldPhone: React.FC<{
  x: number;
  y: number;
  rot?: number;
  glow?: string;
  pulse?: number;
}> = ({ x, y, rot = -18, glow = '#FF8A3D', pulse = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-9} y={-21} width={18} height={42} rx={4} fill="#0F1320" stroke="#06080E" strokeWidth={2.2} />
    <rect x={-6.5} y={-17} width={13} height={32} rx={2} fill={glow} opacity={0.94} />
    {pulse > 0.05 ? (
      <g opacity={pulse}>
        <path d="M 13 -9 Q 21 0 13 9" fill="none" stroke="#FFB85C" strokeWidth={2.4} strokeLinecap="round" />
        <path d="M 19 -14 Q 31 0 19 14" fill="none" stroke="#FF8A3D" strokeWidth={2.1} strokeLinecap="round" opacity={0.78} />
        <path d="M 25 -19 Q 39 0 25 19" fill="none" stroke="#FFE2B3" strokeWidth={1.6} strokeLinecap="round" opacity={0.48 * pulse} />
      </g>
    ) : null}
  </g>
);

// S01 (0..46): «تخيل إنك نايم بغرفتك،»
export const S01: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.0, 1.05, [540, 940], [548, 932], {
    handheldFrame: f,
    handheldAmp: 1.1,
    viewport: PORTRAIT_VIEWPORT,
  });
  const sit = closetBedSit(0.2, 0.14, 'portrait');
  const br = breathCurve(t, 44);
  const titleOpacity = clamp(t / 12) * (1 - clamp((t - 34) / 11));
  const fadeFromBlack = 1 - clamp(t / 13);

  const pose: Pose = {
    ...basePose,
    x: sit.x - 14,
    y: sit.y + 42 + br * 2.0,
    scale: sit.scale,
    facing: 1,
    yaw: 0.24,
    tilt: -52,
    headTilt: -10 + br * 1.2,
    armL: { a: -24, b: 28 },
    armR: { a: 32, b: 36 },
    legL: { a: 74, b: -6 },
    legR: { a: 66, b: -8 },
    expr: 'tired',
    blink: 1,
    look: 0.4,
    breath: br,
    lightColor: '#9EC2F5',
    lightStrength: 0.42,
    lightSide: 1,
  };

  return (
    <g>
      <g transform={cam}>
        <ClosetBedroom
          t={t}
          id="s01"
          variant="portrait"
          veil={0.54}
          duvet={false}
          closetOpen={0}
          breathMist={0}
          phoneGlow={0.14}
          phoneMode="dim"
          fgParallax={0.35}
        />
        <Actor pose={pose} look={AMBER_HERO} rimId="" shadow={0} />
        <ClosetBedDuvet variant="portrait" from={0.14} knees={0.62} />
      </g>
      {titleOpacity > 0.02 ? (
        <g opacity={titleOpacity}>
          <ArabicTitleCard t={t} x={540} y={248} size={78} kicker="قصّة قصيرة" title="من داخل الخزانة" color="#FF9E57" />
        </g>
      ) : null}
      {fadeFromBlack > 0.01 ? <rect width={1080} height={1920} fill="#04050A" opacity={fadeFromBlack} /> : null}
    </g>
  );
};

// S02 (46..131): «وفجأه تسمع صوت أحد يتنفس من داخل الخزانه.»
export const S02: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.48, 1.72, [685, 865], [705, 845], {
    handheldFrame: f,
    handheldAmp: 1.6,
    viewport: PORTRAIT_VIEWPORT,
  });
  const sit = closetBedSit(0.2, 0.14, 'portrait');
  const br = breathCurve(t + 46, 76);
  const mist = clamp((t - 2) / 18) * 0.92;
  const rattle = t > 2 ? Math.abs(Math.sin(t * 0.65)) * clamp((t - 2) / 12) * 0.68 : 0;

  const pose: Pose = {
    ...basePose,
    x: sit.x - 14,
    y: sit.y + 42 + br * 1.8,
    scale: sit.scale,
    facing: 1,
    yaw: 0.28,
    tilt: -50,
    headTilt: -8,
    armL: { a: -24, b: 28 },
    armR: { a: 32, b: 36 },
    legL: { a: 74, b: -6 },
    legR: { a: 66, b: -8 },
    expr: 'tired',
    blink: 1,
    look: 0.4,
    breath: br,
    lightColor: '#9EC2F5',
    lightStrength: 0.36,
    lightSide: 1,
  };

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 46}
        id="s02"
        variant="portrait"
        veil={0.58}
        duvet={false}
        closetOpen={0}
        closetRattle={rattle}
        breathMist={mist}
        phoneGlow={0.14}
        phoneMode="dim"
        fgParallax={0.42}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" shadow={0} />
      <ClosetBedDuvet variant="portrait" from={0.14} knees={0.62} />
    </g>
  );
};

// S03 (131..165): «تفتح عيونك...»
export const S03: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.92, 1.78, [348, 845], [356, 840], {
    handheldFrame: f,
    handheldAmp: 2.0,
    viewport: PORTRAIT_VIEWPORT,
  });
  const sit = closetBedSit(0.2, 0.14, 'portrait');
  const snapK = easeOut(clamp((t - 4) / 8));
  const blink = t < 5 ? 1 - clamp(t / 5) : 0;
  const joltEcho = t >= 4 && t <= 12 ? { dx: -8 * (1 - (t - 4) / 8), dy: 5 * (1 - (t - 4) / 8), opacity: 0.2 } : undefined;

  const pose: Pose = {
    ...basePose,
    x: sit.x - 12 + snapK * 5,
    y: sit.y + 40 - snapK * 6,
    scale: sit.scale,
    facing: 1,
    yaw: lerp(0.28, 0.42, snapK),
    tilt: lerp(-48, -38, snapK),
    headTilt: lerp(-8, -2, snapK),
    clavicleL: -3 * snapK,
    clavicleR: -3 * snapK,
    armL: { a: -20, b: 26 },
    armR: { a: 28, b: 34 },
    legL: { a: 74, b: -6 },
    legR: { a: 66, b: -8 },
    expr: t >= 5 ? 'shock' : 'tired',
    blink,
    look: lerp(0.3, 0.95, snapK),
    lookV: lerp(0, -0.35, snapK),
    pupilScale: 1.15,
    motionEcho: joltEcho,
    lightColor: '#9EC2F5',
    lightStrength: 0.56,
    lightSide: 1,
  };

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 131}
        id="s03"
        variant="portrait"
        veil={0.52}
        duvet={false}
        closetOpen={0}
        breathMist={0.45}
        phoneGlow={0.16}
        phoneMode="dim"
        fgParallax={0.4}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" shadow={0} />
      <ClosetBedDuvet variant="portrait" from={0.14} knees={0.62} />
    </g>
  );
};

// S04 (165..237): «وتلاحظ إن باب الخزانه يتحرك بشويش.»
export const S04: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.46, 1.15, [430, 870], [545, 895], {
    handheldFrame: f,
    handheldAmp: 1.5,
    viewport: PORTRAIT_VIEWPORT,
  });
  const sit = closetBedSit(0.2, 0.14, 'portrait');
  const sitUp = easeInOut(clamp((t - 4) / 34));
  const openDoor = easeInOut(clamp((t - 7) / 62)) * 0.085;

  const pose: Pose = {
    ...basePose,
    x: sit.x - 10 + sitUp * 14,
    y: sit.y + 38 - sitUp * 22,
    scale: sit.scale,
    facing: 1,
    yaw: lerp(0.42, 0.74, sitUp),
    tilt: lerp(-36, -6, sitUp),
    headTilt: lerp(-3, 4, sitUp),
    clavicleL: -2,
    clavicleR: -2,
    armL: { a: -14, b: 22 },
    armR: { a: lerp(26, 12, sitUp), b: lerp(32, 18, sitUp) },
    legL: { a: 72, b: -6 },
    legR: { a: 64, b: -8 },
    expr: t < 16 ? 'shock' : 'worried',
    look: 0.92,
    lookV: -0.18,
    breath: breathCurve(t, 52) * 0.6,
    lightColor: '#9EC2F5',
    lightStrength: 0.48,
    lightSide: 1,
  };

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 165}
        id="s04"
        variant="portrait"
        veil={0.54}
        duvet={false}
        closetOpen={openDoor}
        closetRattle={t > 7 && t < 64 ? 0.28 : 0}
        breathMist={0.55}
        phoneGlow={0.16}
        phoneMode="dim"
        fgParallax={0.35}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" shadow={0} />
      <ClosetBedDuvet variant="portrait" from={0.14 + sitUp * 0.07} knees={0.62 - sitUp * 0.22} />
    </g>
  );
};

// S05 (237..272): «تقوم من سريرك،»
export const S05: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.38, 1.28, [430, 960], [452, 950], {
    handheldFrame: f,
    handheldAmp: 1.4,
    viewport: PORTRAIT_VIEWPORT,
  });
  const sit = closetBedSit(0.24, 0.14, 'portrait');
  const riseK = easeInOut(clamp(t / Math.max(1, len - 4)));
  const standX = floorX(0.28, 0.28);
  const standSc = floorScale(0.28);
  const standY = floorY(0.28, 0.28) - LEG_LEN * standSc;
  const hipDrop = Math.sin(riseK * Math.PI) * 7;

  const pose: Pose = {
    ...basePose,
    x: lerp(sit.x + 6, standX, riseK),
    y: lerp(sit.y + 12, standY, riseK),
    scale: lerp(sit.scale, standSc, riseK),
    facing: 1,
    yaw: lerp(0.75, 0.96, riseK),
    tilt: lerp(-6, 4, riseK),
    hipY: hipDrop,
    armL: { a: 12, b: 14 },
    armR: { a: 16, b: 14 },
    legL: { a: lerp(65, 8, riseK), b: lerp(-12, 0, riseK) },
    legR: { a: lerp(55, -8, riseK), b: lerp(-14, 0, riseK) },
    expr: 'worried',
    look: 0.88,
    lookV: 0.1,
    breath: breathCurve(t, 44) * 0.7,
    lightColor: '#9EC2F5',
    lightStrength: 0.48,
    lightSide: 1,
  };

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 237}
        id="s05"
        variant="portrait"
        veil={0.52}
        duvet
        closetOpen={0.085}
        breathMist={0.46}
        phoneGlow={0.14}
        phoneMode="dim"
        fgParallax={0.36}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
    </g>
  );
};

// S06 (272..330): «وتمشي باتجاهها،»
// Synced footsteps at f276 (t=4), f296 (t=24), f317 (t=45)
export const S06: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.14, 1.26, [485, 935], [565, 922], {
    handheldFrame: f,
    handheldAmp: 1.8,
    viewport: PORTRAIT_VIEWPORT,
  });
  const walkU = lerp(0.28, 0.52, clamp(t / Math.max(1, len)));
  const gX = floorX(walkU, 0.28);
  const gY = floorY(walkU, 0.28);
  const sc = floorScale(0.28);
  const phase = ((t - 4) / 20.5) * Math.PI + Math.PI / 2;
  const pose = walkPose(
    gX,
    phase,
    gY,
    sc,
    {
      expr: 'worried',
      look: 0.85,
      lookV: 0.08,
      clavicleL: -2,
      clavicleR: -2,
      lightColor: '#9EC2F5',
      lightStrength: 0.5,
      lightSide: 1,
    },
    1,
  );

  // Synced footstep floorboard dust puffs at t=4, t=24, t=45
  let dust: { u: number; w: number; p: number } | null = null;
  if (t >= 4 && t < 16) dust = { u: 0.305, w: 0.28, p: (t - 4) / 12 };
  else if (t >= 24 && t < 36) dust = { u: 0.42, w: 0.28, p: (t - 24) / 12 };
  else if (t >= 45 && t < 57) dust = { u: 0.54, w: 0.28, p: (t - 45) / 12 };

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 272}
        id="s06"
        variant="portrait"
        veil={0.54}
        duvet
        closetOpen={0.085}
        breathMist={0.48}
        phoneGlow={0.14}
        phoneMode="dim"
        footDust={dust}
        fgParallax={0.38}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
    </g>
  );
};

// S07 (330..384): «وكل ما تقرب... تسمع أحد يهمس باسمك.»
export const S07: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.38, 1.62, [590, 878], [612, 868], {
    handheldFrame: f,
    handheldAmp: 2.0,
    rollFrom: 0,
    rollTo: 1.2,
    viewport: PORTRAIT_VIEWPORT,
  });
  const stopK = easeOut(clamp(t / 14));
  const u = lerp(0.51, 0.54, stopK);
  const gX = floorX(u, 0.3);
  const gY = floorY(u, 0.3);
  const sc = floorScale(0.3);

  let pose: Pose;
  if (t < 14) {
    const phase = ((t - 6) / 20) * Math.PI + Math.PI * 3.5;
    const damp = 1 - clamp((t - 6) / 8);
    pose = walkPose(
      gX,
      phase,
      gY,
      sc,
      {
        expr: 'worried',
        look: 0.88,
        tilt: 4 * damp + 2,
        lightColor: '#9EC2F5',
        lightStrength: 0.45,
        lightSide: 1,
      },
      1,
    );
    pose.legL.a *= damp;
    pose.legR.a *= damp;
    pose.legL.b *= damp;
    pose.legR.b *= damp;
  } else {
    const freezeK = clamp((t - 14) / 14);
    const br = breathCurve(t, 40) * 0.9;
    pose = {
      ...basePose,
      x: gX,
      y: gY - LEG_LEN * sc + br * 0.7,
      scale: sc,
      facing: 1,
      yaw: 0.92,
      tilt: 2.5,
      headTilt: lerp(0, -10, freezeK),
      clavicleL: -4 * freezeK,
      clavicleR: -4 * freezeK,
      armL: { a: 10, b: 14 },
      armR: { a: 14, b: 16 },
      handR: 'tense',
      legL: { a: 4, b: 0 },
      legR: { a: -4, b: 0 },
      expr: t > 18 ? 'shock' : 'worried',
      look: 0.92,
      lookV: -0.15,
      sway: 2,
      pupilScale: 1.15,
      lightColor: '#9EC2F5',
      lightStrength: 0.52,
      lightSide: 1,
    };
  }

  const whisperVis = clamp((t - 12) / 10);
  const dust = t >= 6 && t < 17 ? { u: 0.68, w: 0.3, p: (t - 6) / 11 } : null;

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 330}
        id="s07"
        variant="portrait"
        veil={0.6}
        duvet
        closetOpen={0.085}
        closetRattle={whisperVis * 0.48}
        breathMist={0.55 + whisperVis * 0.45}
        phoneGlow={0.14}
        phoneMode="dim"
        footDust={dust}
        fgParallax={0.44}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
      {whisperVis > 0.05 ? (
        <g opacity={whisperVis * 0.78}>
          {[0, 1, 2].map((i) => {
            const p = (t - 12 - i * 10) % 34;
            if (p < 0) return null;
            const r = 14 + p * 2.1;
            return (
              <path
                key={`wh${i}`}
                d={`M ${CLOSET_HANDLE_PORTRAIT.x + 8} ${CLOSET_HANDLE_PORTRAIT.y - 108 - r * 0.32} Q ${CLOSET_HANDLE_PORTRAIT.x - 10 - r * 0.55} ${CLOSET_HANDLE_PORTRAIT.y - 108} ${CLOSET_HANDLE_PORTRAIT.x + 8} ${CLOSET_HANDLE_PORTRAIT.y - 108 + r * 0.32}`}
                fill="none"
                stroke="#9EC2F5"
                strokeWidth={2.5}
                opacity={Math.max(0, 1 - p / 34) * 0.72}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      ) : null}
    </g>
  );
};

// S08 (384..420): «تمد يدك للمقبض،»
export const S08: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.9, 2.15, [600, 892], [616, 886], {
    handheldFrame: f,
    handheldAmp: 2.4,
    rollFrom: 0.8,
    rollTo: 1.5,
    viewport: PORTRAIT_VIEWPORT,
  });
  const gX = floorX(0.54, 0.3);
  const gY = floorY(0.54, 0.3);
  const sc = floorScale(0.3);
  const reachK = easeInOut(clamp(t / 24));
  const tremor = t > 10 ? microTremor(f, 1.85, 13) : 0;

  const baseForReach: Pose = {
    ...basePose,
    x: gX,
    y: gY - LEG_LEN * sc,
    scale: sc,
    facing: 1,
    yaw: 0.92,
    tilt: 7 * reachK,
    headTilt: -4,
    clavicleR: -5 * reachK,
    armL: { a: 12, b: 14 },
    armR: { a: 16, b: 14 },
    handR: 'tense',
    legL: { a: 4, b: 0 },
    legR: { a: -4, b: 0 },
    expr: 'worried',
    look: 0.95,
    lookV: -0.1,
    lightColor: '#FFB85C',
    lightStrength: 0.45,
    lightSide: 1,
  };

  const ajarHandleTarget = { x: CLOSET_HANDLE_PORTRAIT.x - 16, y: CLOSET_HANDLE_PORTRAIT.y + 4 };
  const targetAng = reachAngle(baseForReach, ajarHandleTarget);
  const pose: Pose = {
    ...baseForReach,
    armR: {
      a: lerp(18, targetAng, reachK * 0.94) + tremor,
      b: lerp(22, -12, reachK) - tremor * 0.7,
    },
  };

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 384}
        id="s08"
        variant="portrait"
        veil={0.64}
        duvet
        closetOpen={0.085}
        breathMist={0.62}
        phoneGlow={0.14}
        phoneMode="dim"
        fgParallax={0.48}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
    </g>
  );
};

// S09 (420..469): «وفجأه يرن جوالك!»
export const S09: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 2.25, 1.92, [540, 990], [536, 975], {
    handheldFrame: f,
    handheldAmp: 2.6,
    spring: true,
    viewport: PORTRAIT_VIEWPORT,
  });
  const jolt = clamp(t / 12);
  const moveBack = easeInOut(clamp((t - 16) / 30));
  const u = lerp(0.7, 0.6, moveBack);
  const gX = floorX(u, 0.26);
  const gY = floorY(u, 0.26);
  const sc = floorScale(0.26);
  const sec = t / 30;
  const ringBurst = (sec % 0.95) < 0.68 ? 1 : 0.2;
  const spinEcho = t <= 12 ? { dx: 12 * (1 - jolt), dy: 0, opacity: 0.22 } : undefined;

  const pose: Pose = {
    ...basePose,
    x: gX,
    y: gY - LEG_LEN * sc,
    scale: sc,
    facing: -1,
    yaw: lerp(0.85, -0.82, jolt),
    tilt: lerp(5, -6, moveBack),
    headTilt: lerp(-4, 6, jolt),
    clavicleL: -4,
    clavicleR: -4,
    armL: { a: 14, b: 18 },
    armR: { a: lerp(55, 20, jolt), b: lerp(-8, 18, jolt) },
    handR: 'tense',
    legL: { a: Math.sin(moveBack * Math.PI) * 14, b: 0 },
    legR: { a: -Math.sin(moveBack * Math.PI) * 14, b: 0 },
    expr: 'shock',
    look: -0.9,
    lookV: 0.25,
    motionEcho: spinEcho,
    lightColor: '#FF8A3D',
    lightStrength: 0.72,
    lightSide: -1,
  };

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 420}
        id="s09"
        variant="portrait"
        veil={0.46}
        duvet
        closetOpen={0.085}
        breathMist={0.28}
        phoneGlow={1.0}
        phoneMode="incoming"
        phoneBuzz={ringBurst}
        fgParallax={0.44}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
    </g>
  );
};

// S10 (469..515): «رقم غريب يتصل عليك...»
export const S10: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.32, 1.5, [555, 945], [520, 948], {
    handheldFrame: f,
    handheldAmp: 2.1,
    viewport: PORTRAIT_VIEWPORT,
  });
  const walkK = easeInOut(clamp(t / 30));
  const pickupReach = easeInOut(clamp((t - 24) / 18));
  const u = lerp(0.6, 0.47, walkK);
  const gX = floorX(u, 0.24);
  const gY = floorY(u, 0.24);
  const sc = floorScale(0.24);
  const ringBurst = t < 42 ? 0.9 : 0.2;

  const pBase: Pose = {
    ...basePose,
    x: gX,
    y: gY - LEG_LEN * sc - Math.abs(Math.sin(walkK * Math.PI * 2)) * 4 * (1 - pickupReach),
    scale: sc,
    facing: -1,
    yaw: -0.9,
    tilt: lerp(-5, -10, pickupReach),
    headTilt: 5,
    armL: { a: lerp(14, 30, pickupReach), b: lerp(16, 24, pickupReach) },
    armR: { a: 20, b: 18 },
    handR: pickupReach > 0.4 ? 'grip' : 'tense',
    legL: { a: Math.sin(walkK * Math.PI * 2) * 16 * (1 - pickupReach), b: 0 },
    legR: { a: -Math.sin(walkK * Math.PI * 2) * 16 * (1 - pickupReach), b: 0 },
    expr: 'shock',
    look: -0.88,
    lookV: 0.3,
    lightColor: '#FF8A3D',
    lightStrength: 0.75,
    lightSide: -1,
  };

  const phoneTargetAng = reachAngle(pBase, CLOSET_PHONE_PORTRAIT);
  const pose: Pose = {
    ...pBase,
    armR: pickupReach > 0.05 ? { a: lerp(pBase.armR.a, phoneTargetAng, pickupReach), b: lerp(18, -6, pickupReach) } : pBase.armR,
  };
  const dust = t >= 7 && t < 18 ? { u: 0.56, w: 0.24, p: (t - 7) / 11 } : null;

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 469}
        id="s10"
        variant="portrait"
        veil={0.48}
        duvet
        closetOpen={0.085}
        breathMist={0.25}
        phoneGlow={t < 43 ? 0.98 : 0.35}
        phoneMode="incoming"
        phoneBuzz={ringBurst}
        phoneLabel={false}
        footDust={dust}
        fgParallax={0.4}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
    </g>
  );
};

// S11 (515..567): «ترد، وتسمع صوت رجال كبير،»
export const S11: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.62, 1.78, [522, 855], [526, 848], {
    handheldFrame: f,
    handheldAmp: 1.7,
    viewport: PORTRAIT_VIEWPORT,
  });
  const gX = floorX(0.47, 0.22);
  const gY = floorY(0.47, 0.22);
  const sc = floorScale(0.22);
  const raiseK = easeOut(clamp(t / 12));

  const pose: Pose = {
    ...basePose,
    x: gX,
    y: gY - LEG_LEN * sc,
    scale: sc,
    facing: 1,
    yaw: lerp(-0.4, 0.36, clamp(t / 34)),
    tilt: -2,
    headTilt: -4,
    clavicleR: -3,
    armR: { a: lerp(-34, -54, raiseK), b: lerp(-58, -94, raiseK) },
    armL: { a: 12, b: 18 },
    handR: 'grip',
    legL: { a: 5, b: 0 },
    legR: { a: -5, b: 0 },
    expr: 'worried',
    blink: t > 14 && t < 18 ? 1 : 0,
    look: 0.25,
    lightColor: '#FFB85C',
    lightStrength: 0.72,
    lightSide: -1,
  };

  const j = joints(pose);
  const handWorld = toWorld(pose, j.armR.end);

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 515}
        id="s11"
        variant="portrait"
        veil={0.56}
        duvet
        closetOpen={0.085}
        breathMist={0.32}
        phoneGlow={0.4}
        phoneMode="connected"
        fgParallax={0.42}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
      <HeldPhone x={handWorld.x + 8} y={handWorld.y - 10} rot={16} glow="#FFB85C" pulse={0.35} />
    </g>
  );
};

// S12 (567..656): «كأنه يتكلم من مسجل قديم. يقول لك بصوت مرعوب:»
export const S12: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.24, 1.38, [585, 875], [615, 868], {
    handheldFrame: f,
    handheldAmp: 1.9,
    rollFrom: -0.4,
    rollTo: -1.1,
    viewport: PORTRAIT_VIEWPORT,
  });
  const gX = floorX(0.47, 0.22);
  const gY = floorY(0.47, 0.22);
  const sc = floorScale(0.22);
  const tremor = t > 52 ? microTremor(f, 0.9, 21) : 0;

  const pose: Pose = {
    ...basePose,
    x: gX + tremor * 0.3,
    y: gY - LEG_LEN * sc,
    scale: sc,
    facing: 1,
    yaw: 0.45,
    tilt: -2,
    headTilt: -5,
    clavicleR: -3,
    armR: { a: -54 + tremor, b: -94 },
    armL: { a: 12, b: 18 },
    handR: 'grip',
    legL: { a: 5, b: 0 },
    legR: { a: -5, b: 0 },
    expr: t > 62 ? 'shock' : 'worried',
    look: 0.65,
    lightColor: '#FFB85C',
    lightStrength: 0.68,
    lightSide: -1,
  };

  const j = joints(pose);
  const handWorld = toWorld(pose, j.armR.end);

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 567}
        id="s12"
        variant="portrait"
        veil={0.6}
        duvet
        closetOpen={0.085}
        breathMist={0.44}
        phoneGlow={0.42}
        phoneMode="connected"
        clockMute={t >= 87}
        fgParallax={0.46}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
      <HeldPhone x={handWorld.x + 8} y={handWorld.y - 10} rot={16} glow="#FFB85C" pulse={0.45} />
    </g>
  );
};

// S13 (656..689): «لا تفتح الخزانه...» (telephone-caller active in dead silence!)
export const S13: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 2.02, 2.22, [540, 842], [544, 836], {
    handheldFrame: f,
    handheldAmp: 2.3,
    rollFrom: -0.9,
    rollTo: -1.4,
    viewport: PORTRAIT_VIEWPORT,
  });
  const gX = floorX(0.47, 0.22);
  const gY = floorY(0.47, 0.22);
  const sc = floorScale(0.22);
  const tremor = microTremor(f, 1.4, 31);
  const pulseWave = 0.72 + 0.28 * Math.sin(t * 0.9);

  const pose: Pose = {
    ...basePose,
    x: gX + tremor * 0.45,
    y: gY - LEG_LEN * sc,
    scale: sc,
    facing: 1,
    yaw: 0.52,
    tilt: 1,
    headTilt: -8,
    clavicleL: -4,
    clavicleR: -5,
    armR: { a: -54 + tremor, b: -94 },
    armL: { a: 12, b: 18 },
    handR: 'grip',
    legL: { a: 5, b: 0 },
    legR: { a: -5, b: 0 },
    expr: 'shock',
    look: 0.92,
    lookV: -0.1,
    pupilScale: 1.18,
    lightColor: '#FFB85C',
    lightStrength: 0.85,
    lightSide: -1,
  };

  const j = joints(pose);
  const handWorld = toWorld(pose, j.armR.end);

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 656}
        id="s13"
        variant="portrait"
        veil={0.6}
        duvet
        closetOpen={0.085}
        breathMist={0.4}
        phoneGlow={0.62}
        phoneMode="connected"
        clockMute
        fgParallax={0.48}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
      <HeldPhone x={handWorld.x + 8} y={handWorld.y - 10} rot={16} glow="#FFD080" pulse={pulseWave} />
    </g>
  );
};

// S14 (689..724): «أنا محبوس داخلها!» (Dutch-angle panic eyes extreme close-up)
export const S14: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 2.26, 2.5, [542, 836], [546, 828], {
    handheldFrame: f,
    handheldAmp: 2.8,
    rollFrom: -1.6,
    rollTo: -2.6,
    viewport: PORTRAIT_VIEWPORT,
  });
  const gX = floorX(0.47, 0.22);
  const gY = floorY(0.47, 0.22);
  const sc = floorScale(0.22);
  const tremor = microTremor(f, 1.8, 37);
  const pulseWave = 0.82 + 0.18 * Math.sin(t * 1.15);

  const pose: Pose = {
    ...basePose,
    x: gX + tremor * 0.55,
    y: gY - LEG_LEN * sc,
    scale: sc,
    facing: 1,
    yaw: 0.58,
    tilt: 2,
    headTilt: -10,
    clavicleL: -5,
    clavicleR: -6,
    armR: { a: -54 + tremor, b: -94 },
    armL: { a: 12, b: 18 },
    handR: 'grip',
    legL: { a: 5, b: 0 },
    legR: { a: -5, b: 0 },
    expr: 'shock',
    look: 0.96,
    lookV: -0.15,
    pupilScale: 1.28,
    lightColor: '#FF9E57',
    lightStrength: 0.92,
    lightSide: -1,
  };

  const j = joints(pose);
  const handWorld = toWorld(pose, j.armR.end);

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 689}
        id="s14"
        variant="portrait"
        veil={0.64}
        duvet
        closetOpen={0.085}
        breathMist={0.44}
        phoneGlow={0.68}
        phoneMode="connected"
        clockMute
        fgParallax={0.5}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
      <HeldPhone x={handWorld.x + 8} y={handWorld.y - 10} rot={16} glow="#FFE2A3" pulse={pulseWave} />
    </g>
  );
};

// S15 (724..759): «تتجمد بمكانك...» (Wide vertical noir freeze standoff)
export const S15: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.04, 1.07, [540, 940], [540, 940], {
    handheldFrame: f,
    handheldAmp: 0.6,
    viewport: PORTRAIT_VIEWPORT,
  });
  const gX = floorX(0.45, 0.22);
  const gY = floorY(0.45, 0.22);
  const sc = floorScale(0.22);
  const lowerArm = easeInOut(clamp(t / Math.max(1, len - 4)));

  const pose: Pose = {
    ...basePose,
    x: gX,
    y: gY - LEG_LEN * sc,
    scale: sc,
    facing: 1,
    yaw: 0.78,
    tilt: -2,
    headTilt: -3,
    armR: { a: lerp(-54, 26, lowerArm), b: lerp(-94, -36, lowerArm) },
    armL: { a: 8, b: 12 },
    handR: 'grip',
    legL: { a: 5, b: 0 },
    legR: { a: -5, b: 0 },
    expr: 'shock',
    look: 0.94,
    lightColor: '#9EC2F5',
    lightStrength: 0.45,
    lightSide: 1,
  };

  const j = joints(pose);
  const handWorld = toWorld(pose, j.armR.end);

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 724}
        id="s15"
        variant="portrait"
        veil={0.62}
        duvet
        closetOpen={0.085}
        breathMist={0.42}
        phoneGlow={0.28}
        phoneMode="connected"
        clockMute
        fgParallax={0.4}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
      <HeldPhone x={handWorld.x + 8} y={handWorld.y - 8} rot={14} glow="#FF8A3D" pulse={0.14} />
    </g>
  );
};

// S16 (759..813): «وفجأه، ينفتح باب الخزانه شوي...» (Door swings ajar 0.085 -> 0.58 + Claw grip reveal)
export const S16: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.54, 1.76, [668, 862], [685, 852], {
    handheldFrame: f,
    handheldAmp: 1.8,
    rollFrom: 0.6,
    rollTo: 1.4,
    viewport: PORTRAIT_VIEWPORT,
  });
  const gX = floorX(0.45, 0.22);
  const gY = floorY(0.45, 0.22);
  const sc = floorScale(0.22);

  const swingK = easeInOut(clamp((t - 3) / 46));
  const closetOpen = lerp(0.085, 0.58, swingK);
  const clawK = easeOut(clamp((t - 19) / 18));
  const presence = clamp((t - 18) / 28) * 0.62;

  const pose: Pose = {
    ...basePose,
    x: gX,
    y: gY - LEG_LEN * sc,
    scale: sc,
    facing: 1,
    yaw: 0.8,
    tilt: -2,
    headTilt: -3,
    armR: { a: 26, b: -36 },
    armL: { a: 8, b: 12 },
    handR: 'grip',
    legL: { a: 5, b: 0 },
    legR: { a: -5, b: 0 },
    expr: 'shock',
    look: 0.94,
  };

  const j = joints(pose);
  const handWorld = toWorld(pose, j.armR.end);

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 759}
        id="s16"
        variant="portrait"
        veil={0.64}
        duvet
        closetOpen={closetOpen}
        closetPresence={presence}
        closetClaw={clawK}
        breathMist={0.55 + swingK * 0.35}
        phoneGlow={0.24}
        phoneMode="connected"
        clockMute
        fgParallax={0.48}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
      <HeldPhone x={handWorld.x + 8} y={handWorld.y - 8} rot={14} glow="#FF8A3D" pulse={0.1} />
    </g>
  );
};

// S17 (813..866): «وتسمع صوت ثاني من داخلها يقول:» (Dark void eyes focusing)
export const S17: React.FC<{ t: number; len: number; f: number }> = ({ t, len, f }) => {
  const cam = motivatedCamera(t / len, 1.82, 2.02, [676, 822], [682, 808], {
    handheldFrame: f,
    handheldAmp: 2.1,
    rollFrom: 1.3,
    rollTo: 2.0,
    viewport: PORTRAIT_VIEWPORT,
  });
  const gX = floorX(0.45, 0.22);
  const gY = floorY(0.45, 0.22);
  const sc = floorScale(0.22);
  const presence = lerp(0.62, 0.96, easeInOut(clamp(t / Math.max(1, len))));

  const pose: Pose = {
    ...basePose,
    x: gX,
    y: gY - LEG_LEN * sc,
    scale: sc,
    facing: 1,
    yaw: 0.8,
    tilt: -3,
    headTilt: -4,
    armR: { a: 26, b: -36 },
    armL: { a: 8, b: 12 },
    handR: 'grip',
    legL: { a: 5, b: 0 },
    legR: { a: -5, b: 0 },
    expr: 'shock',
    look: 0.94,
  };

  const j = joints(pose);
  const handWorld = toWorld(pose, j.armR.end);

  return (
    <g transform={cam}>
      <ClosetBedroom
        t={t + 813}
        id="s17"
        variant="portrait"
        veil={0.68}
        duvet
        closetOpen={0.58}
        closetPresence={presence}
        closetClaw={1}
        breathMist={0.78}
        phoneGlow={0.22}
        phoneMode="connected"
        clockMute
        fgParallax={0.5}
      />
      <Actor pose={pose} look={AMBER_HERO} rimId="" />
      <HeldPhone x={handWorld.x + 8} y={handWorld.y - 8} rot={14} glow="#FF8A3D" pulse={0.08} />
    </g>
  );
};

// S18 (866..960): «لا تصدقه... أنا اللي اتصلت عليك!» + Post-line Horror Sting Lunge (f915..f960)
export const S18: React.FC<{ t: number; len: number; f: number }> = ({ t, f }) => {
  const voicePhase = easeInOut(clamp(t / 49));
  const stingPhase = easeOut(clamp((t - 49) / 16));
  const scale = lerp(2.04, 2.48, voicePhase) + stingPhase * 0.45;
  const fx = lerp(678, 684, voicePhase) - stingPhase * 6;
  const fy = lerp(808, 795, voicePhase) - stingPhase * 6;
  const roll = lerp(2.0, 3.2, voicePhase) + stingPhase * 1.4;
  const horrorShake = t >= 49 && t <= 66 ? microTremor(f, 2.8 * (1 - (t - 49) / 17), 19) : 0;
  const cam = cameraTransform(scale, fx, fy, horrorShake, horrorShake * 0.6, roll, PORTRAIT_VIEWPORT);

  const gX = floorX(0.45, 0.22);
  const gY = floorY(0.45, 0.22);
  const sc = floorScale(0.22);
  const fadeToBlack = clamp((t - 76) / 17);

  const pose: Pose = {
    ...basePose,
    x: gX,
    y: gY - LEG_LEN * sc,
    scale: sc,
    facing: 1,
    yaw: 0.8,
    tilt: -3,
    headTilt: -4,
    armR: { a: 26, b: -36 },
    armL: { a: 8, b: 12 },
    handR: 'grip',
    legL: { a: 5, b: 0 },
    legR: { a: -5, b: 0 },
    expr: 'shock',
    look: 0.94,
  };

  const j = joints(pose);
  const handWorld = toWorld(pose, j.armR.end);

  return (
    <g>
      <g transform={cam}>
        <ClosetBedroom
          t={t + 866}
          id="s18"
          variant="portrait"
          veil={0.7 + stingPhase * 0.14}
          duvet
          closetOpen={0.58 + stingPhase * 0.12}
          closetPresence={1}
          closetLunge={stingPhase}
          closetClaw={1}
          dangerGlow={0.28 + stingPhase * 0.72}
          breathMist={0.68 + stingPhase * 0.32}
          phoneGlow={0.2}
          phoneMode="connected"
          clockMute
          fgParallax={0.52}
        />
        <Actor pose={pose} look={AMBER_HERO} rimId="" />
        <HeldPhone x={handWorld.x + 8} y={handWorld.y - 8} rot={14} glow="#FF8A3D" pulse={0.08} />
      </g>
      {fadeToBlack > 0.01 ? <rect width={1080} height={1920} fill="#000000" opacity={fadeToBlack} /> : null}
    </g>
  );
};

export const SHOTS: ShotMap = {
  S01,
  S02,
  S03,
  S04,
  S05,
  S06,
  S07,
  S08,
  S09,
  S10,
  S11,
  S12,
  S13,
  S14,
  S15,
  S16,
  S17,
  S18,
};

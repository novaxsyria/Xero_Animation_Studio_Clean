import React from 'react';
import { lerp, easeInOut, doubleBounce } from './anim';

// The cast, drawn entirely in code: one rig, and a costume (a Look) per character. Every character is built
// once here, so they look identical in every shot: that's the "drawn, not guessed" point. Original
// characters only: never a channel's own hero or anything that resembles a famous cartoon character.

export const C = {
  skin: '#F6EFE3',
  skinShade: '#E2D3BE',
  ink: '#1D2033',
  jacket: '#F2B33D',
  jacketShade: '#D4922A',
  shoe: '#2FB7A6',
  orange: '#FF8A3D',
  limb: '#EFE2CC',
};

/** A costume for the rig: the same body and animation, different colours and one optional extra piece. */
export type Look = {
  skin: string;
  skinShade: string;
  hand: string;
  jacket: string;
  jacketShade: string;
  accent: string;
  limb: string;
  line: string;
  shoe: string;
  face: string;
  hair: string;
  extra?: 'hood' | 'curls' | 'bunches' | 'bob' | 'suit' | 'elder' | 'school';
};
export type CastName =
  | 'pip'
  | 'pipHood'
  | 'pipInk'
  | 'mo'
  | 'sis'
  | 'mom'
  | 'suit'
  | 'rakan'
  | 'rakanSleep'
  | 'youngRakan'
  | 'father'
  | 'commuter'
  | 'amberNoir';
export const LOOKS: Record<CastName, Look> = {
  pip: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: C.jacket, jacketShade: C.jacketShade, accent: C.jacketShade, limb: C.limb, line: C.ink, shoe: C.shoe, face: C.ink, hair: C.ink },
  pipHood: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#2E2B3D', jacketShade: '#24212F', accent: C.jacket, limb: '#2E2B3D', line: '#121019', shoe: C.shoe, face: C.ink, hair: C.ink, extra: 'hood' },
  pipInk: { skin: '#26232F', skinShade: '#1C1A24', hand: '#26232F', jacket: C.jacket, jacketShade: C.jacketShade, accent: C.jacketShade, limb: '#26232F', line: '#121019', shoe: C.shoe, face: '#F6EFE3', hair: '#26232F' },
  mo: { skin: '#C98E68', skinShade: '#B07A58', hand: '#C98E68', jacket: '#5E6E46', jacketShade: '#4C5A38', accent: '#E9C46A', limb: '#3A3446', line: '#1A1622', shoe: '#D9534F', face: C.ink, hair: '#2A1C18', extra: 'curls' },
  sis: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#3E8C86', jacketShade: '#2F6E69', accent: '#F28C6A', limb: '#3A3446', line: '#14121C', shoe: '#F28C6A', face: C.ink, hair: '#3A2620', extra: 'bunches' },
  mom: { skin: C.skin, skinShade: C.skinShade, hand: C.skin, jacket: '#8A5A6A', jacketShade: '#704858', accent: '#E9C46A', limb: '#3A3446', line: '#14121C', shoe: '#5A4A6A', face: C.ink, hair: '#5A3226', extra: 'bob' },
  suit: { skin: '#D9C6AE', skinShade: '#C2AE96', hand: '#D9C6AE', jacket: '#2B2F3A', jacketShade: '#20232C', accent: '#A8323E', limb: '#2B2F3A', line: '#0E0F14', shoe: '#14151A', face: C.ink, hair: '#17141A', extra: 'suit' },
  rakan: {
    skin: '#F4E5D2',
    skinShade: '#DEC8AF',
    hand: '#F4E5D2',
    jacket: '#282C46',
    jacketShade: '#1D2036',
    accent: '#FFB85C',
    limb: '#343A59',
    line: '#111322',
    shoe: '#4CA7BA',
    face: '#141629',
    hair: '#191826',
    extra: 'hood',
  },
  rakanSleep: {
    skin: '#F4E5D2',
    skinShade: '#DEC8AF',
    hand: '#F4E5D2',
    jacket: '#323A5C',
    jacketShade: '#252B47',
    accent: '#85B8FF',
    limb: '#3A436B',
    line: '#111322',
    shoe: '#262C47',
    face: '#141629',
    hair: '#191826',
  },
  youngRakan: {
    skin: '#F6E8D7',
    skinShade: '#E0CBB3',
    hand: '#F6E8D7',
    jacket: '#3E7096',
    jacketShade: '#2E5575',
    accent: '#F5C156',
    limb: '#477CA6',
    line: '#141A29',
    shoe: '#E07A5F',
    face: '#141A29',
    hair: '#221C29',
    extra: 'school',
  },
  father: {
    skin: '#E8D2BA',
    skinShade: '#CEB49A',
    hand: '#E8D2BA',
    jacket: '#6A4D3E',
    jacketShade: '#523A2E',
    accent: '#E8BA74',
    limb: '#4B3932',
    line: '#1A1311',
    shoe: '#3B2C26',
    face: '#1A1311',
    hair: '#7E8294',
    extra: 'elder',
  },
  commuter: {
    skin: '#DFC9B4',
    skinShade: '#C6AF9A',
    hand: '#DFC9B4',
    jacket: '#3E465E',
    jacketShade: '#2E3447',
    accent: '#9CB4D4',
    limb: '#353B52',
    line: '#131622',
    shoe: '#232838',
    face: '#131622',
    hair: '#232433',
  },
  // AmberFrame Signature A6 Amber Noir Protagonist: matte-black circular head, light eyes, orange hoodie
  amberNoir: {
    skin: '#1A1824',
    skinShade: '#110F18',
    hand: '#1A1824',
    jacket: '#FF8A3D',
    jacketShade: '#CC6220',
    accent: '#231F2E',
    limb: '#242738',
    line: '#0A0B12',
    shoe: '#151722',
    face: '#F6EFE3',
    hair: '#1A1824',
    extra: 'hood',
  },
};

// ---------- the hero ----------
export type HandKind = 'open' | 'point' | 'six' | 'grip' | 'tense';
export type Expr = 'neutral' | 'happy' | 'smug' | 'shock' | 'worried' | 'oops' | 'cool' | 'dizzy' | 'tired';
export type Limb = { a: number; b: number };
export type Pose = {
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  tilt: number;
  spin: number;
  headTilt: number;
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  expr: Expr;
  blink: number;
  look: number;
  glasses: number;
  yaw: number;
  squash: number;
  handL: HandKind;
  handR: HandKind;
  sway: number;
  glint?: number;
  glintColor?: string;
  // Upgraded cinematic rig channels (all optional & backward compatible)
  lookV?: number; // -1 up .. +1 down vertical eye gaze
  clavicleL?: number; // vertical shoulder elevation/tension px
  clavicleR?: number; // vertical shoulder elevation/tension px
  hipY?: number; // local vertical hip weight-shift drop px
  breath?: number; // -1..1 chest & shoulder breathing expansion
  pupilScale?: number; // 0.65..1.35 pupil/iris tension size
  lightColor?: string; // rim highlight color (moonlight '#9EC2F5' or amber '#FFB85C')
  lightStrength?: number; // 0..1 rim intensity on hoodie/head edge
  lightSide?: -1 | 1; // -1 light from screen-left (e.g. nightstand phone), +1 from right/back window
  motionEcho?: { dx: number; dy: number; opacity?: number }; // subtle kinetic blur echo during jolts/turns
};

export const basePose: Pose = {
  x: 960,
  y: 700,
  scale: 1,
  facing: 1,
  tilt: 0,
  spin: 0,
  headTilt: 0,
  armL: { a: 10, b: -8 },
  armR: { a: 10, b: -8 },
  legL: { a: 5, b: 0 },
  legR: { a: -5, b: 0 },
  expr: 'neutral',
  blink: 0,
  look: 0,
  glasses: 0,
  yaw: 0,
  squash: 0,
  handL: 'open',
  handR: 'open',
  sway: 0,
};

type Key = { f: number; p: Partial<Pose>; ease?: (t: number) => number };

const mixLimb = (a: Limb, b: Limb, t: number): Limb => ({ a: lerp(a.a, b.a, t), b: lerp(a.b, b.b, t) });

export const poseAt = (f: number, keys: Key[], from: Pose = basePose): Pose => {
  const full: { f: number; p: Pose; ease?: (t: number) => number }[] = [];
  let cur = from;
  for (const k of keys) {
    cur = { ...cur, ...k.p };
    full.push({ f: k.f, p: cur, ease: k.ease });
  }
  if (f <= full[0].f) return full[0].p;
  for (let i = 0; i < full.length - 1; i++) {
    const A = full[i];
    const B = full[i + 1];
    if (f <= B.f) {
      const t = (B.ease ?? easeInOut)((f - A.f) / Math.max(1e-6, B.f - A.f));
      return {
        x: lerp(A.p.x, B.p.x, t),
        y: lerp(A.p.y, B.p.y, t),
        scale: lerp(A.p.scale, B.p.scale, t),
        facing: t < 0.5 ? A.p.facing : B.p.facing,
        tilt: lerp(A.p.tilt, B.p.tilt, t),
        spin: lerp(A.p.spin, B.p.spin, t),
        headTilt: lerp(A.p.headTilt, B.p.headTilt, t),
        armL: mixLimb(A.p.armL, B.p.armL, t),
        armR: mixLimb(A.p.armR, B.p.armR, t),
        legL: mixLimb(A.p.legL, B.p.legL, t),
        legR: mixLimb(A.p.legR, B.p.legR, t),
        expr: A.p.expr,
        handL: A.p.handL,
        handR: A.p.handR,
        blink: lerp(A.p.blink, B.p.blink, t),
        look: lerp(A.p.look, B.p.look, t),
        glasses: lerp(A.p.glasses, B.p.glasses, t),
        yaw: lerp(A.p.yaw, B.p.yaw, t),
        squash: lerp(A.p.squash, B.p.squash, t),
        sway: lerp(A.p.sway, B.p.sway, t),
      };
    }
  }
  return full[full.length - 1].p;
};

const UPPER_ARM = 62;
const FORE_ARM = 58;
const THIGH = 72;
const SHIN = 68;
const SHOULDER = { x: 42, y: -108 };
const HIP = { x: 17, y: 0 };
export const HEAD = { x: 0, y: -176, r: 62 };
export const LEG_LEN = THIGH + SHIN;

const rad = (d: number) => (d * Math.PI) / 180;
type P = { x: number; y: number };
const rot = (p: P, deg: number, c: P = { x: 0, y: 0 }): P => {
  const r = rad(deg);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(r) - dy * Math.sin(r), y: c.y + dx * Math.sin(r) + dy * Math.cos(r) };
};

export const joints = (pose: Pose) => {
  const side = (s: 1 | -1, limb: Limb, root: P, l1: number, l2: number, isLeg: boolean) => {
    const dir = isLeg ? pose.facing : s;
    const d1 = { x: dir * Math.sin(rad(limb.a)), y: Math.cos(rad(limb.a)) };
    const mid = { x: root.x + d1.x * l1, y: root.y + d1.y * l1 };
    const a2 = limb.a + limb.b;
    const d2 = { x: dir * Math.sin(rad(a2)), y: Math.cos(rad(a2)) };
    return { root, mid, end: { x: mid.x + d2.x * l2, y: mid.y + d2.y * l2 } };
  };
  const breathLift = (pose.breath ?? 0) * -2.2;
  const clL = pose.clavicleL ?? 0;
  const clR = pose.clavicleR ?? 0;
  const torsoRot = (p: P) => rot(p, pose.tilt);
  const sp = limbSpread(pose.yaw);
  const shL = { x: -SHOULDER.x * sp + pose.yaw * 6, y: SHOULDER.y + breathLift + clL };
  const shR = { x: SHOULDER.x * sp + pose.yaw * 6, y: SHOULDER.y + breathLift + clR };
  const armL = side(-1, pose.armL, shL, UPPER_ARM, FORE_ARM, false);
  const armR = side(1, pose.armR, shR, UPPER_ARM, FORE_ARM, false);
  const legL = side(-1, pose.legL, { x: -HIP.x * sp, y: 0 }, THIGH, SHIN, true);
  const legR = side(1, pose.legR, { x: HIP.x * sp, y: 0 }, THIGH, SHIN, true);
  const r = (o: { root: P; mid: P; end: P }) => ({ root: torsoRot(o.root), mid: torsoRot(o.mid), end: torsoRot(o.end) });
  return { armL: r(armL), armR: r(armR), legL, legR, head: torsoRot({ x: HEAD.x, y: HEAD.y + breathLift * 0.6 }) };
};

export const turnWidth = (yaw: number) => 1 - 0.4 * Math.min(1, Math.abs(yaw));
export const limbSpread = (yaw: number) => 1 - 0.85 * Math.min(1, Math.abs(yaw));

export const faceAt = (f: number, keys: [number, Expr][]): { expr: Expr; blink: number } => {
  let expr = keys[0][1];
  let blink = 0;
  for (let i = 0; i < keys.length; i++) {
    const [k, e] = keys[i];
    if (f >= k) expr = e;
    if (i > 0 && f >= k - 2 && f < k + 1) blink = 1;
  }
  return { expr, blink };
};

export const toWorld = (pose: Pose, p: P): P => {
  const spun = rot(p, pose.spin, { x: 0, y: -90 });
  return { x: pose.x + spun.x * pose.scale, y: pose.y + spun.y * pose.scale };
};

export const reachAngle = (pose: Pose, target: P) => {
  const sh = toWorld(pose, rot({ x: SHOULDER.x * limbSpread(pose.yaw) + pose.yaw * 6, y: SHOULDER.y }, pose.tilt));
  const world = (Math.atan2(target.x - sh.x, target.y - sh.y) * 180) / Math.PI;
  return world - pose.tilt;
};

const Face: React.FC<{
  expr: Expr;
  blink: number;
  look: number;
  lookV?: number;
  glasses: number;
  yaw?: number;
  ink?: string;
  glint?: number;
  glintColor?: string;
  pupilScale?: number;
  darkHead?: boolean;
}> = ({ expr, blink, look, lookV = 0, glasses, yaw = 0, ink = C.ink, glint = 0, glintColor = '#8FF0FF', pupilScale = 1, darkHead = false }) => {
  const ex = look * 7.5;
  const ey = lookV * 5.2;
  const ay = Math.min(1, Math.abs(yaw));
  const farHidden = ay > 0.72;
  const farSide = yaw > 0 ? -1 : 1;
  const eyeY = HEAD.y - 4;
  const lid = expr === 'smug' || expr === 'cool' ? 0.45 : expr === 'tired' ? 0.58 : 0;
  const open = Math.max(0.08, 1 - Math.max(blink, lid));
  const eye = (cx: number) => {
    if (farHidden && Math.sign(cx) === farSide) return null;
    if (expr === 'happy') return <path d={`M ${cx - 10} ${eyeY + 3} Q ${cx} ${eyeY - 9} ${cx + 10} ${eyeY + 3}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />;
    if (expr === 'oops') return <path d={`M ${cx - 9} ${eyeY - 6} L ${cx + 4} ${eyeY} L ${cx - 9} ${eyeY + 6}`} transform={cx > 0 ? `translate(${2 * cx},0) scale(-1,1)` : undefined} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (expr === 'dizzy') return <g stroke={ink} strokeWidth={5} strokeLinecap="round"><path d={`M ${cx - 7} ${eyeY - 7} L ${cx + 7} ${eyeY + 7} M ${cx + 7} ${eyeY - 7} L ${cx - 7} ${eyeY + 7}`} /></g>;
    if (blink >= 0.95)
      return (
        <g>
          <path d={`M ${cx - 12} ${eyeY + 1} Q ${cx} ${eyeY + 8} ${cx + 12} ${eyeY + 1}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />
          {expr === 'tired' ? <path d={`M ${cx - 12} ${eyeY + 15} Q ${cx} ${eyeY + 22} ${cx + 12} ${eyeY + 15}`} stroke="#6F6788" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85} /> : null}
        </g>
      );
    const big = expr === 'shock';
    const rx = (big ? 11.8 : 7.8) * pupilScale;
    const ry = (big ? 14.5 : 10.8) * open * pupilScale;
    return (
      <g>
        <ellipse cx={cx + ex} cy={eyeY + ey + (lid ? 3 : 0)} rx={rx} ry={ry} fill={ink} />
        {darkHead && open > 0.3 ? (
          <ellipse cx={cx + ex + look * 2.4} cy={eyeY + ey + lookV * 1.8 + (lid ? 3 : 0)} rx={Math.max(2.5, rx * 0.36)} ry={Math.max(2.9, ry * 0.38)} fill="#151320" />
        ) : null}
        {big && open > 0.45 ? (
          <>
            <circle cx={cx + ex + 3.4} cy={eyeY + ey - 4.5} r={darkHead ? 2.8 : 3.4} fill="#FFFFFF" opacity={0.94} />
            <path d={`M ${cx + ex - rx * 0.7} ${eyeY + ey + ry + 3} Q ${cx + ex} ${eyeY + ey + ry + 6} ${cx + ex + rx * 0.7} ${eyeY + ey + ry + 3}`} stroke={darkHead ? '#5B5670' : '#A69580'} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.65} />
          </>
        ) : null}
        {lid ? <path d={expr === 'tired' ? `M ${cx - 13} ${eyeY - 1} Q ${cx} ${eyeY - 5} ${cx + 13} ${eyeY - 1}` : `M ${cx - 12} ${eyeY - 4} L ${cx + 12} ${eyeY - 2}`} stroke={ink} strokeWidth={4} strokeLinecap="round" fill="none" /> : null}
        {expr === 'tired' ? <path d={`M ${cx - 12} ${eyeY + 14} Q ${cx} ${eyeY + 21} ${cx + 12} ${eyeY + 14}`} stroke="#6F6788" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85} /> : null}
      </g>
    );
  };
  const brows: Record<Expr, string> = {
    neutral: '',
    happy: '',
    smug: `M -34 ${eyeY - 22} L -12 ${eyeY - 20} M 12 ${eyeY - 26} L 34 ${eyeY - 30}`,
    shock: `M -33 ${eyeY - 29} Q -21 ${eyeY - 38} -9 ${eyeY - 30} M 9 ${eyeY - 30} Q 21 ${eyeY - 38} 33 ${eyeY - 29}`,
    worried: `M -32 ${eyeY - 18} L -11 ${eyeY - 27} M 11 ${eyeY - 27} L 32 ${eyeY - 18}`,
    oops: `M -32 ${eyeY - 20} L -12 ${eyeY - 16} M 12 ${eyeY - 16} L 32 ${eyeY - 20}`,
    cool: '',
    dizzy: '',
    tired: `M -33 ${eyeY - 17} Q -22 ${eyeY - 21} -11 ${eyeY - 19} M 11 ${eyeY - 19} Q 22 ${eyeY - 21} 33 ${eyeY - 17}`,
  };
  const mY = HEAD.y + 28;
  const mouth: Record<Expr, React.ReactNode> = {
    neutral: <path d={`M -10 ${mY} Q 0 ${mY + 4} 10 ${mY}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    happy: <path d={`M -18 ${mY - 4} Q 0 ${mY + 20} 18 ${mY - 4} Z`} fill={ink} />,
    smug: <path d={`M -12 ${mY + 2} Q 4 ${mY + 8} 16 ${mY - 6}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    shock: <ellipse cx={0} cy={mY + 4} rx={10.5} ry={14.5} fill={ink} />,
    worried: <path d={`M -16 ${mY + 4} Q -8 ${mY - 4} 0 ${mY + 4} Q 8 ${mY + 12} 16 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    oops: <g><rect x={-18} y={mY - 6} width={36} height={16} rx={6} fill={ink} /><path d={`M -14 ${mY + 2} L 14 ${mY + 2}`} stroke="#fff" strokeWidth={3} /></g>,
    cool: <path d={`M -12 ${mY + 2} Q 4 ${mY + 8} 16 ${mY - 6}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    dizzy: <path d={`M -14 ${mY + 4} Q -7 ${mY - 4} 0 ${mY + 4} Q 7 ${mY + 12} 14 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
    tired: <path d={`M -11 ${mY + 4} Q 0 ${mY} 11 ${mY + 4}`} stroke={ink} strokeWidth={5} fill="none" strokeLinecap="round" />,
  };
  return (
    <g transform={`translate(${yaw * 30} 0) scale(${1 - 0.28 * ay} 1)`}>
      {eye(-21)}
      {eye(21)}
      {brows[expr] ? <path d={brows[expr]} stroke={ink} strokeWidth={4.8} fill="none" strokeLinecap="round" /> : null}
      {mouth[expr]}
      {expr === 'shock' || expr === 'oops' ? <path d={`M 50 ${HEAD.y - 28} q 7 11 0 18 q -7 -7 0 -18 Z`} fill="#8FD3FF" opacity={0.88} /> : null}
      {glint > 0.01 && blink < 0.95
        ? [-21, 21].map((cx) =>
            farHidden && Math.sign(cx) === farSide ? null : (
              <g key={`gl${cx}`} opacity={Math.min(1, glint)}>
                <circle cx={cx + ex} cy={eyeY} r={17} fill={glintColor} opacity={0.2} />
                <circle cx={cx + ex} cy={eyeY} r={12} fill={glintColor} opacity={0.28} />
                <ellipse cx={cx + ex} cy={eyeY + (lid ? 3 : 0)} rx={8} ry={Math.max(2, 11 * open)} fill={glintColor} />
                <circle cx={cx + ex + 2.5} cy={eyeY - 3} r={2.6} fill="#FFFFFF" />
              </g>
            ),
          )
        : null}
      {glasses > 0.01 ? (
        <g opacity={glasses} transform={`translate(0 ${(1 - glasses) * -60})`}>
          <path d={`M -58 ${eyeY - 12} L 58 ${eyeY - 12}`} stroke={ink} strokeWidth={6} strokeLinecap="round" />
          <path d={`M -50 ${eyeY - 14} L -6 ${eyeY - 14} L -10 ${eyeY + 8} Q -28 ${eyeY + 18} -46 ${eyeY + 8} Z`} fill="#0D0F1C" stroke={ink} strokeWidth={3} />
          <path d={`M 6 ${eyeY - 14} L 50 ${eyeY - 14} L 46 ${eyeY + 8} Q 28 ${eyeY + 18} 10 ${eyeY + 8} Z`} fill="#0D0F1C" stroke={ink} strokeWidth={3} />
          <path d={`M -40 ${eyeY + 2} L -26 ${eyeY - 10} M 16 ${eyeY + 2} L 30 ${eyeY - 10}`} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
        </g>
      ) : null}
    </g>
  );
};

export const Hero: React.FC<{ pose: Pose; shadow?: number; rimId?: string; look?: Look; cinematic?: boolean }> = ({
  pose,
  shadow = 1,
  rimId = 'rimR',
  look = LOOKS.pipHood,
  cinematic,
}) => {
  const j = joints(pose);
  const L = look;
  const enhanced = cinematic ?? L === LOOKS.amberNoir;
  const breath = pose.breath ?? 0;
  const lightSide = pose.lightSide ?? 1;
  const lightColor = pose.lightColor ?? '#9EC2F5';
  const lightStrength = pose.lightStrength ?? (enhanced ? 0.45 : 0);
  const darkHead = L.skin === '#1A1824';

  const limb = (o: { root: P; mid: P; end: P }, w: number, isArm: boolean) => {
    const upperW = enhanced ? (isArm ? w + 3.5 : w + 2.5) : w;
    const lowerW = enhanced ? (isArm ? w - 1 : w - 1) : w;
    const sleeveC = enhanced && isArm ? L.jacket : L.limb;
    const dFull = `M ${o.root.x} ${o.root.y} L ${o.mid.x} ${o.mid.y} L ${o.end.x} ${o.end.y}`;
    if (!enhanced) {
      return (
        <g>
          <path d={dFull} stroke={L.line} strokeWidth={w + 7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={dFull} stroke={L.limb} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    }
    return (
      <g>
        <path d={`M ${o.root.x} ${o.root.y} L ${o.mid.x} ${o.mid.y}`} stroke={L.line} strokeWidth={upperW + 6.5} fill="none" strokeLinecap="round" />
        <path d={`M ${o.mid.x} ${o.mid.y} L ${o.end.x} ${o.end.y}`} stroke={L.line} strokeWidth={lowerW + 6} fill="none" strokeLinecap="round" />
        <path d={`M ${o.root.x} ${o.root.y} L ${o.mid.x} ${o.mid.y}`} stroke={sleeveC} strokeWidth={upperW} fill="none" strokeLinecap="round" />
        <path d={`M ${o.mid.x} ${o.mid.y} L ${o.end.x} ${o.end.y}`} stroke={isArm ? L.jacketShade : L.limb} strokeWidth={lowerW} fill="none" strokeLinecap="round" />
        {isArm ? (
          <circle cx={o.end.x} cy={o.end.y} r={lowerW * 0.52} fill={L.accent} stroke={L.line} strokeWidth={2} />
        ) : null}
      </g>
    );
  };

  const shoe = (o: { root: P; mid: P; end: P }) => (
    <g>
      <ellipse cx={o.end.x + pose.facing * 9} cy={o.end.y + 4} rx={22} ry={11} fill={L.shoe} stroke={L.line} strokeWidth={4} />
      {enhanced ? (
        <path
          d={`M ${o.end.x + pose.facing * 9 - 18} ${o.end.y + 9} Q ${o.end.x + pose.facing * 9} ${o.end.y + 13} ${o.end.x + pose.facing * 9 + 18} ${o.end.y + 9}`}
          stroke="#2E3247"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      ) : null}
    </g>
  );

  const hand = (o: { mid: P; end: P }, side: 1 | -1, kind: HandKind) => {
    const ang = (Math.atan2(o.end.x - o.mid.x, o.end.y - o.mid.y) * 180) / Math.PI;
    return (
      <g transform={`translate(${o.end.x} ${o.end.y}) rotate(${-ang})`}>
        {kind === 'point' ? (
          <g>
            <rect x={-4} y={10} width={8} height={24} rx={4} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
            <path d="M -11 -2 Q -14 14 -6 18 L 7 18 Q 14 14 11 -2 Z" fill={L.hand} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
            <ellipse cx={side * 10} cy={6} rx={4.5} ry={7} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
          </g>
        ) : kind === 'tense' ? (
          <g>
            <ellipse cx={side * 13} cy={4} rx={4.6} ry={9.2} transform={`rotate(${side * -38} ${side * 13} 4)`} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
            <ellipse cx={0} cy={9} rx={11.5} ry={12} fill={L.hand} stroke={L.line} strokeWidth={3.8} />
            {[-7.5, -2.5, 2.5, 7.5].map((fx, fi) => (
              <rect
                key={fi}
                x={fx - 2.1}
                y={14}
                width={4.2}
                height={14 - Math.abs(fi - 1.5) * 1.4}
                rx={2.1}
                transform={`rotate(${(fi - 1.5) * 7} ${fx} 14)`}
                fill={L.hand}
                stroke={L.line}
                strokeWidth={2.4}
              />
            ))}
          </g>
        ) : kind === 'grip' ? (
          <g>
            <ellipse cx={0} cy={9} rx={11} ry={13.5} fill={L.hand} stroke={L.line} strokeWidth={4} />
            <ellipse cx={side * 8} cy={8} rx={5.2} ry={8.2} transform={`rotate(${side * 22} ${side * 8} 8)`} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
            {[-4, 1, 6].map((ky, ki) => (
              <path key={ki} d={`M -7 ${ky + 7} Q 0 ${ky + 9} 7 ${ky + 7}`} stroke={darkHead ? '#47415C' : L.line} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            ))}
          </g>
        ) : kind === 'six' ? (
          <g>
            <ellipse cx={side * 13} cy={4} rx={5} ry={9.5} transform={`rotate(${side * -34} ${side * 13} 4)`} fill={L.hand} stroke={L.line} strokeWidth={3.5} />
            <ellipse cx={0} cy={9} rx={12} ry={13} fill={L.hand} stroke={L.line} strokeWidth={3.8} />
            {[-9, -4.5, 0, 4.5, 9].map((fx, fi) => (
              <rect key={fi} x={fx - 2.1} y={15} width={4.2} height={15 - Math.abs(fi - 2) * 1.4} rx={2.1} fill={L.hand} stroke={L.line} strokeWidth={2.5} />
            ))}
          </g>
        ) : (
          <g>
            <ellipse cx={side * 10} cy={3} rx={5.5} ry={9} transform={`rotate(${side * -28} ${side * 10} 3)`} fill={L.hand} stroke={L.line} strokeWidth={4} />
            <ellipse cx={0} cy={10} rx={11} ry={15} fill={L.hand} stroke={L.line} strokeWidth={4} />
            <path d="M -4 17 L -4 23 M 3 18 L 3 24" stroke={darkHead ? '#3C374F' : L.line} strokeWidth={2} opacity={0.6} strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };

  const kw = turnWidth(pose.yaw) * (1 + breath * 0.025);
  const kh = 1 + breath * 0.015;
  const torso = (
    <g transform={`rotate(${pose.tilt}) translate(${pose.yaw * 6} 0) scale(${kw} ${kh})`}>
      <path d="M -46 -112 Q 0 -124 46 -112 L 40 2 Q 0 12 -40 2 Z" fill={L.jacket} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 10 -116 Q 30 -114 46 -112 L 40 2 Q 26 8 12 9 Z" fill={L.jacketShade} opacity={0.55} />
      <path d="M 0 -112 L 0 4" stroke={L.jacketShade} strokeWidth={4} />
      {enhanced ? (
        <g>
          {/* Hoodie pocket + hem + subtle specular edge highlight reacting to lightSide */}
          <path d="M -26 -38 L 26 -38 L 28 -10 Q 0 -4 -28 -10 Z" fill={L.jacketShade} opacity={0.45} />
          <path d="M -40 1 Q 0 11 40 1" stroke={L.accent} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
          {lightStrength > 0.05 ? (
            <path
              d={lightSide < 0 ? 'M -44 -109 L -39 -2' : 'M 44 -109 L 39 -2'}
              stroke={lightColor}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={lightStrength * 0.72}
            />
          ) : null}
        </g>
      ) : null}
      {L.extra === 'suit' ? (
        <g>
          <path d="M -24 -116 L 0 -54 L 24 -116 Z" fill="#EDE8DE" />
          <path d="M -7 -112 L 7 -112 L 9 -100 L 5 -64 L 0 -56 L -5 -64 L -9 -100 Z" fill={L.accent} />
          <path d="M -26 -116 L 0 -54 M 26 -116 L 0 -54" stroke={L.line} strokeWidth={4} />
        </g>
      ) : L.extra === 'elder' ? (
        <g>
          <path d="M -22 -116 L 0 -64 L 22 -116 Z" fill="#EAE2D3" stroke={L.line} strokeWidth={3} />
          <path d="M -22 -118 Q 0 -98 22 -118" stroke={L.accent} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      ) : L.extra === 'school' ? (
        <g>
          <path d="M -18 -116 L 0 -86 L 18 -116 Z" fill="#F4EFE6" stroke={L.line} strokeWidth={3} />
          <path d="M -24 -116 Q 0 -98 24 -116" stroke={L.accent} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <path d="M -22 -118 Q 0 -100 22 -118" stroke={L.accent} strokeWidth={6} fill="none" strokeLinecap="round" />
      )}
    </g>
  );

  const head = (
    <g transform={`rotate(${pose.tilt}) rotate(${pose.headTilt} 0 ${HEAD.y + 40}) translate(0 ${breath * -1.4})`}>
      <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r} fill={L.skin} stroke={L.line} strokeWidth={4} />
      <path d={`M ${HEAD.x + 14} ${HEAD.y + 58} A ${HEAD.r} ${HEAD.r} 0 0 0 ${HEAD.x + 60} ${HEAD.y + 14} A 70 70 0 0 1 ${HEAD.x + 14} ${HEAD.y + 58} Z`} fill={L.skinShade} />
      {enhanced && lightStrength > 0.05 ? (
        <path
          d={
            lightSide < 0
              ? `M ${HEAD.x - 56} ${HEAD.y - 26} A ${HEAD.r - 2} ${HEAD.r - 2} 0 0 0 ${HEAD.x - 42} ${HEAD.y + 44}`
              : `M ${HEAD.x + 56} ${HEAD.y - 26} A ${HEAD.r - 2} ${HEAD.r - 2} 0 0 1 ${HEAD.x + 42} ${HEAD.y + 44}`
          }
          stroke={lightColor}
          strokeWidth={3.5}
          strokeLinecap="round"
          fill="none"
          opacity={lightStrength * 0.65}
        />
      ) : null}
      {L.extra === 'bunches' || L.extra === 'bob' || L.extra === 'suit' || L.extra === 'elder' || L.extra === 'hood' ? null : (
        <path transform={`translate(${-pose.yaw * 16} 0)`} d={`M -6 ${HEAD.y - 60} q 10 -26 30 -18 q -16 2 -14 16 q -8 -10 -16 2 Z`} fill={L.hair} />
      )}
      {L.extra === 'elder' ? (
        <g transform={`translate(${-pose.yaw * 14} 0)`}>
          <path d={`M -58 ${HEAD.y - 16} Q -62 ${HEAD.y - 68} 0 ${HEAD.y - 68} Q 62 ${HEAD.y - 66} 58 ${HEAD.y - 16} Q 42 ${HEAD.y - 42} 0 ${HEAD.y - 44} Q -42 ${HEAD.y - 42} -58 ${HEAD.y - 16} Z`} fill={L.hair} />
          <path d={`M -18 ${HEAD.y + 18} Q 0 ${HEAD.y + 12} 18 ${HEAD.y + 18}`} stroke={L.hair} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.85} />
          <path d={`M -28 ${HEAD.y + 38} Q 0 ${HEAD.y + 62} 28 ${HEAD.y + 38} Q 16 ${HEAD.y + 54} 0 ${HEAD.y + 56} Q -16 ${HEAD.y + 54} -28 ${HEAD.y + 38} Z`} fill={L.hair} opacity={0.85} />
        </g>
      ) : null}
      {L.extra === 'bunches' ? (
        <g>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`rotate(${pose.sway * 0.5} ${sd * 58} ${HEAD.y - 30})`}>
              <circle cx={sd * 72 - pose.yaw * 10} cy={HEAD.y - 24} r={24} fill={L.hair} stroke={L.line} strokeWidth={4} />
              <circle cx={sd * 55 - pose.yaw * 10} cy={HEAD.y - 30} r={8} fill={L.accent} />
            </g>
          ))}
          <path transform={`translate(${-pose.yaw * 14} 0)`} d={`M -60 ${HEAD.y - 22} Q -62 ${HEAD.y - 66} 0 ${HEAD.y - 66} Q 62 ${HEAD.y - 66} 60 ${HEAD.y - 22} Q 40 ${HEAD.y - 46} 14 ${HEAD.y - 40} Q 0 ${HEAD.y - 50} -14 ${HEAD.y - 40} Q -40 ${HEAD.y - 46} -60 ${HEAD.y - 22} Z`} fill={L.hair} />
        </g>
      ) : null}
      {L.extra === 'bob' ? (
        <path
          transform={`translate(${-pose.yaw * 12} 0)`}
          d={`M -74 ${HEAD.y + 34} Q -84 ${HEAD.y - 70} 0 ${HEAD.y - 72} Q 84 ${HEAD.y - 70} 74 ${HEAD.y + 34} L 56 ${HEAD.y + 34} Q 60 ${HEAD.y - 20} 40 ${HEAD.y - 40} Q 10 ${HEAD.y - 34} -16 ${HEAD.y - 48} Q -52 ${HEAD.y - 30} -56 ${HEAD.y + 34} Z`}
          fill={L.hair}
          stroke={L.line}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      ) : null}
      {L.extra === 'suit' ? (
        <path transform={`translate(${-pose.yaw * 14} 0)`} d={`M -60 ${HEAD.y - 18} Q -64 ${HEAD.y - 70} 4 ${HEAD.y - 68} Q 64 ${HEAD.y - 64} 60 ${HEAD.y - 18} Q 52 ${HEAD.y - 44} 18 ${HEAD.y - 46} L 12 ${HEAD.y - 54} L 6 ${HEAD.y - 46} Q -44 ${HEAD.y - 46} -60 ${HEAD.y - 18} Z`} fill={L.hair} />
      ) : null}
      <Face
        expr={pose.expr}
        blink={pose.blink}
        look={pose.look}
        lookV={pose.lookV}
        glasses={pose.glasses}
        yaw={pose.yaw}
        ink={L.face}
        glint={pose.glint}
        glintColor={pose.glintColor}
        pupilScale={pose.pupilScale ?? 1}
        darkHead={darkHead}
      />
      {L.extra === 'curls'
        ? [-150, -125, -100, -78, -55, -30].map((deg, k) => {
            const a = (deg * Math.PI) / 180;
            return <circle key={k} cx={Math.cos(a) * 54} cy={HEAD.y + Math.sin(a) * 54} r={24} fill={L.hair} />;
          })
        : null}
    </g>
  );

  const actorBody = (
    <g transform={`translate(0 ${LEG_LEN + (pose.hipY ?? 0)}) scale(${1 + 0.6 * pose.squash} ${1 - pose.squash}) translate(0 ${-LEG_LEN})`}>
      {pose.yaw < 0 ? <>{limb(j.legR, 12, false)}{shoe(j.legR)}{limb(j.legL, 12, false)}{shoe(j.legL)}</> : <>{limb(j.legL, 12, false)}{shoe(j.legL)}{limb(j.legR, 12, false)}{shoe(j.legR)}</>}
      {pose.yaw < 0 ? <>{limb(j.armR, 11, true)}{hand(j.armR, -1, pose.handR)}</> : <>{limb(j.armL, 11, true)}{hand(j.armL, 1, pose.handL)}</>}
      {torso}
      {pose.yaw < 0 ? <>{limb(j.armL, 11, true)}{hand(j.armL, 1, pose.handL)}</> : <>{limb(j.armR, 11, true)}{hand(j.armR, -1, pose.handR)}</>}
      {L.extra === 'hood' ? (
        <g transform={`rotate(${pose.tilt}) rotate(${pose.headTilt * 0.5} 0 ${HEAD.y + 40})`}>
          <path d={`M -70 ${HEAD.y + 14} Q -80 ${HEAD.y - 74} 0 ${HEAD.y - 80} Q 80 ${HEAD.y - 74} 70 ${HEAD.y + 14} Q 52 -100 0 -106 Q -52 -100 -70 ${HEAD.y + 14} Z`} fill={L.jacket} stroke={L.line} strokeWidth={4} />
          {enhanced ? (
            <>
              <path d={`M -62 ${HEAD.y + 8} Q -68 ${HEAD.y - 62} 0 ${HEAD.y - 68} Q 68 ${HEAD.y - 62} 62 ${HEAD.y + 8} Z`} fill="#090810" opacity={0.55} />
              <path d={`M -54 ${HEAD.y - 54} Q 0 ${HEAD.y - 72} 54 ${HEAD.y - 54}`} stroke={L.jacketShade} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.65} />
            </>
          ) : null}
          {(() => {
            const sw = pose.sway * 0.7 - pose.tilt * 0.6;
            return (
              <g>
                <path d={`M -12 -108 Q ${-14 + sw * 0.3} -88 ${-16 + sw} -66 M 12 -108 Q ${14 + sw * 0.3} -88 ${16 + sw} -66`} stroke={L.accent} strokeWidth={5} strokeLinecap="round" fill="none" />
                <circle cx={-16 + sw} cy={-64} r={5} fill={L.accent} />
                <circle cx={16 + sw} cy={-64} r={5} fill={L.accent} />
              </g>
            );
          })()}
        </g>
      ) : null}
      {L.extra === 'curls' ? (
        <g transform={`rotate(${pose.tilt})`}>
          <path d="M -46 -110 Q 0 -86 46 -110" stroke="#E06A5A" strokeWidth={8} fill="none" strokeLinecap="round" />
          <rect x={-60} y={-126} width={20} height={32} rx={8} fill="#E06A5A" stroke={L.line} strokeWidth={4} />
          <rect x={40} y={-126} width={20} height={32} rx={8} fill="#E06A5A" stroke={L.line} strokeWidth={4} />
        </g>
      ) : null}
      {head}
    </g>
  );

  return (
    <g>
      {shadow > 0 ? (
        <ellipse
          cx={pose.x + lightSide * -14 * pose.scale}
          cy={pose.y + LEG_LEN * pose.scale + 10}
          rx={72 * pose.scale}
          ry={13 * pose.scale}
          fill="#000"
          opacity={0.3 * shadow}
        />
      ) : null}
      {pose.motionEcho && (Math.abs(pose.motionEcho.dx) > 0.5 || Math.abs(pose.motionEcho.dy) > 0.5) ? (
        <g
          opacity={pose.motionEcho.opacity ?? 0.22}
          transform={`translate(${pose.x + pose.motionEcho.dx} ${pose.y + pose.motionEcho.dy}) scale(${pose.scale}) rotate(${pose.spin} 0 -90)`}
        >
          {actorBody}
        </g>
      ) : null}
      <g transform={`translate(${pose.x} ${pose.y}) scale(${pose.scale}) rotate(${pose.spin} 0 -90)`} filter={rimId ? `url(#${rimId})` : undefined}>
        {actorBody}
      </g>
    </g>
  );
};

export const Actor = Hero;

/**
 * Reusable Horror Predator Silhouette Rig ("ShadowEntity"):
 * Tall dark void silhouette with hunched shoulders, glowing pale eyes with pinpoint pupils,
 * breathing shadow mist aura, and articulated claw-like fingers gripping a doorframe.
 */
export const ShadowEntity: React.FC<{
  x: number;
  y: number;
  scale?: number;
  t?: number;
  presence?: number; // 0..1 visibility
  lunge?: number; // 0..1 surge forward into camera
  gripDoorX?: number;
  gripDoorY?: number;
  headTiltDeg?: number;
  crimsonEyes?: number; // 0..1 terrifying crimson-silver rim glow during twist climax
}> = ({ x, y, scale = 1, t = 0, presence = 1, lunge = 0, gripDoorX, gripDoorY, headTiltDeg = -9, crimsonEyes = 0 }) => {
  if (presence <= 0.01) return null;
  const breath = Math.sin(t * 0.12) * 3.8;
  const pulse = 0.85 + 0.15 * Math.sin(t * 0.28);
  const s = scale * (1 + lunge * 0.38);
  const eyeScaleX = 1 + lunge * 0.38;
  const eyeScaleY = 1 + lunge * 0.72;
  const eyeFill = crimsonEyes > 0.25 ? '#FFE5E5' : '#EAE3D2';
  const eyeGlow = crimsonEyes > 0.25 ? '#FF3B2F' : '#8DB4F7';

  const drawEntity = (dx: number, dy: number, alpha: number, scMult = 1) => (
    <g opacity={alpha} transform={`translate(${x - lunge * 6 + dx} ${y - lunge * 12 + dy}) scale(${s * scMult})`}>
      {/* Dark smoky mantle behind figure */}
      <ellipse cx={0} cy={-40} rx={64 + breath} ry={136} fill="#020308" opacity={0.82} />
      {/* Ragged creeping shoulder cloak tendrils */}
      <path
        d={`M -52 114 Q -60 22 -48 -58 Q -22 -96 0 -94 Q 24 -96 48 -58 Q 62 22 50 114 Q 22 98 0 112 Q -22 98 -52 114 Z`}
        fill="#04050B"
        stroke="#111629"
        strokeWidth={2.5}
      />
      {/* Connecting shadowy arm reaching cleanly toward wardrobe edge */}
      {gripDoorX !== undefined && gripDoorY !== undefined ? (
        <path
          d={`M -34 -56 Q ${(gripDoorX - x) / Math.max(0.2, s) * 0.5} ${(gripDoorY - y) / Math.max(0.2, s) - 24} ${(gripDoorX - x) / Math.max(0.2, s)} ${(gripDoorY - y) / Math.max(0.2, s)}`}
          stroke="#05060C"
          strokeWidth={16}
          strokeLinecap="round"
          fill="none"
        />
      ) : null}
      {/* Tilted shadowy skull silhouette */}
      <g transform={`rotate(${headTiltDeg + Math.sin(t * 0.08) * 2.5} 0 -86)`}>
        <ellipse cx={0} cy={-118} rx={31} ry={37} fill="#030409" stroke="#151C32" strokeWidth={2.2} />
        {/* Faint eye halo + staring horror eyes */}
        <g transform={`translate(0 -122) scale(${eyeScaleX} ${eyeScaleY}) translate(0 122)`}>
          <circle cx={-11} cy={-122} r={11} fill={eyeGlow} opacity={0.22 * (0.5 + crimsonEyes)} />
          <circle cx={11} cy={-120} r={11} fill={eyeGlow} opacity={0.22 * (0.5 + crimsonEyes)} />
          <ellipse cx={-11} cy={-122} rx={5.8} ry={4.0} fill={eyeFill} opacity={0.95 * pulse} />
          <ellipse cx={11} cy={-120} rx={5.8} ry={4.0} fill={eyeFill} opacity={0.95 * pulse} />
          <circle cx={-12.5} cy={-122} r={1.6} fill="#04050A" />
          <circle cx={9.5} cy={-120} r={1.6} fill="#04050A" />
        </g>
        {lunge > 0.1 ? (
          <path
            d={`M -12 -98 Q 0 ${-90 + lunge * 15} 12 -98`}
            stroke="#D6CEBE"
            strokeWidth={1.8}
            fill="none"
            opacity={lunge * 0.68}
            strokeLinecap="round"
          />
        ) : null}
      </g>
    </g>
  );

  return (
    <g opacity={Math.min(1, presence)}>
      {lunge > 0.15 ? drawEntity(12, 10, 0.3 * lunge, 0.96) : null}
      {drawEntity(0, 0, 1, 1)}
      {/* Articulated shadowy fingers curling around wooden closet doorframe */}
      {gripDoorX !== undefined && gripDoorY !== undefined ? (
        <g transform={`translate(${gripDoorX} ${gripDoorY})`} opacity={Math.min(1, presence * 1.1)}>
          {[-14, -5, 4, 13].map((dy, fi) => (
            <path
              key={`claw${fi}`}
              d={`M 14 ${dy} Q -3 ${dy - 2} -9 ${dy + 3}`}
              stroke="#05060C"
              strokeWidth={4.8}
              strokeLinecap="round"
              fill="none"
            />
          ))}
          {[-14, -5, 4, 13].map((dy, fi) => (
            <path
              key={`clawRim${fi}`}
              d={`M 4 ${dy - 1} Q -4 ${dy - 2} -9 ${dy + 3}`}
              stroke="#4C608A"
              strokeWidth={1.3}
              strokeLinecap="round"
              fill="none"
              opacity={0.55}
            />
          ))}
        </g>
      ) : null}
    </g>
  );
};

export const walkPose = (
  x: number,
  phase: number,
  ground: number | ((x: number) => number),
  scale = 0.9,
  extra: Partial<Pose> = {},
  facing: 1 | -1 = 1,
): Pose => {
  const s = Math.sin(phase);
  const g = typeof ground === 'number' ? ground : ground(x);
  const bounce = doubleBounce(phase);
  return {
    ...basePose,
    x,
    y: g - LEG_LEN * scale - bounce * 8.5,
    scale,
    facing,
    yaw: facing,
    tilt: 5.5 * facing + Math.sin(phase) * 1.2 * facing,
    headTilt: 2.4 * Math.sin(phase * 2 - 0.5),
    sway: 12 * Math.sin(phase + 0.9),
    squash: (1 - bounce) * 0.035,
    legL: { a: 28 * s, b: -Math.max(0, 42 * Math.sin(phase + 1.2)) },
    legR: { a: -28 * s, b: -Math.max(0, 42 * Math.sin(phase + 1.2 + Math.PI)) },
    armL: { a: -22 * s, b: 14 + 14 * Math.abs(s) },
    armR: { a: 22 * s, b: 14 + 14 * Math.abs(s) },
    ...extra,
  };
};

export const feetBelowHips = (scale: number) => LEG_LEN * scale;

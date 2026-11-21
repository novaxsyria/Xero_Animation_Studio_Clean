import React from 'react';
import {
  ShotProps,
  clamp,
  easeOut,
  easeInOut,
  lerp,
  Hero,
  LOOKS,
  poseAt,
  walkPose,
  faceAt,
  RakanBedroom,
  RakanDuvet,
  rakanBedSit,
  BlueCorridor,
  CorridorClock,
  ArabicTitleCard,
  ArabicWhisper,
  ArabicCallout,
  FocusRings,
  FONT,
} from '../../engine/core';

const cam = (scale: number, x = 960, y = 540, tx = 0, ty = 0) =>
  `translate(${960 + tx} ${540 + ty}) scale(${scale}) translate(${-x} ${-y})`;

// S01: Midnight 03:07 phone, switching off lamp, trying to sleep
export const S01: React.FC<ShotProps> = ({ t, len }) => {
  const push = lerp(1.0, 1.1, easeInOut(clamp(t / len)));
  const lampOff = clamp((t - 135) / 22);
  const sit = rakanBedSit(0.24, 0.09);
  const pose = poseAt(t, [
    { f: 0, p: { x: sit.x, y: sit.y, scale: sit.scale, yaw: 0.35, expr: 'tired', armR: { a: -52, b: -35 }, armL: { a: 15, b: -12 }, look: 0.4 } },
    { f: 115, p: { x: sit.x, y: sit.y, scale: sit.scale, yaw: 0.45, expr: 'tired', armR: { a: -65, b: -20 }, look: 0.6 } },
    { f: 165, p: { x: sit.x - 10, y: sit.y + 18, scale: sit.scale, yaw: 0.15, tilt: -12, headTilt: 14, blink: 1, armR: { a: 18, b: -10 }, expr: 'tired' } },
  ]);

  return (
    <g>
      <g transform={cam(push, 840, 560)}>
        <RakanBedroom t={t} id="s01" duvet={false} lamp={1 - lampOff} phoneGlow={1 - lampOff * 0.4} phoneTime="03:07" veil={0.34 + lampOff * 0.14} />
        <Hero pose={pose} look={LOOKS.rakanSleep} rimId={lampOff > 0.5 ? 'rimBlue' : 'rimR'} />
        <RakanDuvet from={0.14} knees={0.75} />
      </g>
      <ArabicTitleCard t={t - 8} title="هل تعرف إنك تحلم؟" y={135} size={94} />
    </g>
  );
};

// S02: Sudden knock at the bedroom door
export const S02: React.FC<ShotProps> = ({ t }) => {
  const push = lerp(1.04, 1.14, easeOut(clamp(t / 160)));
  const sit = rakanBedSit(0.24, 0.09);
  const knocked = t >= 92;
  const wave = knocked ? clamp((t - 92) / 36) : 0;
  const pose = poseAt(t, [
    { f: 0, p: { x: sit.x - 8, y: sit.y + 14, scale: sit.scale, yaw: 0.1, tilt: -10, blink: 1, expr: 'tired' } },
    { f: 88, p: { x: sit.x - 8, y: sit.y + 14, scale: sit.scale, yaw: 0.1, tilt: -10, blink: 1, expr: 'tired' } },
    { f: 108, p: { x: sit.x, y: sit.y - 4, scale: sit.scale, yaw: -0.65, tilt: 6, blink: 0, look: -0.8, expr: 'shock' } },
  ]);

  return (
    <g transform={cam(push, 620, 540)}>
      <RakanBedroom t={t} id="s02" duvet={false} lamp={0} phoneGlow={0.25} knockWave={wave} veil={0.48} />
      <Hero pose={pose} look={LOOKS.rakanSleep} rimId="rimBlueL" />
      <RakanDuvet from={0.14} knees={0.85} />
    </g>
  );
};

// S03: Extreme close-up of the door vibrating on three sharp knocks
export const S03: React.FC<ShotProps> = ({ t }) => {
  const hit = (f0: number) => (t >= f0 && t < f0 + 14 ? Math.exp(-(t - f0) * 0.25) : 0);
  const h1 = hit(2);
  const h2 = hit(19);
  const h3 = hit(39);
  const jolt = (h1 + h2 + h3) * 9 * Math.sin(t * 2.5);
  const rim = h1 + h2 + h3;

  return (
    <g transform={`translate(${jolt} ${jolt * 0.5})`}>
      <rect width={1920} height={1080} fill="#101324" />
      {/* Door wood panel macro */}
      <rect x={280} y={40} width={1360} height={1000} rx={12} fill="#2B263D" stroke="#12101D" strokeWidth={8} />
      <rect x={420} y={130} width={1080} height={360} rx={8} fill="#231E33" stroke="#3D3656" strokeWidth={5} />
      <rect x={420} y={560} width={1080} height={380} rx={8} fill="#231E33" stroke="#3D3656" strokeWidth={5} />
      {/* Brass Handle & Lock */}
      <g transform="translate(1310 540)">
        <rect x={-38} y={-90} width={76} height={180} rx={18} fill="#8C6E42" stroke="#1E1824" strokeWidth={5} />
        <rect x={-140} y={-16} width={155} height={32} rx={14} fill="#D6AE68" stroke="#1E1824" strokeWidth={5} />
        <circle cx={0} cy={46} r={14} fill="#181422" />
      </g>
      {/* Expanding acoustic rings on each knock */}
      {[
        { h: h1, tt: t - 2, label: '١' },
        { h: h2, tt: t - 19, label: '٢' },
        { h: h3, tt: t - 39, label: '٣' },
      ].map((k, i) =>
        k.tt >= 0 && k.tt < 22 ? (
          <g key={i}>
            <circle cx={960} cy={540} r={80 + k.tt * 28} fill="none" stroke="#FFB85C" strokeWidth={7} opacity={clamp(1 - k.tt / 20)} />
            <circle cx={960} cy={540} r={40 + k.tt * 18} fill="none" stroke="#85C4FF" strokeWidth={4} opacity={clamp(1 - k.tt / 18)} />
          </g>
        ) : null,
      )}
      {rim > 0.05 ? <rect width={1920} height={1080} fill="#FFB85C" opacity={0.08 * rim} /> : null}
    </g>
  );
};

// S04: Rakan opens door onto impossible deep-navy corridor with backward-spinning clock
export const S04: React.FC<ShotProps> = ({ t, len }) => {
  const push = lerp(0.95, 1.15, easeInOut(clamp(t / len)));
  const doorStep = easeOut(clamp(t / 45));
  const pose = poseAt(t, [
    { f: 0, p: { x: 420, y: 740, scale: 1.05, yaw: 0.7, armR: { a: -50, b: -20 }, expr: 'shock' } },
    { f: 80, p: { x: 580, y: 740, scale: 0.92, yaw: 0.5, armR: { a: 12, b: -8 }, expr: 'worried', look: 0.2 } },
    { f: 210, p: { x: 640, y: 730, scale: 0.86, yaw: 0.25, expr: 'worried', headTilt: -5 } },
  ]);

  return (
    <g transform={cam(push, 960, 500)}>
      <BlueCorridor t={t} id="s04c" stretch={0.08} reverseSpeed={-8.5} showMirror />
      {/* Open door frame silhouette in foreground left */}
      <polygon points={`0,0 ${240 - 110 * doorStep},0 ${240 - 110 * doorStep},1080 0,1080`} fill="#0C0D1A" opacity={0.85} />
      <Hero pose={pose} look={LOOKS.rakan} rimId="rimBlue" />
    </g>
  );
};

// S05: Turning back—the bedroom door has vanished into solid blue wall; whisper ripples approach
export const S05: React.FC<ShotProps> = ({ t }) => {
  const vanish = easeOut(clamp((t - 35) / 38));
  const f = faceAt(t, [
    [0, 'worried'],
    [45, 'shock'],
  ]);
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 750, scale: 1.08, yaw: 0.8, expr: 'worried' } },
    { f: 32, p: { x: 960, y: 750, scale: 1.08, yaw: -0.85, armL: { a: -42, b: -30 }, armR: { a: -35, b: -25 } } },
    { f: 150, p: { x: 985, y: 755, scale: 1.1, yaw: -0.7, tilt: 6, armL: { a: -55, b: -40 } } },
  ]);

  return (
    <g transform={cam(lerp(1.0, 1.08, clamp(t / 180)), 960, 520)}>
      {/* Solid deep-navy rear wall */}
      <rect width={1920} height={1080} fill="#0D193D" />
      {[280, 620, 1300, 1640].map((x, i) => (
        <rect key={i} x={x} y={140} width={220} height={740} rx={6} fill="#10214F" stroke="#1E387D" strokeWidth={3} />
      ))}
      <rect x={0} y={880} width={1920} height={200} fill="#0A122E" />

      {/* Ghost outline of bedroom door dissolving completely */}
      {vanish < 1 ? (
        <g opacity={1 - vanish}>
          <rect x={790} y={240} width={340} height={640} fill="#192F6B" stroke="#7EB8FF" strokeWidth={4} strokeDasharray="16 10" />
          <circle cx={1080} cy={560} r={10} fill="#FFB85C" />
        </g>
      ) : null}

      {/* Whisper acoustic waves sweeping from off-screen corridor */}
      {t > 95
        ? [0, 1, 2].map((i) => {
            const r = ((t - 95) * 12 + i * 110) % 520;
            return <circle key={i} cx={1750} cy={460} r={r} fill="none" stroke="#85E0FF" strokeWidth={3} opacity={clamp(1 - r / 520) * 0.45} />;
          })
        : null}

      <Hero pose={{ ...pose, ...f }} look={LOOKS.rakan} rimId="rimBlue" />
    </g>
  );
};

// S06: Extreme close-up — "راكان... أنت مو صاحي."
export const S06: React.FC<ShotProps> = ({ t }) => {
  const push = lerp(2.15, 2.42, easeOut(clamp(t / 80)));
  const shiver = Math.sin(t * 1.8) * 1.8;
  const pose = poseAt(t, [
    { f: 0, p: { x: 960 + shiver, y: 920, scale: 1.0, yaw: 0.1, expr: 'shock', look: -0.2 } },
    { f: 42, p: { x: 960 - shiver, y: 920, scale: 1.0, yaw: -0.05, expr: 'shock', look: 0.15 } },
  ]);

  return (
    <g>
      <rect width={1920} height={1080} fill="#060B1C" />
      <g transform={cam(push, 960, 740)}>
        <Hero pose={pose} shadow={0} look={LOOKS.rakan} rimId="rimBlueL" />
      </g>
      <ArabicWhisper x={960} y={220} t={t - 6} text="«راكان... أنت مو صاحي.»" color="#94E2FF" size={76} />
    </g>
  );
};

// S07: Sprinting down the elongating blue corridor toward clock & mirror
export const S07: React.FC<ShotProps> = ({ t, len }) => {
  const p = clamp(t / len);
  const stretch = easeInOut(p) * 0.95;
  const runnerX = lerp(420, 860, easeOut(p));
  const pose = walkPose(runnerX, t * 0.85, 865, lerp(0.95, 0.72, p), { expr: 'shock', tilt: 16, sway: Math.sin(t * 0.9) * 18 }, 1);

  return (
    <g>
      <BlueCorridor t={t * 1.4} id="s07c" stretch={stretch} reverseSpeed={-12} showMirror />
      {/* Speed lines */}
      {Array.from({ length: 16 }).map((_, i) => {
        const y = 120 + i * 56;
        const xOff = ((t * 46 + i * 190) % 1920);
        return <line key={i} x1={1920 - xOff} y1={y} x2={1920 - xOff + 220} y2={y} stroke="#88CCFF" strokeWidth={2.5} opacity={0.28} />;
      })}
      <Hero pose={pose} look={LOOKS.rakan} rimId="rimBlue" />
    </g>
  );
};

// S08: Mirror reflection shows sleeping Rakan; silent scream
export const S08: React.FC<ShotProps> = ({ t }) => {
  const push = lerp(1.0, 1.15, easeOut(clamp(t / 140)));
  const tremble = t > 65 ? Math.sin(t * 2.4) * 3 : 0;
  const outerPose = poseAt(t, [
    { f: 0, p: { x: 460, y: 810, scale: 1.25, yaw: 0.75, expr: 'shock', armR: { a: -72, b: -15 } } },
    { f: 75, p: { x: 465 + tremble, y: 805, scale: 1.26, yaw: 0.78, expr: 'shock', headTilt: -10, armR: { a: -82, b: -10 } } },
  ]);
  const sleepingPose = poseAt(t, [
    { f: 0, p: { x: 1020, y: 740, scale: 0.9, yaw: 0.2, blink: 1, expr: 'tired', tilt: -6 } },
  ]);

  return (
    <g transform={cam(push, 960, 560)}>
      <rect width={1920} height={1080} fill="#0B1433" />
      <CorridorClock x={960} y={135} r={115} angleMin={-t * 10} angleHour={-t * 1.2 - 90} />
      {/* Ornate Mirror Frame */}
      <rect x={630} y={290} width={660} height={700} rx={18} fill="#14234E" stroke="#C5A368" strokeWidth={12} />
      <defs>
        <clipPath id="s08mir">
          <rect x={646} y={306} width={628} height={668} rx={10} />
        </clipPath>
      </defs>
      {/* Reflection: Rakan fast asleep in bed */}
      <g clipPath="url(#s08mir)">
        <rect x={646} y={306} width={628} height={668} fill="#15182C" />
        <rect x={680} y={660} width={560} height={240} rx={14} fill="#2A3458" />
        <ellipse cx={860} cy={650} rx={110} ry={34} fill="#E6DED0" />
        <g transform="translate(80 40) rotate(-75 1020 740)">
          <Hero pose={sleepingPose} shadow={0} look={LOOKS.rakanSleep} rimId="rimBlue" />
        </g>
        <rect x={760} y={655} width={450} height={210} rx={18} fill="#364675" />
      </g>
      {/* Silent scream collapsed rings */}
      {t > 68
        ? [0, 1].map((i) => {
            const rr = Math.max(8, 120 - ((t - 68) * 3 + i * 40) % 110);
            return <circle key={i} cx={570} cy={590} r={rr} fill="none" stroke="#FF6B78" strokeWidth={3} opacity={0.55} />;
          })
        : null}
      <Hero pose={outerPose} look={LOOKS.rakan} rimId="rimRed" />
    </g>
  );
};

// S09: False Awakening — jolts upright panting in normal moonlit room
export const S09: React.FC<ShotProps> = ({ t }) => {
  const sit = rakanBedSit(0.24, 0.09);
  const heave = Math.sin(t * 0.45) * 3.5 * Math.max(0.25, 1 - t / 220);
  const pose = poseAt(t, [
    { f: 0, p: { x: sit.x, y: sit.y - 14, scale: sit.scale, yaw: 0.1, tilt: 10, expr: 'shock', look: -0.6 } },
    { f: 45, p: { x: sit.x, y: sit.y + heave, scale: sit.scale, yaw: 0.4, tilt: 4, expr: 'worried', look: 0.7 } },
    { f: 130, p: { x: sit.x, y: sit.y + heave * 0.5, scale: sit.scale, yaw: -0.35, tilt: 0, expr: 'worried', look: -0.5 } },
    { f: 210, p: { x: sit.x, y: sit.y, scale: sit.scale, yaw: 0.25, expr: 'neutral', look: 0.4 } },
  ]);

  return (
    <g transform={cam(lerp(1.12, 1.0, easeOut(clamp(t / 80))), 820, 560)}>
      <RakanBedroom t={t} id="s09" duvet={false} lamp={0} phoneGlow={0.85} phoneTime="03:07" veil={0.44} />
      <Hero pose={pose} look={LOOKS.rakanSleep} rimId="rimBlue" />
      <RakanDuvet from={0.14} knees={0.9} />
    </g>
  );
};

// S10: Picking up phone — 03:07 exact same time, relieved smile
export const S10: React.FC<ShotProps> = ({ t }) => {
  const push = lerp(1.0, 1.07, easeOut(clamp(t / 115)));
  const pose = poseAt(t, [
    { f: 0, p: { x: 1280, y: 800, scale: 1.45, yaw: -0.4, expr: 'neutral', armL: { a: -50, b: -32 }, look: -0.5 } },
    { f: 70, p: { x: 1280, y: 795, scale: 1.45, yaw: -0.3, expr: 'happy', armL: { a: -42, b: -24 }, look: -0.3 } },
  ]);

  return (
    <g transform={cam(push, 960, 540)}>
      <rect width={1920} height={1080} fill="#101529" />
      <circle cx={680} cy={560} r={420} fill="#467BFF" opacity={0.16} />
      {/* Detailed Smartphone Insert */}
      <g transform="translate(650 560) rotate(-6)">
        <rect x={-165} y={-290} width={330} height={580} rx={36} fill="#181D30" stroke="#4D5B85" strokeWidth={8} />
        <rect x={-145} y={-260} width={290} height={520} rx={24} fill="#0D1630" />
        <text x={0} y={-40} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={92} fill="#DCEBFF">
          03:07
        </text>
        <text x={0} y={24} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontSize={26} fill="#88B4EB">
          بعد منتصف الليل
        </text>
      </g>
      <Hero pose={pose} shadow={0} look={LOOKS.rakanSleep} rimId="rimBlueL" />
    </g>
  );
};

// S11: Macro 6-finger discovery & the chilling question
export const S11: React.FC<ShotProps> = ({ t }) => {
  const spread = easeOut(clamp((t - 18) / 40));
  const push = lerp(1.0, 1.12, easeOut(clamp(t / 220)));
  const count = Math.min(6, Math.max(1, Math.floor((t - 24) / 14) + 1));
  const fingers = [
    { x: -135, y: 20, rot: -44, len: 130, w: 34 }, // thumb
    { x: -72, y: -115, rot: -16, len: 175, w: 30 },
    { x: -24, y: -135, rot: -5, len: 192, w: 30 },
    { x: 24, y: -135, rot: 5, len: 188, w: 30 },
    { x: 70, y: -115, rot: 16, len: 168, w: 29 },
    { x: 114, y: -78, rot: 30, len: 136, w: 27 }, // 6th finger!
  ];

  return (
    <g>
      <rect width={1920} height={1080} fill="#0A0F22" />
      <circle cx={960} cy={560} r={460} fill="#6CAEFF" opacity={0.14} />
      <g transform={cam(push, 960, 560)}>
        {/* Moonlight Rakan Hand Macro (6 distinct fingers) */}
        <g transform="translate(960 630)">
          <rect x={-74} y={85} width={148} height={360} rx={22} fill="#323A5C" stroke="#111322" strokeWidth={8} />
          <ellipse cx={0} cy={20} rx={115} ry={125} fill="#F4E5D2" stroke="#111322" strokeWidth={8} />
          {fingers.map((fg, i) => {
            const isSixth = i === 5;
            const ang = fg.rot * spread;
            return (
              <g key={i} transform={`translate(${fg.x} ${fg.y}) rotate(${ang})`}>
                <rect
                  x={-fg.w / 2}
                  y={-fg.len}
                  width={fg.w}
                  height={fg.len + 26}
                  rx={fg.w / 2}
                  fill={isSixth && t > 52 ? '#FFE5D2' : '#F4E5D2'}
                  stroke={isSixth && t > 52 ? '#FF6B78' : '#111322'}
                  strokeWidth={isSixth && t > 52 ? 7 : 6}
                />
                {t > 24 && i < count ? (
                  <g transform={`translate(0 ${-fg.len - 34})`}>
                    <circle r={20} fill={isSixth ? '#FF5964' : '#141B36'} stroke="#9CE0FF" strokeWidth={2.5} />
                    <text y={8} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={24} fill="#FFFFFF">
                      {i + 1}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </g>
      </g>
      <FocusRings x={1150} y={405} t={t - 82} r0={40} color="#FF7582" />
      <ArabicWhisper x={960} y={165} t={t - 115} text="«طيب... وش يضمن لي إني صحيت فعلًا؟»" color="#FFE2A8" size={62} />
      <ArabicCallout x={960} y={975} t={t - 70} text="٦ أصابع" sub="REALITY CHECK ANOMALY" color="#FF8C94" size={42} />
    </g>
  );
};

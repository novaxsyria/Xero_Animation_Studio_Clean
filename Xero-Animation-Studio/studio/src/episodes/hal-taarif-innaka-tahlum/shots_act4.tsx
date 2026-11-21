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
  rakanBedSit,
  RakanBedroom,
  RakanDuvet,
  MusicRoom,
  CloudCity,
  SkyFish,
  BlueprintGrid,
  EEGWave,
  ArabicCallout,
  ArabicWhisper,
  FocusRings,
  Gauge,
  Sparkle,
  Glow,
  FONT,
} from '../../engine/core';

const cam = (scale: number, x = 960, y = 540, tx = 0, ty = 0) =>
  `translate(${960 + tx} ${540 + ty}) scale(${scale}) translate(${-x} ${-y})`;

// S41: Standing in empty misty room challenging the dream: "Show me a place I've never seen"
export const S41: React.FC<ShotProps> = ({ t, len }) => {
  const push = lerp(0.98, 1.18, easeInOut(clamp(t / len)));
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 775, scale: 1.05, yaw: 0, expr: 'cool', armL: { a: -20, b: -15 }, armR: { a: 20, b: 15 } } },
    { f: 70, p: { x: 960, y: 765, scale: 1.08, yaw: 0, expr: 'cool', armL: { a: -82, b: -12 }, armR: { a: 82, b: 12 }, headTilt: -8 } },
  ]);

  return (
    <g transform={cam(push, 960, 560)}>
      <MusicRoom t={t} id="s41" mist={0.94} veil={0.45} />
      {t > 90 ? (
        <FocusRings x={960} y={845} t={(t - 90) % 45} r0={45} color="#7AE8FF" />
      ) : null}
      <Hero pose={{ ...pose, glint: clamp((t - 60) / 30), glintColor: '#7AE8FF' }} look={LOOKS.rakan} rimId="rimBlue" />
      <ArabicWhisper x={960} y={200} t={t - 50} text="«إذا هذا حلم... ورّني مكان ما قد شفته بحياتي.»" color="#FFE2A8" size={56} />
    </g>
  );
};

// S42: Ground cracks open; falling into the Cloud City
export const S42: React.FC<ShotProps> = ({ t, len }) => {
  const p = clamp(t / len);
  const drop = easeInOut(clamp((t - 18) / (len - 20)));
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 380, scale: 0.9, tilt: 14, spin: 18, expr: 'shock', armL: { a: -135, b: -15 }, armR: { a: 135, b: 15 } } },
    { f: 65, p: { x: 960, y: 540, scale: 0.85, tilt: -12, spin: 25, expr: 'shock', armL: { a: -145, b: -20 }, armR: { a: 145, b: 20 } } },
  ]);

  return (
    <g>
      <CloudCity t={t + 40} id="s42" tilt={Math.sin(t * 0.1) * 3} />
      {/* Top cracked floor opening edge early in shot */}
      {drop < 0.45 ? (
        <g opacity={1 - drop * 2.2}>
          <path d="M 0 0 L 1920 0 L 1920 260 L 1120 220 L 960 360 L 760 210 L 0 250 Z" fill="#131830" stroke="#7AE8FF" strokeWidth={5} />
        </g>
      ) : null}
      {/* Vertical wind streaks */}
      {Array.from({ length: 14 }).map((_, i) => {
        const vx = 140 + i * 130;
        const vy = 1080 - ((t * 42 + i * 160) % 1200);
        return <line key={i} x1={vx} y1={vy} x2={vx} y2={vy + 200} stroke="#FFFFFF" strokeWidth={3} opacity={0.32} />;
      })}
      <g transform={`translate(0 ${lerp(-180, 120, p)})`}>
        <Hero pose={pose} shadow={0} look={LOOKS.rakan} rimId="rimBlue" />
      </g>
    </g>
  );
};

// S43: Panoramic Cloud City — flying cars and elevated sky-train
export const S43: React.FC<ShotProps> = ({ t, len }) => {
  const panX = lerp(840, 1080, easeInOut(clamp(t / len)));
  const rakanPose = poseAt(t, [
    { f: 0, p: { x: 1120, y: 690, scale: 0.42, yaw: -0.4, expr: 'happy' } },
  ]);

  return (
    <g transform={cam(1.06, panX, 460)}>
      <CloudCity t={t * 1.4} id="s43" />
      <Hero pose={rakanPose} look={LOOKS.rakan} rimId="rimR" />
      <ArabicCallout x={panX} y={140} t={t - 25} text="مدينة معلّقة فوق الغيوم" sub="FLYING TRAFFIC · SKY RAIL" color="#FFE4B0" size={50} />
    </g>
  );
};

// S44: Luminous sky-fish swimming past Rakan — he laughs at dream logic
export const S44: React.FC<ShotProps> = ({ t, len }) => {
  const push = lerp(1.0, 1.1, easeOut(clamp(t / len)));
  const rakanPose = poseAt(t, [
    { f: 0, p: { x: 640, y: 780, scale: 1.05, yaw: 0.55, expr: 'happy', look: 0.4 } },
    { f: 165, p: { x: 640, y: 775, scale: 1.05, yaw: 0.45, expr: 'happy', headTilt: -8, armL: { a: -42, b: -25 } } },
  ]);

  return (
    <g transform={cam(push, 920, 520)}>
      <CloudCity t={t} id="s44" />
      {/* Hero close SkyFish gliding right past Rakan */}
      <SkyFish x={lerp(1680, 420, clamp(t / len))} y={440 + Math.sin(t * 0.08) * 35} scale={2.15} dir={-1} t={t} color="#82F0FF" />
      <Hero pose={rakanPose} look={LOOKS.rakan} rimId="rimBlue" />
      <Sparkle x={920} y={420} t={(t - 40) % 60} s={1.2} />
    </g>
  );
};

// S45: Leaping from tower edge expecting to fly — falling instead until body jolts
export const S45: React.FC<ShotProps> = ({ t, len }) => {
  const p = clamp(t / len);
  const leap = easeOut(clamp(p / 0.35));
  const fall = easeInOut(clamp((p - 0.32) / 0.68));
  const pose = poseAt(t, [
    { f: 0, p: { x: 520, y: 580, scale: 0.95, yaw: 0.7, expr: 'happy', tilt: 18, armL: { a: -110, b: -20 }, armR: { a: 110, b: 20 } } },
    { f: 52, p: { x: 840, y: 420, scale: 0.92, yaw: 0.4, expr: 'happy', tilt: 28, spin: 12 } },
    { f: 105, p: { x: 960, y: 690, scale: 1.02, yaw: 0, expr: 'shock', tilt: -15, spin: -22, armL: { a: -145, b: -10 }, armR: { a: 145, b: 10 } } },
  ]);

  return (
    <g transform={cam(1.05, 960, lerp(440, 620, fall))}>
      <CloudCity t={t + fall * 60} id="s45" tilt={-8 * fall} />
      {/* Tower edge on left */}
      <rect x={160} y={620 - fall * 450} width={380} height={600} fill="#1E2750" stroke="#101530" strokeWidth={4} />
      <Hero pose={pose} shadow={0} look={LOOKS.rakan} rimId="rimRed" />
      {fall > 0.2
        ? Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={220 + i * 140} y1={((t * 48 + i * 95) % 1080)} x2={220 + i * 140} y2={((t * 48 + i * 95) % 1080) + 170} stroke="#FFFFFF" strokeWidth={3} opacity={0.35 * leap} />
          ))
        : null}
    </g>
  );
};

// S46: Hypnic jerk jolt in bed — opens eyes briefly then squeezes them shut
export const S46: React.FC<ShotProps> = ({ t }) => {
  const sit = rakanBedSit(0.24, 0.09);
  const jerk = t < 24 ? Math.sin((t / 24) * Math.PI) * 32 : 0;
  const pose = poseAt(t, [
    { f: 0, p: { x: sit.x, y: sit.y - jerk, scale: sit.scale, yaw: 0.15, tilt: -12, blink: 0, expr: 'shock' } },
    { f: 52, p: { x: sit.x, y: sit.y + 8, scale: sit.scale, yaw: 0.2, tilt: -16, blink: 0.2, expr: 'worried' } },
    { f: 115, p: { x: sit.x - 8, y: sit.y + 14, scale: sit.scale, yaw: 0.1, tilt: -12, blink: 1, expr: 'tired' } },
  ]);

  return (
    <g transform={cam(lerp(1.12, 1.04, easeOut(clamp(t / 120))), 840, 560)}>
      <RakanBedroom t={t} id="s46" duvet={false} lamp={0} phoneGlow={0.35} veil={0.48} />
      <Hero pose={pose} look={LOOKS.rakanSleep} rimId="rimBlue" />
      <RakanDuvet from={0.14} knees={0.85} />
    </g>
  );
};

// S47: Hypnic Jerk scientific blueprint
export const S47: React.FC<ShotProps> = ({ t }) => {
  const sparkT = (t - 20) % 90;
  const twitch = sparkT > 26 && sparkT < 42 ? Math.sin((sparkT - 26) * 0.8) * 14 : 0;
  return (
    <g>
      <BlueprintGrid id="s47bg" />
      {/* Sleeper outline with motor nerve spark descending from brain */}
      <g transform={`translate(960 ${640 - twitch}) rotate(-82)`}>
        <Hero pose={poseAt(t, [{ f: 0, p: { x: 0, y: 0, scale: 1.3, blink: 1, expr: 'tired' } }])} shadow={0} look={LOOKS.rakanSleep} />
      </g>
      <path d="M 790 610 Q 960 560 1160 640" fill="none" stroke="#FFB85C" strokeWidth={5} strokeDasharray="12 8" />
      <FocusRings x={1080} y={620} t={sparkT - 25} r0={24} color="#FFB85C" />
      <ArabicCallout x={960} y={160} t={t - 12} text="النفضة النعاسية" sub="HYPNIC JERK · TRANSITION TO SLEEP" color="#FFE4A8" size={56} />
    </g>
  );
};

// S48: Hypnagogic Experiences — twilight threshold between Wake & Sleep
export const S48: React.FC<ShotProps> = ({ t }) => {
  const pulse = (Math.sin(t * 0.16) + 1) * 0.5;
  return (
    <g>
      <BlueprintGrid id="s48bg" accent="#B882FF" />
      <rect x={760} y={180} width={400} height={720} fill="#7B6BFF" opacity={0.14 + pulse * 0.08} rx={24} />
      <line x1={760} y1={180} x2={760} y2={900} stroke="#FFE2A8" strokeWidth={3} strokeDasharray="10 8" />
      <line x1={1160} y1={180} x2={1160} y2={900} stroke="#7AE8FF" strokeWidth={3} strokeDasharray="10 8" />
      {/* Brief flashing hypnagogic shapes */}
      <Sparkle x={880} y={420} t={(t - 15) % 45} s={1.5} />
      <Sparkle x={1040} y={560} t={(t - 32) % 45} s={1.2} />
      <EEGWave x={320} y={540} w={1280} h={140} t={t} freq={0.05} amp={0.75} color="#B89CFF" />
      <ArabicCallout x={500} y={240} t={t - 10} text="اليقظة" sub="WAKE" color="#FFE2A8" size={40} />
      <ArabicCallout x={1420} y={240} t={t - 10} text="النوم الكامل" sub="SLEEP" color="#7AE8FF" size={40} />
      <ArabicCallout x={960} y={125} t={t - 20} text="التجارب الهيبناغوجية" sub="HYPNAGOGIC EXPERIENCES" color="#E5D4FF" size={48} />
    </g>
  );
};

// S49: Rakan refuses to exit the dream — stands firmly on skyscraper rooftop in wind
export const S49: React.FC<ShotProps> = ({ t, len }) => {
  const push = lerp(0.95, 1.15, easeOut(clamp(t / len)));
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 695, scale: 1.05, yaw: 0.25, sway: Math.sin(t * 0.35) * 28, expr: 'cool', armL: { a: 14, b: -10 }, armR: { a: -14, b: 10 } } },
  ]);

  return (
    <g transform={cam(push, 960, 520)}>
      <CloudCity t={t} id="s49" />
      {/* Skyscraper parapet roof platform */}
      <rect x={680} y={830} width={560} height={320} fill="#182042" stroke="#5378C4" strokeWidth={4} />
      <Hero pose={pose} look={LOOKS.rakan} rimId="rimBlue" />
      {/* Wind streaks */}
      {Array.from({ length: 10 }).map((_, i) => {
        const wx = ((t * 28 + i * 210) % 2100) - 100;
        const wy = 240 + i * 74;
        return <line key={i} x1={wx} y1={wy} x2={wx + 190} y2={wy + 12} stroke="#BDE8FF" strokeWidth={2.5} opacity={0.32} />;
      })}
    </g>
  );
};

// S50: Calmly counting 6 fingers: "أنا أحلم" with quiet certainty and golden eye glint
export const S50: React.FC<ShotProps> = ({ t }) => {
  const phase = t < 160 ? 'hand' : 'face';
  const fingers = [
    { x: -120, y: 20, rot: -42, len: 120, w: 32 },
    { x: -64, y: -110, rot: -15, len: 165, w: 28 },
    { x: -20, y: -128, rot: -4, len: 180, w: 28 },
    { x: 24, y: -128, rot: 5, len: 176, w: 28 },
    { x: 66, y: -108, rot: 16, len: 158, w: 27 },
    { x: 108, y: -74, rot: 28, len: 128, w: 25 },
  ];
  const count = Math.min(6, Math.max(1, Math.floor((t - 20) / 18) + 1));
  const rakanPose = poseAt(t, [
    { f: 160, p: { x: 960, y: 800, scale: 1.55, yaw: 0.1, expr: 'happy', look: 0, sway: Math.sin(t * 0.25) * 14 } },
  ]);

  return (
    <g>
      <CloudCity t={t} id="s50" lucid={phase === 'face' ? clamp((t - 165) / 60) : 0.2} />
      {phase === 'hand' ? (
        <g transform="translate(960 610)">
          <rect x={-66} y={76} width={132} height={320} rx={20} fill="#282C46" stroke="#111322" strokeWidth={7} />
          <ellipse cx={0} cy={18} rx={104} ry={114} fill="#F4E5D2" stroke="#111322" strokeWidth={7} />
          {fingers.map((fg, i) => (
            <g key={i} transform={`translate(${fg.x} ${fg.y}) rotate(${fg.rot})`}>
              <rect x={-fg.w / 2} y={-fg.len} width={fg.w} height={fg.len + 24} rx={fg.w / 2} fill="#F4E5D2" stroke={i === 5 ? '#FFB85C' : '#111322'} strokeWidth={6} />
              {i < count ? (
                <g transform={`translate(0 ${-fg.len - 30})`}>
                  <circle r={19} fill={i === 5 ? '#FFB85C' : '#162145'} stroke="#7AE8FF" strokeWidth={2.5} />
                  <text y={7} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={22} fill={i === 5 ? '#0C1224' : '#FFFFFF'}>
                    {i + 1}
                  </text>
                </g>
              ) : null}
            </g>
          ))}
        </g>
      ) : (
        <Hero pose={{ ...rakanPose, glint: easeOut(clamp((t - 170) / 35)), glintColor: '#FFE27A' }} shadow={0} look={LOOKS.rakan} rimId="rimR" />
      )}
      <ArabicWhisper x={960} y={195} t={t - 168} text="«أنا أحلم.»" color="#FFE28A" size={82} />
    </g>
  );
};

// S51: City towers lock steady, fear vanishes, one step lifts Rakan smoothly into flight
export const S51: React.FC<ShotProps> = ({ t, len }) => {
  const lift = easeInOut(clamp((t - 35) / 140));
  const y = lerp(700, 420, lift);
  const pose = poseAt(t, [
    { f: 0, p: { x: 880, y: 700, scale: 0.95, yaw: 0.4, expr: 'cool' } },
    { f: 45, p: { x: 960, y, scale: 0.92, yaw: 0.25, expr: 'happy', tilt: -6, armL: { a: -24, b: -10 }, armR: { a: 24, b: 10 }, sway: Math.sin(t * 0.25) * 16 } },
  ]);

  return (
    <g transform={cam(lerp(1.04, 1.0, clamp(t / len)), 960, lerp(580, 460, lift))}>
      <CloudCity t={t} id="s51" lucid={1} />
      <rect x={680} y={840} width={380} height={300} fill="#1C2854" stroke="#7AE8FF" strokeWidth={4} />
      <FocusRings x={960} y={840} t={t - 35} r0={50} color="#FFE28A" />
      <Hero pose={{ ...pose, glint: 1, glintColor: '#FFE28A' }} shadow={0} look={LOOKS.rakan} rimId="rimR" />
    </g>
  );
};

// S52: Lucid Dreaming schematic — Awareness vs Control gauges
export const S52: React.FC<ShotProps> = ({ t }) => {
  const aw = easeOut(clamp((t - 20) / 80));
  const ctrl = 0.42 + Math.sin(t * 0.05) * 0.14;
  return (
    <g>
      <BlueprintGrid id="s52bg" accent="#7AE8FF" />
      <circle cx={600} cy={540} r={220} fill="#14234A" stroke="#FFE28A" strokeWidth={4} strokeDasharray="14 8" />
      <Hero pose={poseAt(t, [{ f: 0, p: { x: 600, y: 610 + Math.sin(t * 0.08) * 18, scale: 1.05, expr: 'happy', glint: 1, glintColor: '#FFE28A' } }])} shadow={0} look={LOOKS.rakan} />
      <Gauge x={1020} y={400} w={560} p={aw} label="AWARENESS · الوعي بالحلم" />
      <Gauge x={1020} y={590} w={560} p={ctrl} label="CONTROL · التحكم بالتفاصيل" danger={0.95} />
      <ArabicCallout x={960} y={145} t={t - 15} text="الحلم الواعي · Lucid Dreaming" sub="AWARENESS ≠ FULL CONTROL" color="#FFE4A8" size={54} />
    </g>
  );
};

// S53: Sleep Lab experiment — L-R-L-R eye signals from REM sleep recorded on EOG oscilloscope
export const S53: React.FC<ShotProps> = ({ t }) => {
  const lookSignal = Math.sin(t * 0.22);
  const pulseFrame = t > 90 && t < 360;
  return (
    <g>
      <BlueprintGrid id="s53bg" />
      {/* Left: Sleeping Lucid Dreamer in Lab */}
      <g transform="translate(460 540)">
        <rect x={-260} y={-220} width={520} height={440} rx={18} fill="#0E1733" stroke="#3D60A6" strokeWidth={3} />
        {/* Closed eyes shifting L-R-L-R */}
        {[-85, 85].map((cx, i) => (
          <g key={i} transform={`translate(${cx} -40)`}>
            <ellipse cx={pulseFrame ? lookSignal * 22 : 0} cy={-6} rx={36} ry={16} fill="#7AE8FF" opacity={0.35} />
            <path d="M -56 0 Q 0 24 56 0" fill="none" stroke="#F4E5D2" strokeWidth={7} strokeLinecap="round" />
          </g>
        ))}
        <text y={110} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontWeight={700} fontSize={30} fill="#96D8FF">
          حالم واعٍ في مرحلة REM
        </text>
      </g>

      {/* Signal wire connecting subject to EOG monitor */}
      <path d="M 720 540 L 1060 540" stroke="#7AE8FF" strokeWidth={4} strokeDasharray="12 8" strokeDashoffset={-t * 5} />

      {/* Right: Researcher EOG Monitor */}
      <g transform="translate(1420 540)">
        <rect x={-320} y={-220} width={640} height={440} rx={18} fill="#0B132B" stroke="#7AE8FF" strokeWidth={4} />
        <text y={-155} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={26} fill="#FFE28A">
          EOG · EYE SIGNAL RECORDER
        </text>
        <EEGWave x={-260} y={-20} w={520} h={160} t={t} freq={0.06} amp={pulseFrame ? 1.0 : 0.35} color="#7AE8FF" />
        <text y={160} textAnchor="middle" fontFamily={FONT.ui} fontSize={24} fill="#82F0A8">
          SIGNAL: LEFT - RIGHT - LEFT - RIGHT ✓
        </text>
      </g>
      <ArabicCallout x={960} y={130} t={t - 15} text="التواصل من داخل الحلم عبر حركة العين" sub="VERIFIED SLEEP LAB EXPERIMENTS" color="#9CE8FF" size={48} />
    </g>
  );
};

// S54: Still body asleep below while radiant neural signal ascends toward the waking world
export const S54: React.FC<ShotProps> = ({ t }) => {
  const sit = rakanBedSit(0.24, 0.09);
  return (
    <g>
      <BlueprintGrid id="s54bg" accent="#66B8FF" />
      <g transform="translate(0 180)">
        <Hero pose={poseAt(t, [{ f: 0, p: { x: sit.x + 120, y: sit.y, scale: 1.0, blink: 1, expr: 'tired' } }])} shadow={0} look={LOOKS.rakanSleep} rimId="rimBlue" />
      </g>
      {[0, 1, 2, 3].map((i) => {
        const y = 520 - ((t * 2.5 + i * 90) % 360);
        const r = 45 + ((t * 1.4 + i * 40) % 140);
        return <ellipse key={i} cx={960} cy={y} rx={r} ry={r * 0.28} fill="none" stroke="#FFE28A" strokeWidth={3.5} opacity={clamp((y - 160) / 360)} />;
      })}
      <ArabicCallout x={960} y={140} t={t - 18} text="جسد ساكن... وعقل يرسل إشارة" sub="MIND ACTIVE INSIDE REM" color="#FFE4B0" size={50} />
    </g>
  );
};

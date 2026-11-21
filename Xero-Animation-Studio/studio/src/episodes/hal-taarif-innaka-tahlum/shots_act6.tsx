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
  RakanBedroom,
  RakanDuvet,
  rakanBedSit,
  DawnStreet,
  CloudCity,
  NightSky,
  Stars,
  ArabicTitleCard,
  ArabicCallout,
  ArabicWhisper,
  FocusRings,
  Sparkle,
  Glow,
} from '../../engine/core';

const cam = (scale: number, x = 960, y = 540, tx = 0, ty = 0) =>
  `translate(${960 + tx} ${540 + ty}) scale(${scale}) translate(${-x} ${-y})`;

// S64: Waking up in real dawn light — 06:11 on phone, 5 fingers, genuine relief laugh
export const S64: React.FC<ShotProps> = ({ t }) => {
  const push = lerp(1.06, 1.0, easeOut(clamp(t / 120)));
  const sit = rakanBedSit(0.24, 0.09);
  const pose = poseAt(t, [
    { f: 0, p: { x: sit.x, y: sit.y + 8, scale: sit.scale, yaw: 0.1, blink: 1, expr: 'tired' } },
    { f: 35, p: { x: sit.x, y: sit.y, scale: sit.scale, yaw: 0.3, blink: 0, expr: 'neutral', look: 0.4 } },
    { f: 140, p: { x: sit.x, y: sit.y, scale: sit.scale, yaw: 0.15, expr: 'happy', armL: { a: -65, b: -35 }, handL: 'open', look: -0.3 } },
  ]);

  return (
    <g transform={cam(push, 860, 560)}>
      <RakanBedroom t={t} id="s64" dawn={1} acOn phoneTime="06:11" phoneGlow={0.9} lamp={0} duvet={false} veil={0.14} />
      <Hero pose={pose} look={LOOKS.rakanSleep} rimId="rimR" />
      <RakanDuvet from={0.14} knees={0.85} />
      {t > 140 ? <ArabicCallout x={640} y={320} t={t - 145} text="٥ أصابع · 06:11" sub="REAL DAWN" color="#82F0A8" size={44} /> : null}
    </g>
  );
};

// S65: Pulling curtains wide onto bustling ordinary morning street — wonder at the ordinary
export const S65: React.FC<ShotProps> = ({ t }) => {
  const part = easeOut(clamp((t - 12) / 48));
  const pose = poseAt(t, [
    { f: 0, p: { x: 240, y: 780, scale: 1.08, yaw: 0.75, expr: 'happy', armR: { a: -55, b: -30 } } },
    { f: 70, p: { x: 230, y: 785, scale: 1.06, yaw: 0.68, expr: 'happy', armR: { a: 12, b: -10 }, look: 0.6 } },
  ]);

  return (
    <g>
      <DawnStreet t={t} id="s65" />
      {/* Opening Bedroom Curtains Foreground Frame */}
      <rect x={0} y={0} width={Math.max(40, 960 * (1 - part))} height={1080} fill="#1E2036" opacity={0.94} />
      <rect x={1920 - Math.max(40, 960 * (1 - part))} y={0} width={Math.max(40, 960 * (1 - part))} height={1080} fill="#1E2036" opacity={0.94} />
      <Hero pose={pose} look={LOOKS.rakanSleep} rimId="rimR" />
      <ArabicWhisper x={960} y={135} t={t - 90} text="«لأول مره، حس إن العادي نفسه شيء عجيب.»" color="#FFF4DC" size={50} />
    </g>
  );
};

// S66: Calling Father in the morning — warm split conversation
export const S66: React.FC<ShotProps> = ({ t }) => {
  const rakanPose = poseAt(t, [
    { f: 0, p: { x: 480, y: 770, scale: 1.2, yaw: 0.45, expr: 'happy', armR: { a: -65, b: -85 } } },
  ]);
  const fatherPose = poseAt(t, [
    { f: 0, p: { x: 1440, y: 770, scale: 1.2, yaw: -0.45, facing: -1, expr: 'shock', armL: { a: -62, b: -82 } } },
    { f: 115, p: { x: 1440, y: 770, scale: 1.2, yaw: -0.45, facing: -1, expr: 'happy', armL: { a: -62, b: -82 } } },
  ]);

  return (
    <g>
      {/* Left: Rakan in dawn room */}
      <rect x={0} y={0} width={960} height={1080} fill="#212C4A" />
      <Glow x={480} y={480} r={420} kind="warm" o={0.32} />
      <Hero pose={rakanPose} look={LOOKS.rakanSleep} rimId="rimR" />
      <ArabicWhisper x={480} y={200} t={t - 150} text="«بس ودي أشوفك اليوم.»" color="#FFE4B0" size={50} />

      {/* Right: Father in warm sunlit home */}
      <rect x={960} y={0} width={960} height={1080} fill="#362A30" />
      <Glow x={1440} y={480} r={420} kind="warm" o={0.38} />
      <Hero pose={fatherPose} look={LOOKS.father} rimId="rimR" />
      <ArabicWhisper x={1440} y={200} t={t - 50} text="«خير يا ولدي؟ وش مصحيك بدري؟»" color="#BCE6FF" size={46} />

      <line x1={960} y1={0} x2={960} y2={1080} stroke="#FFE2A8" strokeWidth={5} opacity={0.85} />
    </g>
  );
};

// S67: Normal bedroom door — then panning onto the mirror sticky note "إذا حلمت الليله... حاول تتذكر."
export const S67: React.FC<ShotProps> = ({ t, len }) => {
  const p = clamp(t / len);
  const pan = easeInOut(clamp((p - 0.35) / 0.5));
  const camX = lerp(740, 1280, pan);
  const scale = lerp(1.02, 1.55, pan);

  return (
    <g transform={cam(scale, camX, 460)}>
      <RakanBedroom t={t} id="s67" dawn={1} acOn stickyNote phoneTime="06:11" veil={0.14} />
      <Hero pose={poseAt(t, [{ f: 0, p: { x: 820, y: 740, scale: 0.92, yaw: 0.25, expr: 'neutral', look: 0.4 } }])} look={LOOKS.rakanSleep} rimId="rimR" />
      {pan > 0.7 ? <FocusRings x={1470} y={415} t={t - 180} r0={26} color="#FFE27A" /> : null}
      {pan > 0.75 ? <ArabicCallout x={1280} y={250} t={t - 195} text="«إذا حلمت الليله... حاول تتذكر.»" color="#FFE89C" size={44} /> : null}
    </g>
  );
};

// S68: Viewer engagement question against starry twilight dream sky
export const S68: React.FC<ShotProps> = ({ t }) => (
  <g>
    <NightSky id="s68sky" horizonY={860} />
    <CloudCity t={t} id="s68city" lucid={0.75} />
    <Stars seed={22} x0={0} y0={0} w={1920} h={620} t={t} n={56} />
    <rect width={1920} height={1080} fill="#080B1A" opacity={0.48} />
    <Sparkle x={460} y={320} t={t % 40} s={1.2} />
    <Sparkle x={1460} y={380} t={(t + 20) % 40} s={1.2} />
    <ArabicTitleCard t={t - 12} kicker="وهنا السؤال لك أنت" title="اكتب أغرب حلم تتذكره بالتعليقات" y={340} size={74} color="#FFE28A" />
  </g>
);

// S69: Overhead bedside dream journal & pen with miniature luminous worlds rising from open pages
export const S69: React.FC<ShotProps> = ({ t, len }) => {
  const zoom = lerp(1.0, 1.14, easeOut(clamp(t / len)));
  return (
    <g transform={cam(zoom, 960, 540)}>
      <rect width={1920} height={1080} fill="#1B1521" />
      <Glow x={420} y={280} r={540} kind="warm" o={0.42} />
      {/* Bedside tabletop wood grain */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={0} y1={180 + i * 210} x2={1920} y2={180 + i * 210} stroke="#2B2133" strokeWidth={4} />
      ))}

      {/* Open Dream Journal */}
      <g transform="translate(960 590) rotate(-4)">
        <rect x={-370} y={-230} width={740} height={460} rx={16} fill="#36283D" stroke="#120E18" strokeWidth={8} />
        <rect x={-350} y={-212} width={346} height={424} rx={8} fill="#F5ECD8" />
        <rect x={4} y={-212} width={346} height={424} rx={8} fill="#F9F2E4" />
        <line x1={0} y1={-212} x2={0} y2={212} stroke="#BFB49E" strokeWidth={4} />
        {Array.from({ length: 8 }).map((_, li) => (
          <g key={li} stroke="#C7D3E6" strokeWidth={2}>
            <line x1={-315} y1={-150 + li * 44} x2={-35} y2={-150 + li * 44} />
            <line x1={35} y1={-150 + li * 44} x2={315} y2={-150 + li * 44} />
          </g>
        ))}
        {/* Fountain Pen resting neatly */}
        <g transform="translate(190 95) rotate(28)">
          <rect x={-110} y={-12} width={220} height={24} rx={8} fill="#253459" stroke="#120E18" strokeWidth={3} />
          <polygon points="110,-10 148,0 110,10" fill="#FFE28A" />
        </g>
      </g>

      {/* Miniature glowing dream worlds rising gently off the notebook */}
      {[
        { x: 760, r: 42, c: '#7AE8FF', sp: 0.7 },
        { x: 980, r: 54, c: '#FFE28A', sp: 0.55 },
        { x: 1180, r: 36, c: '#FFA9D6', sp: 0.85 },
      ].map((w, i) => {
        const y = 390 - ((t * w.sp + i * 70) % 210);
        return (
          <g key={i} opacity={0.85}>
            <circle cx={w.x} cy={y} r={w.r} fill={w.c} opacity={0.22} />
            <circle cx={w.x} cy={y} r={w.r * 0.58} fill={w.c} opacity={0.75} />
          </g>
        );
      })}
      <ArabicCallout x={960} y={145} t={t - 20} text="دوّن حلمك فور الاستيقاظ" sub="DREAM JOURNAL" color="#FFE4B0" size={48} />
    </g>
  );
};

// S70: Majestic closing shot — starry dawn horizon, Rakan silhouette, and Xero closing quote
export const S70: React.FC<ShotProps> = ({ t, len }) => {
  const pull = lerp(1.08, 0.94, easeOut(clamp(t / len)));
  const fadeOut = clamp((t - (len - 28)) / 26);

  return (
    <g>
      <g transform={cam(pull, 960, 520)}>
        <CloudCity t={t} id="s70" lucid={1} />
        <Hero pose={poseAt(t, [{ f: 0, p: { x: 960, y: 760, scale: 0.78, yaw: 0.15, expr: 'happy', glint: 0.7, glintColor: '#FFE28A' } }])} shadow={0} look={LOOKS.rakan} rimId="rimR" />
      </g>
      <ArabicTitleCard t={t - 10} kicker="هل تعرف إنك تحلم؟" title="إننا نصدّقه، لين نصحى." y={175} size={86} color="#FFE28A" />
      <rect width={1920} height={1080} fill="#05070E" opacity={fadeOut} />
    </g>
  );
};

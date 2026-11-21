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
  CloudCity,
  CorridorClock,
  BlueprintGrid,
  BrainDiagram,
  Study,
  Desk,
  ArabicCallout,
  ArabicWhisper,
  FocusRings,
  Sparkle,
  Glow,
  FONT,
} from '../../engine/core';

const cam = (scale: number, x = 960, y = 540, tx = 0, ty = 0) =>
  `translate(${960 + tx} ${540 + ty}) scale(${scale}) translate(${-x} ${-y})`;

// S55: Hovering Rakan recalls the question and reads tower billboard "العودة"
export const S55: React.FC<ShotProps> = ({ t }) => {
  const push = lerp(1.0, 1.12, easeOut(clamp(t / 220)));
  const pose = poseAt(t, [
    { f: 0, p: { x: 640, y: 640 + Math.sin(t * 0.08) * 14, scale: 1.05, yaw: 0.65, expr: 'neutral', look: 0.5, glint: 1, glintColor: '#7AE8FF' } },
  ]);

  return (
    <g transform={cam(push, 980, 440)}>
      <CloudCity t={t} id="s55" lucid={1} billboardText="العودة" />
      <Hero pose={pose} shadow={0} look={LOOKS.rakan} rimId="rimBlue" />
      <ArabicWhisper x={640} y={240} t={t - 8} text="«وش يضمن لي إني صحيت فعلًا؟»" color="#BCE6FF" size={50} />
    </g>
  );
};

// S56: Turns his face away, looks back — billboard morphs from "العودة" to "البداية"
export const S56: React.FC<ShotProps> = ({ t }) => {
  const flipped = t >= 115;
  const pose = poseAt(t, [
    { f: 0, p: { x: 640, y: 640, scale: 1.06, yaw: 0.65, expr: 'neutral' } },
    { f: 52, p: { x: 640, y: 640, scale: 1.06, yaw: -0.9, facing: -1, expr: 'neutral', look: -0.6 } },
    { f: 112, p: { x: 640, y: 640, scale: 1.06, yaw: 0.55, facing: 1, expr: 'shock', look: 0.6 } },
  ]);

  return (
    <g transform={cam(1.12, 980, 440)}>
      <CloudCity t={t} id="s56" lucid={1} billboardText={flipped ? 'البداية' : 'العودة'} />
      <Hero pose={{ ...pose, glint: 1, glintColor: '#FFE28A' }} shadow={0} look={LOOKS.rakan} rimId="rimBlue" />
      {flipped ? <FocusRings x={1215} y={145} t={t - 115} r0={50} color="#7AE8FF" /> : null}
      <Sparkle x={1215} y={145} t={t - 115} s={1.6} />
    </g>
  );
};

// S57: Scientific nuance on reality checks (hand check & re-reading text aren't guaranteed rules)
export const S57: React.FC<ShotProps> = ({ t }) => (
  <g>
    <BlueprintGrid id="s57bg" />
    {/* Left Card: Hand Check */}
    <g transform="translate(560 520)">
      <rect x={-260} y={-200} width={520} height={400} rx={18} fill="#0F1938" stroke="#7AE8FF" strokeWidth={3} />
      <text y={-120} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontWeight={700} fontSize={36} fill="#FFE2A8">
        اختبار عدّ الأصابع
      </text>
      <circle cx={0} cy={20} r={75} fill="#182A5E" stroke="#7AE8FF" strokeWidth={3} />
      <text y={36} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={44} fill="#F4E5D2">
        5 vs 6
      </text>
      <text y={148} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontSize={26} fill="#9EB3D8">
        عادة انتباه وليست ضماناً مطلقاً
      </text>
    </g>

    {/* Right Card: Text Re-read Check */}
    <g transform="translate(1360 520)">
      <rect x={-260} y={-200} width={520} height={400} rx={18} fill="#0F1938" stroke="#FFB85C" strokeWidth={3} />
      <text y={-120} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontWeight={700} fontSize={36} fill="#FFE2A8">
        إعادة قراءة النص
      </text>
      <rect x={-140} y={-35} width={280} height={95} rx={12} fill="#182A5E" stroke="#FFB85C" strokeWidth={2.5} />
      <text y={26} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontWeight={700} fontSize={36} fill="#7AE8FF">
        {Math.floor(t / 45) % 2 === 0 ? 'العودة' : 'البداية'}
      </text>
      <text y={148} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontSize={26} fill="#9EB3D8">
        لا يوجد قانون يُجبر النص على التغيّر
      </text>
    </g>
    <ArabicCallout x={960} y={135} t={t - 15} text="اختبارات الواقع" sub="REALITY CHECKS ARE NOT INFALLIBLE" color="#FFE4A8" size={50} />
  </g>
);

// S58: Grounded reminder — rely on senses and solid physical reality in everyday life
export const S58: React.FC<ShotProps> = ({ t }) => {
  const push = lerp(0.98, 1.06, easeOut(clamp(t / 260)));
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 740, scale: 1.05, yaw: 0, expr: 'neutral', armL: { a: -25, b: -35 }, armR: { a: 25, b: 35 } } },
    { f: 90, p: { x: 960, y: 740, scale: 1.05, yaw: 0, expr: 'happy', armL: { a: -18, b: -18 }, armR: { a: 18, b: 18 } } },
  ]);

  return (
    <g transform={cam(push, 960, 540)}>
      <Study t={t} id="s58" veil={0.34} />
      <Desk x0={660} x1={1260} y={660} laptop lamp />
      <Hero pose={pose} look={LOOKS.rakan} rimId="rimR" />
      {t > 88 ? <FocusRings x={860} y={660} t={t - 90} r0={20} color="#FFE2A8" /> : null}
    </g>
  );
};

// S59: Rakan floats asking the deeper question — what separates the dream world from waking reality?
export const S59: React.FC<ShotProps> = ({ t }) => {
  const bob = Math.sin(t * 0.06) * 16;
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 630 + bob, scale: 1.05, yaw: 0.1, expr: 'neutral', glint: 1, glintColor: '#7AE8FF' } },
  ]);

  return (
    <g transform={cam(1.04, 960, 520)}>
      <CloudCity t={t} id="s59" lucid={1} />
      <circle cx={960} cy={520} r={340} fill="none" stroke="#7AE8FF" strokeWidth={2.5} strokeDasharray="12 10" opacity={0.45} />
      <circle cx={960} cy={520} r={430} fill="none" stroke="#FFE28A" strokeWidth={2} strokeDasharray="8 14" opacity={0.35} />
      <Hero pose={pose} shadow={0} look={LOOKS.rakan} rimId="rimBlue" />
      <ArabicWhisper x={960} y={160} t={t - 20} text="«وش الفرق بين العالمين؟»" color="#FFE4B0" size={62} />
    </g>
  );
};

// S60: Split Scientific Comparison — Waking (External continuous signals) vs Dream (Internal neural loop)
export const S60: React.FC<ShotProps> = ({ t }) => (
  <g>
    <BlueprintGrid id="s60bg" />
    {/* Left: Wakefulness */}
    <rect x={48} y={190} width={880} height={820} rx={22} fill="#0D1D3B" stroke="#7AE8FF" strokeWidth={3} />
    <BrainDiagram x={488} y={530} scale={0.95} t={t} pfcActive={0.95} visualActive={0.9} />
    {[0, 1, 2, 3].map((i) => {
      const y = 390 + i * 95;
      const offset = (t * 4 + i * 35) % 140;
      return (
        <g key={i}>
          <line x1={120 + offset * 0.4} y1={y} x2={265} y2={y} stroke="#75F0B5" strokeWidth={5} strokeLinecap="round" />
          <polygon points={`265,${y - 10} 285,${y} 265,${y + 10}`} fill="#75F0B5" />
        </g>
      );
    })}
    <ArabicCallout x={488} y={260} t={t - 10} text="اليقظة: تحديث حسي مستمر" sub="CONTINUOUS EXTERNAL SIGNALS" color="#75F0B5" size={40} />

    {/* Right: Dreaming */}
    <rect x={992} y={190} width={880} height={820} rx={22} fill="#171436" stroke="#FFB85C" strokeWidth={3} />
    <BrainDiagram x={1432} y={530} scale={0.95} t={t} pfcActive={0.22} visualActive={1.0} />
    <circle cx={1432} cy={520} r={240} fill="none" stroke="#FFB85C" strokeWidth={4} strokeDasharray="18 10" strokeDashoffset={-t * 3} opacity={0.65} />
    <ArabicCallout x={1432} y={260} t={t - 25} text="الحلم: نشاط داخلي ذاتي" sub="INTERNAL GENERATION (+ FAINT BLEED-IN)" color="#FFB85C" size={40} />
  </g>
);

// S61: Reality is not a dream, nor raw camera feed — brain constructs an experience from signals
export const S61: React.FC<ShotProps> = ({ t }) => (
  <g>
    <BlueprintGrid id="s61bg" />
    {/* Left: Camera Lens icon (crossed subtly: NOT raw photo) */}
    <g transform="translate(460 540)">
      <circle r={130} fill="#141F40" stroke="#7AE8FF" strokeWidth={4} />
      <circle r={74} fill="#0A1024" stroke="#85B8FF" strokeWidth={3} />
      <line x1={-110} y1={-110} x2={110} y2={110} stroke="#FF6B78" strokeWidth={8} opacity={0.75} />
      <text y={185} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontSize={32} fill="#9EB3D8">
        ليس تصويراً خاماً
      </text>
    </g>

    <path d="M 640 540 L 820 540" stroke="#FFE28A" strokeWidth={5} strokeDasharray="10 8" />

    {/* Right: Brain actively building a perceptual model */}
    <g transform="translate(1280 520)">
      <BrainDiagram x={0} y={0} scale={1.15} t={t} pfcActive={0.9} visualActive={0.95} />
      <text y={230} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontWeight={700} fontSize={36} fill="#FFE4B0">
        تجربة يصنعها الدماغ من الإشارات
      </text>
    </g>
  </g>
);

// S62: Colossal Sky Clock manifests ahead; hands tick forward 03:07 -> 03:08 -> 03:09
export const S62: React.FC<ShotProps> = ({ t }) => {
  const mat = easeOut(clamp(t / 70));
  const tickStep = t < 95 ? 7 : t < 148 ? 8 : t < 202 ? 9 : 9;
  const minAngle = tickStep * 6;
  const hourAngle = 3 * 30 + tickStep * 0.5;
  const label = `03:0${tickStep}`;
  const rakanPose = poseAt(t, [
    { f: 0, p: { x: 520, y: 690, scale: 0.92, yaw: 0.7, expr: 'shock', glint: 1, glintColor: '#FFE28A' } },
  ]);

  return (
    <g transform={cam(lerp(0.98, 1.08, clamp(t / 260)), 960, 500)}>
      <CloudCity t={t} id="s62" lucid={1} />
      <g opacity={mat}>
        <Glow x={1220} y={420} r={340} kind="warm" o={0.45} />
        <CorridorClock x={1220} y={420} r={240} angleMin={minAngle} angleHour={hourAngle} />
        <text x={1220} y={730} textAnchor="middle" fontFamily={FONT.ui} fontWeight={800} fontSize={72} fill="#FFE28A" stroke="#0C1224" strokeWidth={8} paintOrder="stroke">
          {label}
        </text>
      </g>
      <Hero pose={rakanPose} shadow={0} look={LOOKS.rakan} rimId="rimR" />
      <FocusRings x={1220} y={420} t={(t - 95) % 54} r0={230} color="#FFE28A" />
    </g>
  );
};

// S63: Father's voice "يا راكان... لا تأجل كل شيء لبعدين" — Rakan says "أبي أصحى" -> complete blackout
export const S63: React.FC<ShotProps> = ({ t, len }) => {
  const push = lerp(1.0, 1.25, easeInOut(clamp(t / (len - 50))));
  const fadeBlack = clamp((t - (len - 46)) / 36);
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 740, scale: 1.2, yaw: 0, expr: 'worried', blink: 0 } },
    { f: 160, p: { x: 960, y: 745, scale: 1.22, yaw: 0, expr: 'neutral', blink: 1 } },
  ]);

  return (
    <g>
      <g transform={cam(push, 960, 520)}>
        <CloudCity t={t} id="s63" lucid={0.6} />
        {/* Warm horizon silhouette of Father */}
        <g opacity={0.38}>
          <Hero pose={poseAt(t, [{ f: 0, p: { x: 1360, y: 720, scale: 0.9, yaw: -0.4, expr: 'happy' } }])} shadow={0} look={LOOKS.father} rimId="rimR" />
        </g>
        <Hero pose={pose} shadow={0} look={LOOKS.rakan} rimId="rimR" />
      </g>
      <ArabicWhisper x={960} y={190} t={t - 18} text="«يا راكان... لا تأجل كل شيء لبعدين.»" color="#FFE4B0" size={56} />
      {t > 195 ? <ArabicWhisper x={960} y={890} t={t - 195} text="«أبي أصحى.»" color="#FFFFFF" size={64} /> : null}
      <rect width={1920} height={1080} fill="#000000" opacity={fadeBlack} />
    </g>
  );
};

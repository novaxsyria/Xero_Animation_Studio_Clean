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
  BlueprintGrid,
  BrainDiagram,
  EEGWave,
  HypnogramChart,
  BlueCorridor,
  ArabicCallout,
  ArabicWhisper,
  Dial,
  FONT,
} from '../../engine/core';

const cam = (scale: number, x = 960, y = 540) => `translate(960 540) scale(${scale}) translate(${-x} ${-y})`;

// S12: Zoom into Rakan's head into the neural blueprint
export const S12: React.FC<ShotProps> = ({ t }) => {
  const morph = easeInOut(clamp((t - 45) / 70));
  return (
    <g>
      <BlueprintGrid id="s12bg" />
      <g opacity={1 - morph} transform={cam(lerp(1, 1.5, morph), 960, 520)}>
        <Hero pose={poseAt(t, [{ f: 0, p: { x: 960, y: 740, scale: 1.5, yaw: 0.7, blink: 1, expr: 'tired' } }])} shadow={0} look={LOOKS.rakanSleep} rimId="rimBlue" />
      </g>
      <g opacity={morph} transform={cam(lerp(0.75, 1.05, morph), 960, 500)}>
        <BrainDiagram x={960} y={480} scale={1.35} t={t} pfcActive={0.45} visualActive={0.95} />
        <EEGWave x={480} y={810} w={960} h={110} t={t} color="#7AE8FF" />
      </g>
      <ArabicCallout x={960} y={145} t={t - 65} text="داخل عقل الإنسان" sub="NEURAL DREAM ARCHITECTURE" color="#96D4FF" size={56} />
    </g>
  );
};

// S13: Sleep stages & wake-like neural activity
export const S13: React.FC<ShotProps> = ({ t }) => (
  <g>
    <BlueprintGrid id="s13bg" />
    <BrainDiagram x={480} y={420} scale={1.08} t={t} pfcActive={0.35} visualActive={0.98} />
    <HypnogramChart x={880} y={240} t={t} />
    <EEGWave x={880} y={620} w={760} h={130} t={t} freq={0.07} amp={0.9} color="#FFB85C" />
    <ArabicCallout x={1260} y={840} t={t - 20} text="نشاط دماغي قريب من اليقظة" sub="SLEEP CYCLES · N1 / N2 / N3 / REM" color="#FFE2A8" size={44} />
  </g>
);

// S14: Closed eyes projecting stories, faces, and places
export const S14: React.FC<ShotProps> = ({ t }) => {
  const dart = Math.sin(t * 0.42) * 14;
  return (
    <g>
      <BlueprintGrid id="s14bg" accent="#7B6BFF" />
      {/* Closed Eyes Macro */}
      <g transform="translate(960 720)">
        {[-165, 165].map((cx, i) => (
          <g key={i} transform={`translate(${cx} 0)`}>
            <ellipse cx={dart} cy={-8} rx={48} ry={22} fill="#1E2C59" opacity={0.5} />
            <path d="M -95 0 Q 0 38 95 0" fill="none" stroke="#EAE2D2" strokeWidth={10} strokeLinecap="round" />
            <path d="M -85 16 Q 0 46 85 16" fill="none" stroke="#6E82B5" strokeWidth={4} opacity={0.55} />
          </g>
        ))}
      </g>
      {/* Dream Cinema Projection Beams */}
      <polygon points="790,690 420,160 1500,160 1130,690" fill="#7AB8FF" opacity={0.12} />
      <g transform={`translate(${960 + Math.sin(t * 0.05) * 40} 320)`}>
        <rect x={-320} y={-140} width={640} height={260} rx={16} fill="#121D42" stroke="#85CEFF" strokeWidth={3} />
        <path d="M -220 80 L -220 -60 L -140 -60 L -140 80 M -90 80 L -90 -90 L -10 -90 L -10 80 M 40 80 L 40 -40 L 120 -40 L 120 80" fill="#2A4485" />
        <circle cx={210} cy={-40} r={34} fill="#FFE2A8" opacity={0.85} />
      </g>
      <ArabicCallout x={960} y={110} t={t - 15} text="قصص وأماكن بعيون مغلقة" sub="INTERNAL DREAM CINEMA" color="#BCE6FF" size={48} />
    </g>
  );
};

// S15: "I never dream" vs dreams erasing within minutes of waking
export const S15: React.FC<ShotProps> = ({ t }) => {
  const erase = easeInOut(clamp((t - 85) / 140));
  const pose = poseAt(t, [
    { f: 0, p: { x: 560, y: 760, scale: 1.1, yaw: 0.25, expr: 'smug', armL: { a: -50, b: -35 }, armR: { a: 55, b: 35 } } },
    { f: 110, p: { x: 560, y: 760, scale: 1.1, yaw: 0.1, expr: 'neutral', armL: { a: -35, b: -20 }, armR: { a: 45, b: 25 } } },
  ]);

  return (
    <g>
      <BlueprintGrid id="s15bg" />
      <Hero pose={pose} look={LOOKS.commuter} rimId="rimR" />
      <ArabicWhisper x={560} y={240} t={t - 8} text="«أنا ما أحلم أبد!»" color="#FFB85C" size={56} />
      {/* Evaporating dream memory cards */}
      <g opacity={1 - erase * 0.85} transform={`translate(1320 ${460 - erase * 90})`}>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${(i - 1) * 140} ${i * 35}) rotate(${(i - 1) * 8})`}>
            <rect x={-110} y={-75} width={220} height={150} rx={12} fill="#182752" stroke="#7EB8FF" strokeWidth={3} strokeDasharray={erase > 0.2 ? '10 10' : undefined} />
            <circle cx={0} cy={-15} r={24} fill="#FFE2A8" opacity={0.5} />
            <path d="M -60 40 L 0 5 L 60 40" stroke="#7AE8FF" strokeWidth={4} fill="none" />
          </g>
        ))}
      </g>
      <Dial x={1650} y={180} p={1 - erase} readout={`${Math.max(0, Math.round((1 - erase) * 5))}m`} />
      <ArabicCallout x={1320} y={840} t={t - 70} text="تختفي الذكريات بعد دقائق" sub="POST-AWAKENING DREAM AMNESIA" color="#94C8FF" size={42} />
    </g>
  );
};

// S16: Luminous dream globe dissolving as eyes blink open
export const S16: React.FC<ShotProps> = ({ t }) => {
  const pop = easeInOut(clamp((t - 105) / 60));
  return (
    <g>
      <BlueprintGrid id="s16bg" />
      <g transform={`translate(960 470) scale(${1 + pop * 0.22})`} opacity={1 - pop * 0.88}>
        <circle r={240} fill="#15244F" stroke="#7FC8FF" strokeWidth={4} />
        <path d="M -170 60 L -110 -80 L -40 40 L 30 -110 L 110 20 L 170 -30" fill="none" stroke="#FFE2A8" strokeWidth={6} strokeLinejoin="round" />
        <circle cx={-75} cy={-120} r={28} fill="#FFB85C" />
      </g>
      {pop > 0.05
        ? Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const d = 160 + pop * 280;
            return <circle key={i} cx={960 + Math.cos(a) * d} cy={470 + Math.sin(a) * d} r={5} fill="#A8E2FF" opacity={1 - pop} />;
          })
        : null}
      <ArabicCallout x={960} y={880} t={t - 20} text="عالم كامل ينمسح فور الاستيقاظ" sub="MEMORY ERASURE AT DAWN" color="#BCE6FF" size={46} />
    </g>
  );
};

// S17: First Puzzle — wireframe corridor flickering beneath Rakan
export const S17: React.FC<ShotProps> = ({ t }) => {
  const push = lerp(1.0, 1.08, clamp(t / 155));
  const pose = poseAt(t, [
    { f: 0, p: { x: 880, y: 745, scale: 0.95, yaw: 0.5, expr: 'worried', armR: { a: -40, b: -30 } } },
    { f: 80, p: { x: 960, y: 745, scale: 0.95, yaw: -0.3, expr: 'worried', armL: { a: -35, b: -20 } } },
  ]);

  return (
    <g transform={cam(push, 960, 520)}>
      <BlueCorridor t={t} id="s17c" stretch={0.25} reverseSpeed={-5} showMirror={false} veil={0.28} />
      {/* Blueprint wireframe grid overlaid on corridor */}
      <g opacity={0.45 + 0.2 * Math.sin(t * 0.15)}>
        {[0.2, 0.4, 0.6, 0.8].map((k, i) => (
          <line key={i} x1={960} y1={495} x2={k * 1920} y2={1080} stroke="#6CF0FF" strokeWidth={2} strokeDasharray="10 8" />
        ))}
      </g>
      <Hero pose={pose} look={LOOKS.rakan} rimId="rimBlue" />
      <ArabicCallout x={960} y={140} t={t - 12} text="اللغز الأول: لماذا بدا حقيقياً؟" sub="PERCEPTUAL REALISM WITHOUT SENSORY INPUT" color="#FFE2A8" size={48} />
    </g>
  );
};

// S18: Brain builds a convincing simulation decoupled from outside inputs
export const S18: React.FC<ShotProps> = ({ t }) => {
  const build = easeOut(clamp((t - 25) / 90));
  return (
    <g>
      <BlueprintGrid id="s18bg" />
      {/* Disconnected external sensory inputs on left/right */}
      <g opacity={0.35}>
        <line x1={120} y1={520} x2={460} y2={520} stroke="#6E82B0" strokeWidth={5} strokeDasharray="12 12" />
        <line x1={1460} y1={520} x2={1800} y2={520} stroke="#6E82B0" strokeWidth={5} strokeDasharray="12 12" />
        <path d="M 420 490 L 470 550 M 470 490 L 420 550" stroke="#FF5A4A" strokeWidth={8} strokeLinecap="round" />
        <path d="M 1450 490 L 1500 550 M 1500 490 L 1450 550" stroke="#FF5A4A" strokeWidth={8} strokeLinecap="round" />
      </g>
      {/* Internal active brain building 3D-like room wireframe */}
      <BrainDiagram x={960} y={470} scale={1.55} t={t} pfcActive={0.25} visualActive={1.0} />
      <g opacity={build}>
        <rect x={760} y={320} width={400} height={240} fill="none" stroke="#7AE8FF" strokeWidth={3} strokeDasharray="400" strokeDashoffset={400 * (1 - build)} />
        <line x1={620} y1={240} x2={760} y2={320} stroke="#7AE8FF" strokeWidth={2.5} />
        <line x1={1300} y1={240} x2={1160} y2={320} stroke="#7AE8FF" strokeWidth={2.5} />
        <line x1={620} y1={660} x2={760} y2={560} stroke="#7AE8FF" strokeWidth={2.5} />
        <line x1={1300} y1={660} x2={1160} y2={560} stroke="#7AE8FF" strokeWidth={2.5} />
      </g>
      <ArabicCallout x={960} y={890} t={t - 25} text="الدماغ يبني تجربة مقنعة داخلياً" sub="INTERNAL SIMULATION ENGINE" color="#9CE2FF" size={48} />
    </g>
  );
};

// S19: Three impossible dream scenes accepted naturally (flying, passed loved one, extra room)
export const S19: React.FC<ShotProps> = ({ t }) => {
  const bob = Math.sin(t * 0.08) * 14;
  return (
    <g>
      <rect width={1920} height={1080} fill="#0D1226" />
      {/* Three crisp tall dream panels */}
      {[
        { x: 110, title: 'تطير فوق الشارع', color: '#58B4FF' },
        { x: 700, title: 'تقابل شخصاً رحل', color: '#FFB85C' },
        { x: 1290, title: 'غرفة جديدة في بيتك', color: '#B388FF' },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x} 130)`}>
          <rect width={520} height={740} rx={18} fill="#141B38" stroke={p.color} strokeWidth={3.5} />
          <text x={260} y={695} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontWeight={700} fontSize={36} fill="#F6EFE3">
            {p.title}
          </text>
        </g>
      ))}
      {/* Panel 1: Floating over night street */}
      <g transform={`translate(370 ${380 + bob})`}>
        <Hero pose={poseAt(t, [{ f: 0, p: { x: 0, y: 0, scale: 0.72, yaw: 0.6, tilt: 22, expr: 'neutral' } }])} shadow={0} look={LOOKS.rakan} rimId="rimBlue" />
      </g>
      {/* Panel 2: Meeting glowing silhouette */}
      <g opacity={0.85}>
        <Hero pose={poseAt(t, [{ f: 0, p: { x: 870, y: 630, scale: 0.72, yaw: 0.7, expr: 'happy' } }])} shadow={0} look={LOOKS.rakan} rimId="rimR" />
        <g opacity={0.55 + 0.15 * Math.sin(t * 0.1)}>
          <Hero pose={poseAt(t, [{ f: 0, p: { x: 1045, y: 630, scale: 0.74, yaw: -0.7, expr: 'happy' } }])} shadow={0} look={LOOKS.father} rimId="rimR" />
        </g>
      </g>
      {/* Panel 3: Impossible glowing door in home */}
      <g transform="translate(1550 510)">
        <rect x={-95} y={-220} width={190} height={340} rx={6} fill="#251A4A" stroke="#C59EFF" strokeWidth={5} />
        <rect x={-70} y={-195} width={140} height={290} fill="#462F8A" opacity={0.75} />
        <Hero pose={poseAt(t, [{ f: 0, p: { x: -115, y: 120, scale: 0.68, yaw: 0.5, expr: 'neutral' } }])} shadow={0} look={LOOKS.rakan} rimId="rimBlue" />
      </g>
      <ArabicCallout x={960} y={965} t={t - 20} text="ومع ذلك... لا تستغرب!" color="#FFE2A8" size={46} />
    </g>
  );
};

// S20: Prefrontal Cortex dims while REM visual centers flare
export const S20: React.FC<ShotProps> = ({ t }) => {
  const dim = easeOut(clamp(t / 70));
  return (
    <g>
      <BlueprintGrid id="s20bg" />
      <BrainDiagram x={720} y={500} scale={1.45} t={t} pfcActive={0.85 - dim * 0.72} visualActive={0.5 + dim * 0.5} />
      <ArabicCallout x={1440} y={320} t={t - 15} text="التفكير النقدي ومراقبة الذات" sub="PREFRONTAL CORTEX MODULATED" color="#8AA4D6" size={42} />
      <ArabicCallout x={1440} y={520} t={t - 55} text="مرحلة حركة العين السريعة" sub="REM SLEEP · HIGH VISUAL ACTIVITY" color="#FFB85C" size={46} />
      <EEGWave x={1120} y={690} w={640} h={120} t={t} freq={0.085} amp={0.95} color="#FFB85C" />
    </g>
  );
};

// S21: Not just an ON/OFF switch — complex dials returning to Rakan
export const S21: React.FC<ShotProps> = ({ t }) => {
  const p = clamp(t / 250);
  return (
    <g>
      <BlueprintGrid id="s21bg" />
      {/* Left: Crossed-out simple binary switch */}
      <g transform="translate(480 480)">
        <rect x={-130} y={-90} width={260} height={180} rx={22} fill="#141D3B" stroke="#536CA3" strokeWidth={4} />
        <text x={0} y={-20} textAnchor="middle" fontFamily={FONT.ui} fontSize={36} fill="#9FB5E0">ON / OFF</text>
        <path d="M -95 -60 L 95 60 M 95 -60 L -95 60" stroke="#FF5A4A" strokeWidth={12} strokeLinecap="round" />
      </g>
      {/* Right: Multi-dial neuro modulation */}
      <Dial x={1150} y={440} p={0.35 + 0.3 * Math.sin(t * 0.05)} readout="PFC" r={100} />
      <Dial x={1420} y={440} p={0.78 + 0.18 * Math.cos(t * 0.06)} readout="REM" r={100} />
      <Dial x={1285} y={690} p={0.6 + 0.25 * Math.sin(t * 0.04)} readout="MEM" r={100} />
      <ArabicCallout x={960} y={145} t={t - 15} text="أعقد من مجرد زر منطفئ" sub="DYNAMIC NEURAL BALANCE" color="#96D4FF" size={48} />
      {p > 0.78 ? <rect width={1920} height={1080} fill="#090D1A" opacity={(p - 0.78) / 0.22} /> : null}
    </g>
  );
};

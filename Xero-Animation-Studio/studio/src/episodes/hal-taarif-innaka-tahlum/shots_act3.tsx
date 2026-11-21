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
  RakanBedroom,
  ElementarySchool,
  Stairwell,
  Banister,
  stepTop,
  MusicRoom,
  Oud,
  Study,
  Desk,
  BlueprintGrid,
  BrainDiagram,
  TetrisCascade,
  EEGWave,
  ArabicCallout,
  ArabicWhisper,
  FocusRings,
  Sparkle,
  Stars,
  Glow,
  FONT,
} from '../../engine/core';

const cam = (scale: number, x = 960, y = 540, tx = 0, ty = 0) =>
  `translate(${960 + tx} ${540 + ty}) scale(${scale}) translate(${-x} ${-y})`;

// S22: Rakan looks at his 6 fingers, hears second door knock, stands firm
export const S22: React.FC<ShotProps> = ({ t }) => {
  const wave = t >= 52 ? clamp((t - 52) / 36) : 0;
  const pose = poseAt(t, [
    { f: 0, p: { x: 820, y: 740, scale: 1.05, yaw: 0.25, handL: 'six', armL: { a: -58, b: -36 }, expr: 'worried', look: -0.4 } },
    { f: 52, p: { x: 820, y: 740, scale: 1.05, yaw: -0.45, handL: 'six', armL: { a: -20, b: -15 }, expr: 'cool', look: -0.7 } },
    { f: 130, p: { x: 780, y: 740, scale: 1.06, yaw: -0.75, handL: 'open', expr: 'cool', look: -0.8 } },
  ]);

  return (
    <g transform={cam(lerp(1.0, 1.08, clamp(t / 160)), 760, 540)}>
      <RakanBedroom t={t} id="s22" duvet={false} lamp={0} phoneGlow={0.35} knockWave={wave} veil={0.44} />
      <Hero pose={pose} look={LOOKS.rakanSleep} rimId="rimBlueL" />
    </g>
  );
};

// S23: "If I'm dreaming... can I change what happens?" — pointing remotely at the door
export const S23: React.FC<ShotProps> = ({ t }) => {
  const point = easeOut(clamp((t - 32) / 30));
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 760, scale: 1.15, yaw: -0.75, handR: 'point', armR: { a: -30, b: -20 }, expr: 'cool', look: -0.8 } },
    { f: 45, p: { x: 950, y: 760, scale: 1.16, yaw: -0.85, handR: 'point', armR: { a: -86, b: -5 }, expr: 'cool', look: -0.9 } },
  ]);

  return (
    <g transform={cam(lerp(1.04, 1.16, clamp(t / 140)), 760, 520)}>
      <RakanBedroom t={t} id="s23" duvet={false} lamp={0} phoneGlow={0.25} veil={0.42} />
      {/* Telekinetic cyan beam connecting pointing hand to door handle */}
      {point > 0.1 ? (
        <g opacity={point * 0.85}>
          <line x1={770} y1={590} x2={375} y2={620} stroke="#7AE8FF" strokeWidth={5} strokeDasharray="16 10" strokeDashoffset={-t * 6} />
          <Glow x={770} y={590} r={90} kind="cool" o={0.65} />
          <FocusRings x={375} y={620} t={t - 45} r0={20} color="#7AE8FF" />
        </g>
      ) : null}
      <Hero pose={{ ...pose, glint: point, glintColor: '#7AE8FF' }} look={LOOKS.rakanSleep} rimId="rimBlueL" />
      <ArabicWhisper x={1080} y={210} t={t - 6} text="«إذا كنت أحلم... أقدر أغيّر اللي بيصير؟»" color="#96E8FF" size={56} />
    </g>
  );
};

// S24: Macro brass handle turns by itself, door swings open into warm golden light
export const S24: React.FC<ShotProps> = ({ t }) => {
  const turn = easeInOut(clamp((t - 8) / 32));
  const open = easeOut(clamp((t - 42) / 48));

  return (
    <g>
      <rect width={1920} height={1080} fill="#0D1122" />
      {/* Warm golden school threshold pouring through opening */}
      <rect x={300} y={80} width={1320} height={920} fill="#FFE2A8" opacity={0.18 + open * 0.82} />
      <polygon points={`320,80 ${1600 - open * 900},80 ${1600 - open * 900},1000 320,1000`} fill="#FFD485" opacity={open * 0.45} />
      {/* Door leaf pivoting open */}
      <g transform={`translate(320 0) scale(${1 - open * 0.72} 1)`}>
        <rect x={0} y={80} width={1280} height={920} rx={10} fill="#2A243C" stroke="#13101F" strokeWidth={8} />
        <rect x={140} y={160} width={1000} height={340} rx={6} fill="#211C31" stroke="#3D3558" strokeWidth={4} />
        <rect x={140} y={550} width={1000} height={380} rx={6} fill="#211C31" stroke="#3D3558" strokeWidth={4} />
        {/* Brass Handle */}
        <g transform="translate(1080 540)">
          <circle cx={0} cy={0} r={85} fill="#7AE8FF" opacity={0.28 * (1 - open)} />
          <rect x={-32} y={-85} width={64} height={170} rx={16} fill="#8C6E42" stroke="#1B1624" strokeWidth={5} />
          <g transform={`rotate(${-34 * turn} 0 -18)`}>
            <rect x={-135} y={-34} width={150} height={32} rx={14} fill="#E0B66E" stroke="#1B1624" strokeWidth={5} />
          </g>
        </g>
      </g>
      <Sparkle x={1340} y={520} t={t - 10} s={1.4} />
    </g>
  );
};

// S25: Stepping into his warm, sunlit Elementary School hallway
export const S25: React.FC<ShotProps> = ({ t, len }) => {
  const p = clamp(t / len);
  const push = lerp(0.96, 1.12, easeInOut(p));
  const rakanX = lerp(680, 960, easeOut(p));
  const pose = walkPose(rakanX, t * 0.38, 825, lerp(0.95, 0.76, p), { expr: 'happy', look: 0.4, tilt: -3 }, 1);

  return (
    <g transform={cam(push, 960, 500)}>
      <ElementarySchool t={t} id="s25" veil={0.24} />
      <Hero pose={pose} look={LOOKS.rakan} rimId="rimR" />
      <ArabicCallout x={960} y={120} t={t - 24} text="مدرسته الابتدائية" sub="CORRIDOR OF CHILDHOOD MEMORY" color="#FFE4B0" size={48} />
    </g>
  );
};

// S26: Seeing 9-year-old Rakan on the Stairwell holding a sketchbook
export const S26: React.FC<ShotProps> = ({ t, len }) => {
  const p = clamp(t / len);
  const walkX = lerp(1560, 1140, easeOut(clamp(p / 0.7)));
  const walkY = stepTop(walkX) - 65;
  const adultPose = p < 0.7
    ? walkPose(walkX, t * 0.4, walkY + 65, 0.85, { expr: 'neutral' }, -1)
    : poseAt(t, [{ f: 0, p: { x: walkX, y: walkY, scale: 0.85, yaw: -0.75, facing: -1, expr: 'shock', tilt: -5 } }]);

  const boyX = 680;
  const boyY = stepTop(boyX) - 42;
  const boyPose = poseAt(t, [
    { f: 0, p: { x: boyX, y: boyY, scale: 0.68, yaw: 0.5, expr: 'happy', legL: { a: -55, b: 65 }, legR: { a: -42, b: 58 }, armR: { a: -35, b: -40 }, armL: { a: -20, b: -35 } } },
    { f: 140, p: { x: boyX, y: boyY, scale: 0.68, yaw: 0.7, expr: 'happy', headTilt: -10, legL: { a: -55, b: 65 }, legR: { a: -42, b: 58 } } },
  ]);

  return (
    <g transform={cam(lerp(1.0, 1.15, easeInOut(p)), 900, 560)}>
      <Stairwell t={t} id="s26" />
      <Hero pose={boyPose} look={LOOKS.youngRakan} rimId="rimR" />
      {/* Sketchbook on Young Rakan's lap */}
      <g transform={`translate(${boyX + 34} ${boyY - 42}) rotate(-12)`}>
        <rect x={-32} y={-24} width={64} height={46} rx={4} fill="#F5ECD8" stroke="#1E1824" strokeWidth={3} />
        <path d="M -18 8 L 0 -14 L 18 8 Z" fill="#FFB85C" opacity={0.85} />
      </g>
      <Hero pose={adultPose} look={LOOKS.rakan} rimId="rimR" />
      <Banister />
      <FocusRings x={boyX} y={boyY - 80} t={t - 135} r0={40} color="#FFE2A8" />
    </g>
  );
};

// S27: "Do you remember what you wanted to become when you grew up?"
export const S27: React.FC<ShotProps> = ({ t }) => {
  const boyPose = poseAt(t, [
    { f: 0, p: { x: 650, y: 740, scale: 1.05, yaw: 0.72, headTilt: -14, expr: 'happy', armR: { a: -38, b: -28 } } },
  ]);
  const adultPose = poseAt(t, [
    { f: 0, p: { x: 1260, y: 770, scale: 1.25, yaw: -0.75, facing: -1, headTilt: 10, expr: 'worried', look: -0.4 } },
    { f: 95, p: { x: 1260, y: 775, scale: 1.25, yaw: -0.75, facing: -1, headTilt: 16, expr: 'worried', look: -0.2 } },
  ]);

  return (
    <g transform={cam(lerp(1.02, 1.09, clamp(t / 160)), 960, 540)}>
      <Stairwell t={t} id="s27" />
      <Hero pose={boyPose} look={LOOKS.youngRakan} rimId="rimR" />
      {/* Open Sketchbook showing child's stars & rocket drawing */}
      <g transform="translate(760 660) rotate(-8)">
        <rect x={-72} y={-48} width={144} height={96} rx={6} fill="#F8F0DF" stroke="#1E1824" strokeWidth={4} />
        <line x1={0} y1={-48} x2={0} y2={48} stroke="#C9BFA8" strokeWidth={3} />
        <polygon points="-36,-10 -24,-28 -12,-10 -24,18" fill="#E86F52" />
        <circle cx={34} cy={-16} r={10} fill="#F2B33D" />
        <circle cx={44} cy={16} r={6} fill="#6CAEFF" />
      </g>
      <Hero pose={adultPose} look={LOOKS.rakan} rimId="rimR" />
      <ArabicWhisper x={840} y={205} t={t - 8} text="«تتذكر وش كنت تبي تصير لما تكبر؟»" color="#FFE4A8" size={58} />
    </g>
  );
};

// S28: Second Mystery — why dreams weave today's fragments with distant memories
export const S28: React.FC<ShotProps> = ({ t }) => {
  const blend = easeInOut(clamp((t - 40) / 140));
  return (
    <g>
      <BlueprintGrid id="s28bg" />
      {/* Left: Childhood warm memory node; Right: Today's cool daily node */}
      <g transform="translate(460 520)">
        <rect x={-190} y={-130} width={380} height={260} rx={16} fill="#2E221D" stroke="#FFB85C" strokeWidth={4} />
        <text y={-72} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontWeight={700} fontSize={32} fill="#FFE2A8">
          ذكريات قديمة
        </text>
        <polygon points="0,-24 38,34 -38,34" fill="#E8805A" />
        <circle cx={-60} cy={12} r={14} fill="#FFE2A8" />
        <circle cx={65} cy={-8} r={10} fill="#FFE2A8" />
      </g>
      <g transform="translate(1460 520)">
        <rect x={-190} y={-130} width={380} height={260} rx={16} fill="#142347" stroke="#7AE8FF" strokeWidth={4} />
        <text y={-72} textAnchor="middle" direction="rtl" fontFamily={FONT.ar} fontWeight={700} fontSize={32} fill="#9CE8FF">
          أحداث اليوم
        </text>
        <rect x={-75} y={-24} width={150} height={92} rx={12} fill="#25427D" stroke="#7AE8FF" strokeWidth={3} />
        <text y={34} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={36} fill="#E6F4FF">
          03:07
        </text>
      </g>
      {/* Glowing curved synthesis threads meeting at center */}
      <path d="M 650 520 Q 810 380 960 520" fill="none" stroke="#FFB85C" strokeWidth={6} strokeDasharray={420} strokeDashoffset={420 * (1 - blend)} />
      <path d="M 1270 520 Q 1110 660 960 520" fill="none" stroke="#7AE8FF" strokeWidth={6} strokeDasharray={420} strokeDashoffset={420 * (1 - blend)} />
      <circle cx={960} cy={520} r={54 * blend} fill="#D9F0FF" opacity={0.22} />
      <circle cx={960} cy={520} r={24 * blend} fill="#FFE2A8" />
      <ArabicCallout x={960} y={145} t={t - 20} text="اللغز الثاني: مزج الذاكرة" sub="RECENT EXPERIENCE + REMOTE MEMORY" color="#FFE2A8" size={52} />
    </g>
  );
};

// S29: Sleep consolidates memory — but not every scene is a hidden coded message
export const S29: React.FC<ShotProps> = ({ t }) => {
  const dock = easeOut(clamp(t / 120));
  return (
    <g>
      <BlueprintGrid id="s29bg" />
      <BrainDiagram x={480} y={500} scale={1.1} t={t} pfcActive={0.6} visualActive={0.85} />
      {/* Organized neural shelf blocks */}
      <g transform="translate(1240 480)">
        <rect x={-340} y={-220} width={680} height={440} rx={18} fill="#0E1733" stroke="#3D60A6" strokeWidth={3} />
        {[0, 1, 2].map((row) => (
          <g key={row} transform={`translate(-280 ${-130 + row * 120})`}>
            <line x1={0} y1={50} x2={560} y2={50} stroke="#2A447D" strokeWidth={4} />
            {[0, 1, 2, 3].map((col) => {
              const show = dock * 12 > row * 4 + col;
              return show ? (
                <rect
                  key={col}
                  x={col * 140}
                  y={-18}
                  width={116}
                  height={56}
                  rx={8}
                  fill={row === 1 ? '#3B5C9E' : '#263B6B'}
                  stroke="#7AE8FF"
                  strokeWidth={2}
                />
              ) : null;
            })}
          </g>
        ))}
      </g>
      <ArabicCallout x={960} y={130} t={t - 15} text="تثبيت الذكريات وتنظيمها" sub="MEMORY CONSOLIDATION ≠ HIDDEN SYMBOLS" color="#96D8FF" size={48} />
    </g>
  );
};

// S30: Mixing daily game with years-old face in bizarre collage
export const S30: React.FC<ShotProps> = ({ t }) => {
  const merge = easeInOut(clamp((t - 60) / 140));
  const ang = t * 0.04;
  return (
    <g>
      <BlueprintGrid id="s30bg" accent="#B882FF" />
      {/* Orbiting game block & old portrait silhouette */}
      <g transform={`translate(${lerp(560, 960, merge)} ${520 + Math.sin(ang) * 45 * (1 - merge)})`}>
        <rect x={-120} y={-95} width={240} height={190} rx={18} fill="#1E2C59" stroke="#7AE8FF" strokeWidth={4} />
        <rect x={-64} y={-35} width={44} height={44} rx={6} fill="#FFB85C" />
        <rect x={-12} y={-35} width={44} height={44} rx={6} fill="#63D9FF" />
        <rect x={-12} y={16} width={44} height={44} rx={6} fill="#70F0A4" />
      </g>
      <g transform={`translate(${lerp(1360, 960, merge)} ${520 - Math.sin(ang) * 45 * (1 - merge)})`}>
        <rect x={-120} y={-95} width={240} height={190} rx={18} fill="#362445" stroke="#FFAE70" strokeWidth={4} opacity={1 - merge * 0.3} />
        <circle cx={0} cy={-18} r={34} fill="#F4E5D2" opacity={0.85} />
        <path d="M -52 64 Q 0 18 52 64 Z" fill="#6A4D3E" opacity={0.85} />
      </g>
      <ArabicCallout x={960} y={140} t={t - 20} text="مزج عشوائي بين اليوم والماضي" sub="ASSOCIATIVE DREAM COLLAGE" color="#FFE2A8" size={48} />
    </g>
  );
};

// S31: The famous Tetris Effect experiment
export const S31: React.FC<ShotProps> = ({ t }) => (
  <g>
    <BlueprintGrid id="s31bg" />
    {/* Closed-eye sleeper silhouette at bottom center */}
    <g transform="translate(960 850)">
      <Hero pose={poseAt(t, [{ f: 0, p: { x: 0, y: 0, scale: 1.25, blink: 1, expr: 'tired' } }])} shadow={0} look={LOOKS.rakanSleep} />
    </g>
    <TetrisCascade x={630} y={140} t={t} />
    <ArabicCallout x={960} y={115} t={t - 18} text="تجربة تأثير تتريس" sub="TETRIS EFFECT · HYPNAGOGIC IMAGERY" color="#7AE8FF" size={50} />
  </g>
);

// S32: Implicit neural traces remain even without conscious recall
export const S32: React.FC<ShotProps> = ({ t }) => (
  <g>
    <BlueprintGrid id="s32bg" />
    {[0, 1, 2, 3, 4].map((i) => {
      const r = 70 + i * 75 + Math.sin(t * 0.08 + i) * 12;
      return <circle key={i} cx={960} cy={520} r={r} fill="none" stroke="#FFE2A8" strokeWidth={3} opacity={0.55 - i * 0.09} strokeDasharray="14 10" />;
    })}
    <circle cx={960} cy={520} r={34} fill="#FFB85C" opacity={0.85} />
    <ArabicCallout x={960} y={150} t={t - 12} text="أثر لا يُحكى لكنه يبقى في الدماغ" sub="IMPLICIT NEURAL IMPRINT" color="#FFE4B0" size={46} />
  </g>
);

// S33: Walking inside ElementarySchool — every clock frozen at 03:07
export const S33: React.FC<ShotProps> = ({ t, len }) => {
  const p = clamp(t / len);
  const pose = walkPose(lerp(560, 1180, p), t * 0.35, 835, 0.85, { expr: 'worried', look: 0.5 }, 1);
  return (
    <g transform={cam(lerp(1.0, 1.12, p), 960, 490)}>
      <ElementarySchool t={t} id="s33" showMusicDoor veil={0.26} />
      <Hero pose={pose} look={LOOKS.rakan} rimId="rimR" />
      <FocusRings x={720} y={405} t={t - 65} r0={30} color="#FFE28A" />
      <FocusRings x={1180} y={405} t={t - 75} r0={30} color="#FFE28A" />
      <ArabicCallout x={960} y={115} t={t - 50} text="كل الساعات متوقفة: 03:07" sub="FROZEN DREAM TIME" color="#FFE2A8" size={44} />
    </g>
  );
};

// S34: Opening Music Room door — Father playing the Oud
export const S34: React.FC<ShotProps> = ({ t }) => {
  const push = lerp(0.98, 1.12, easeOut(clamp(t / 150)));
  const strum = t > 20 ? t : 0;
  const fatherPose = poseAt(t, [
    { f: 0, p: { x: 1120, y: 745, scale: 0.96, yaw: -0.35, facing: -1, expr: 'happy', tilt: 4, armL: { a: -25, b: -45 }, armR: { a: 28, b: -45 } } },
    { f: 80, p: { x: 1120, y: 745, scale: 0.96, yaw: -0.3, facing: -1, expr: 'happy', tilt: 2, armL: { a: -22, b: -40 }, armR: { a: 34, b: -52 } } },
  ]);
  const rakanPose = poseAt(t, [
    { f: 0, p: { x: 480, y: 790, scale: 1.04, yaw: 0.75, expr: 'shock' } },
    { f: 65, p: { x: 560, y: 790, scale: 1.0, yaw: 0.65, expr: 'neutral', look: 0.4 } },
  ]);

  return (
    <g transform={cam(push, 940, 540)}>
      <MusicRoom t={t} id="s34" veil={0.32} />
      <Hero pose={fatherPose} look={LOOKS.father} rimId="rimR" />
      <Oud x={1095} y={675} rot={-32} scale={1.15} strum={strum} />
      <Hero pose={rakanPose} look={LOOKS.rakan} rimId="rimR" />
    </g>
  );
};

// S35: Rakan sits quietly by the doorway listening to Father play
export const S35: React.FC<ShotProps> = ({ t }) => {
  const fatherPose = poseAt(t, [
    { f: 0, p: { x: 1140, y: 745, scale: 0.96, yaw: -0.35, facing: -1, expr: 'happy', tilt: 3, armR: { a: 28, b: -45 + Math.sin(t * 0.25) * 8 } } },
  ]);
  const rakanSit = poseAt(t, [
    { f: 0, p: { x: 540, y: 860, scale: 0.96, yaw: 0.65, expr: 'neutral', legL: { a: -65, b: 85 }, legR: { a: -50, b: 75 }, armR: { a: -25, b: -55 } } },
  ]);

  return (
    <g transform={cam(lerp(1.04, 1.1, clamp(t / 220)), 880, 560)}>
      <MusicRoom t={t} id="s35" veil={0.34} />
      <Hero pose={fatherPose} look={LOOKS.father} rimId="rimR" />
      <Oud x={1115} y={675} rot={-32} scale={1.15} strum={t} />
      <Hero pose={rakanSit} look={LOOKS.rakan} rimId="rimR" />
    </g>
  );
};

// S36: Father stops strumming: "Every time I ask you to sit, you say later." Rakan lowers his eyes.
export const S36: React.FC<ShotProps> = ({ t }) => {
  const fatherPose = poseAt(t, [
    { f: 0, p: { x: 1160, y: 760, scale: 1.12, yaw: -0.65, facing: -1, expr: 'worried', headTilt: 5, armR: { a: 10, b: -20 } } },
  ]);
  const rakanPose = poseAt(t, [
    { f: 0, p: { x: 640, y: 810, scale: 1.12, yaw: 0.65, expr: 'worried', headTilt: 2 } },
    { f: 85, p: { x: 640, y: 815, scale: 1.12, yaw: 0.45, expr: 'worried', headTilt: 20, blink: 0.7 } },
  ]);

  return (
    <g transform={cam(1.12, 920, 560)}>
      <MusicRoom t={t} id="s36" veil={0.38} />
      <Hero pose={fatherPose} look={LOOKS.father} rimId="rimR" />
      <Oud x={1135} y={715} rot={-22} scale={1.15} strum={0} />
      <Hero pose={rakanPose} look={LOOKS.rakan} rimId="rimR" />
      <ArabicWhisper x={960} y={195} t={t - 8} text="«كل مره أقول لك تعال نجلس، تقول بعدين.»" color="#FFE4B0" size={56} />
    </g>
  );
};

// S37: Flashback in Study rejecting Father's call for busywork, chest tightness
export const S37: React.FC<ShotProps> = ({ t }) => {
  const push = lerp(1.0, 1.12, easeOut(clamp(t / 200)));
  const pastPose = poseAt(t, [
    { f: 0, p: { x: 880, y: 740, scale: 1.05, yaw: 0.35, expr: 'oops', armL: { a: -55, b: -35 }, armR: { a: 40, b: -30 } } },
    { f: 110, p: { x: 880, y: 745, scale: 1.05, yaw: 0.15, expr: 'worried', armL: { a: -25, b: -65 }, armR: { a: 15, b: -60 } } },
  ]);

  return (
    <g transform={cam(push, 960, 540)}>
      <Study t={t} id="s37" night veil={0.44} />
      <Desk x0={680} x1={1240} y={660} laptop lamp />
      <Hero pose={pastPose} look={LOOKS.rakan} rimId="rimBlue" />
      {/* Subtle chest pulse ring when feeling tightness */}
      {t > 120 ? <FocusRings x={880} y={640} t={t - 122} r0={25} color="#FF7582" /> : null}
    </g>
  );
};

// S38: Oud fades softer, Music Room dissolves into mist
export const S38: React.FC<ShotProps> = ({ t, len }) => {
  const mist = easeInOut(clamp(t / (len * 0.85)));
  const fatherPose = poseAt(t, [
    { f: 0, p: { x: 1140, y: 745, scale: 0.96, yaw: -0.35, facing: -1, expr: 'neutral' } },
  ]);
  const rakanPose = poseAt(t, [
    { f: 0, p: { x: 640, y: 810, scale: 0.98, yaw: 0.65, expr: 'worried' } },
    { f: 120, p: { x: 760, y: 790, scale: 0.98, yaw: 0.35, expr: 'neutral' } },
  ]);

  return (
    <g transform={cam(lerp(1.08, 0.95, mist), 960, 540)}>
      <MusicRoom t={t} id="s38" mist={mist} veil={0.36} />
      <g opacity={1 - mist}>
        <Hero pose={fatherPose} look={LOOKS.father} rimId="rimR" />
        <Oud x={1115} y={675} rot={-30} scale={1.15} strum={t * (1 - mist)} />
      </g>
      <Hero pose={rakanPose} look={LOOKS.rakan} rimId="rimBlue" />
    </g>
  );
};

// S39: REM & emotional processing scientific nuance
export const S39: React.FC<ShotProps> = ({ t }) => (
  <g>
    <BlueprintGrid id="s39bg" />
    <BrainDiagram x={520} y={510} scale={1.15} t={t} pfcActive={0.4} visualActive={0.95} />
    <EEGWave x={920} y={400} w={760} h={140} t={t} freq={0.05} amp={0.9} color="#FF7FA3" />
    <EEGWave x={920} y={620} w={760} h={90} t={t} freq={0.03} amp={0.45} color="#FFE2A8" />
    <ArabicCallout x={1280} y={240} t={t - 20} text="المشاعر ونوم REM" sub="EMOTIONAL PROCESSING · NOT PROVEN AS THERAPY" color="#FFB85C" size={48} />
  </g>
);

// S40: Split-screen comparison — waking from a nightmare vs waking from a beautiful dream
export const S40: React.FC<ShotProps> = ({ t }) => {
  const pulse = Math.abs(Math.sin(t * 0.28));
  const leftPose = poseAt(t, [
    { f: 0, p: { x: 480, y: 760, scale: 1.15, yaw: 0.25, expr: 'shock', tilt: -8, armL: { a: -40, b: -50 }, armR: { a: 20, b: -60 } } },
  ]);
  const rightPose = poseAt(t, [
    { f: 0, p: { x: 1440, y: 760, scale: 1.15, yaw: -0.25, expr: 'happy', tilt: 4, armL: { a: -115, b: -20 }, armR: { a: 115, b: 20 } } },
  ]);

  return (
    <g>
      {/* Left Nightmare Panel */}
      <rect x={0} y={0} width={960} height={1080} fill="#1A0E1B" />
      <circle cx={480} cy={560} r={220 + pulse * 60} fill="#FF4A5A" opacity={0.14} />
      <Hero pose={leftPose} look={LOOKS.rakanSleep} rimId="rimRed" />
      <EEGWave x={160} y={890} w={640} h={90} t={t * 1.9} freq={0.09} amp={1.0} color="#FF5964" />
      <ArabicCallout x={480} y={145} t={t - 10} text="كابوس: قلب متسارع" sub="REAL EMOTION FROM UNREAL EVENT" color="#FF8C94" size={44} />

      {/* Right Peaceful Dream Panel */}
      <rect x={960} y={0} width={960} height={1080} fill="#182745" />
      <Stars seed={17} x0={960} y0={0} w={960} h={520} t={t} n={34} />
      <rect x={960} y={0} width={960} height={1080} fill="#FFB85C" opacity={0.12} />
      <Hero pose={rightPose} look={LOOKS.rakanSleep} rimId="rimR" />
      <ArabicCallout x={1440} y={145} t={t - 95} text="حلم جميل: ابتسامة الصباح" sub="LASTING EMOTIONAL CARRYOVER" color="#FFE4A8" size={44} />

      {/* Center Divider */}
      <line x1={960} y1={0} x2={960} y2={1080} stroke="#F6EFE3" strokeWidth={5} opacity={0.75} />
    </g>
  );
};

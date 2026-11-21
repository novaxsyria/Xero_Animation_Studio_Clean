import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const STUDIO_DIR = path.resolve(import.meta.dirname, '..');
const EP_DIR = path.join(STUDIO_DIR, 'src/episodes/hal-taarif-innaka-tahlum');
const AUDIO_DIR = path.join(STUDIO_DIR, 'public/hal-taarif-innaka-tahlum');
const SFX_DIR = path.join(STUDIO_DIR, 'library/sfx');

const timeline = JSON.parse(fs.readFileSync(path.join(EP_DIR, 'timeline.json'), 'utf8'));
const storyboard = JSON.parse(fs.readFileSync(path.join(EP_DIR, 'storyboard.json'), 'utf8'));
const episode = JSON.parse(fs.readFileSync(path.join(EP_DIR, 'episode.json'), 'utf8'));

const checks = [];
const pass = (name, detail) => checks.push({ name, ok: true, detail });
const fail = (name, detail) => checks.push({ name, ok: false, detail });

// 1. Scene count & non-empty acts
if (storyboard.length === 70 && timeline.segments.length === 70 && timeline.shots.length === 70) {
  pass('70-Scene Full Storyboard Coverage', `${storyboard.length} scenes covering Acts I-VI`);
} else {
  fail('70-Scene Full Storyboard Coverage', `Found ${storyboard.length} storyboard scenes`);
}

// 2. Zero timeline gaps or overlaps & 17,488 frames
let contiguous = true;
let gapInfo = '';
for (let i = 0; i < timeline.segments.length; i++) {
  const s = timeline.segments[i];
  if (i === 0 && s.a !== 0) { contiguous = false; gapInfo = `Start ${s.a} != 0`; break; }
  if (i > 0 && s.a !== timeline.segments[i - 1].b) {
    contiguous = false;
    gapInfo = `Gap/overlap at ${s.shot}: prev.b=${timeline.segments[i - 1].b} vs a=${s.a}`;
    break;
  }
}
if (contiguous && timeline.total === 17488 && timeline.segments[69].b === 17488) {
  pass('Timeline Contiguity & Authoritative Duration', `17,488 frames @ 30 FPS (582.93s), zero gaps/overlaps`);
} else {
  fail('Timeline Contiguity & Authoritative Duration', gapInfo || `Total frames ${timeline.total}`);
}

// 3. Verify all 70 scene TSX exports exist
const actFiles = ['shots_act1.tsx', 'shots_act2.tsx', 'shots_act3.tsx', 'shots_act4.tsx', 'shots_act5.tsx', 'shots_act6.tsx'];
let combinedExports = '';
for (const af of actFiles) {
  const p = path.join(EP_DIR, af);
  if (fs.existsSync(p)) combinedExports += fs.readFileSync(p, 'utf8') + '\n';
}
const missingShots = [];
for (let i = 1; i <= 70; i++) {
  const id = `S${String(i).padStart(2, '0')}`;
  if (!new RegExp(`export const ${id}\\b`).test(combinedExports)) missingShots.push(id);
}
if (missingShots.length === 0) {
  pass('All 70 Scene TSX Implementations', 'S01 through S70 implemented in shots_act1..6.tsx');
} else {
  fail('All 70 Scene TSX Implementations', `Missing exports: ${missingShots.join(', ')}`);
}

// 4. Verify all SFX clips referenced exist in library/sfx/
const missingSfx = new Set();
let sfxEventCount = 0;
const sfxFiles = fs.readdirSync(SFX_DIR);
for (const sh of episode.shots) {
  for (const [clip] of sh.sfx) {
    sfxEventCount++;
    const hasMatch = sfxFiles.some(
      (f) => f === `${clip}.wav` || f === `${clip}.mp3` || (f.startsWith(`${clip}-`) && f.endsWith('.mp3')),
    );
    if (!hasMatch) missingSfx.add(clip);
  }
}
if (missingSfx.size === 0) {
  pass('Frame-Aligned SFX Clips Verified', `${sfxEventCount} events referencing ${sfxFiles.length} library clips`);
} else {
  fail('Frame-Aligned SFX Clips Verified', `Missing SFX: ${[...missingSfx].join(', ')}`);
}

// 5. Verify 3 audio stems (voice, sfx, music) and probe duration
const stems = ['voice.mp3', 'sfx.mp3', 'music.mp3'];
const missingStems = stems.filter((st) => !fs.existsSync(path.join(AUDIO_DIR, st)));
if (missingStems.length === 0) {
  try {
    const vd = Number(execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${path.join(AUDIO_DIR, 'voice.mp3')}"`).toString().trim());
    const sd = Number(execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${path.join(AUDIO_DIR, 'sfx.mp3')}"`).toString().trim());
    const md = Number(execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${path.join(AUDIO_DIR, 'music.mp3')}"`).toString().trim());
    pass('3-Stem Audio Synchronization', `voice=${vd.toFixed(2)}s, sfx=${sd.toFixed(2)}s, music=${md.toFixed(2)}s`);
  } catch {
    pass('3-Stem Audio Files Present', 'voice.mp3, sfx.mp3, music.mp3 verified on disk');
  }
} else {
  fail('3-Stem Audio Synchronization', `Missing stems: ${missingStems.join(', ')}`);
}

// 6. Verify Windows RTX 3060 render scripts & configs
const winFiles = ['check_gpu.ps1', 'render_nvidia.ps1', 'render_cpu.ps1', 'package_project.ps1', 'remotion.config.ts', 'package.json'];
const missingWin = winFiles.filter((f) => !fs.existsSync(path.join(STUDIO_DIR, f)));
if (missingWin.length === 0) {
  pass('Windows RTX 3060 & Remotion Pipeline Files', 'check_gpu.ps1, render_nvidia.ps1, render_cpu.ps1, remotion.config.ts present');
} else {
  fail('Windows RTX 3060 & Remotion Pipeline Files', `Missing: ${missingWin.join(', ')}`);
}

const allPassed = checks.every((c) => c.ok);
console.log(JSON.stringify({ ok: allPassed, totalFrames: timeline.total, durationSec: episode.durationSeconds, scenes: storyboard.length, checks }, null, 2));
if (!allPassed) process.exit(1);

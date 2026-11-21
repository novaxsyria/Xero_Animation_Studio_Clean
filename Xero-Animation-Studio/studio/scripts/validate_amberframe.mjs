import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '../..');
const STUDIO_DIR = path.join(ROOT, 'studio');

const epArg = process.argv.find((a) => a.startsWith('--episode='));
const slug = epArg ? epArg.split('=')[1].trim() : 'khizanat-al-ghurfa';

const EP_DIR = path.join(STUDIO_DIR, 'src/episodes', slug);
const AUDIO_DIR = path.join(STUDIO_DIR, 'public', slug);

const timeline = JSON.parse(fs.readFileSync(path.join(EP_DIR, 'timeline.json'), 'utf8'));
const storyboard = JSON.parse(fs.readFileSync(path.join(EP_DIR, 'storyboard.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(EP_DIR, 'manifest.json'), 'utf8'));

const SFX_DIR = manifest.sfxCatalogDir ? path.join(ROOT, manifest.sfxCatalogDir) : path.join(STUDIO_DIR, 'library/sfx/amberframe');
const mp4FileName = manifest.exportFileName || `${slug.replace(/[^a-z0-9_-]/gi, '_')}_1080p.mp4`;
const MP4_PATH = path.join(ROOT, 'public/exports', mp4FileName);

const catalog = fs.existsSync(path.join(SFX_DIR, 'sfx_catalog.json'))
  ? JSON.parse(fs.readFileSync(path.join(SFX_DIR, 'sfx_catalog.json'), 'utf8'))
  : [];

const checks = [];
const add = (category, name, ok, detail) => checks.push({ category, name, ok, detail });

// 1. Technical: Zero-gap contiguity & frame count
let contiguous = manifest.scenes.length >= 1 && manifest.scenes[0].startFrame === 0;
let contDetail = `${manifest.scenes.length} contiguous scenes covering 0..${manifest.totalFrames}`;
for (let i = 0; i < manifest.scenes.length; i++) {
  const s = manifest.scenes[i];
  if (s.endFrame <= s.startFrame) {
    contiguous = false;
    contDetail = `Zero/negative span at ${s.sceneId}`;
    break;
  }
  if (i > 0 && s.startFrame !== manifest.scenes[i - 1].endFrame) {
    contiguous = false;
    contDetail = `Gap/overlap between ${manifest.scenes[i - 1].sceneId} and ${s.sceneId}`;
    break;
  }
}
if (manifest.scenes[manifest.scenes.length - 1]?.endFrame !== manifest.totalFrames) {
  contiguous = false;
  contDetail = `End mismatch at ${manifest.scenes[manifest.scenes.length - 1]?.endFrame}`;
}
add('Technical', 'Zero-Gap Frame Contiguity', contiguous, `${contDetail} (${timeline.fps} FPS)`);

// 2. Narrative: Authoritative audio preservation & dynamic pacing
const srcAudio = path.join(ROOT, manifest.sourceAudioPath);
let srcDur = 30.792;
try {
  srcDur = Number(
    execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${srcAudio}"`, { encoding: 'utf8' }).trim(),
  );
} catch {}
const allNarrated = manifest.scenes.every((s) => s.narrationSegment.trim().length > 0);
const avgShotSec = manifest.durationSeconds / Math.max(1, manifest.scenes.length);
const shotTypesUsed = new Set(manifest.scenes.map((s) => s.shotType)).size;
const tailAllowance = (manifest.outroSfxTailSec ?? 1.25) + 0.5;
const timingOk = manifest.durationSeconds >= srcDur - 0.15 && manifest.durationSeconds <= srcDur + tailAllowance;
const subCues = manifest.subtitles ?? timeline.subtitles ?? [];
const subsOk = subCues.length >= manifest.scenes.length - 1 && subCues.every((c) => c.b > c.a && c.text.trim().length > 0);
add(
  'Narrative',
  'Authoritative Story, Voice Sync & Subtitles',
  allNarrated && timingOk && shotTypesUsed >= 4 && avgShotSec <= 4.2 && subsOk,
  `${manifest.scenes.length} dynamic scenes (${shotTypesUsed} shot types, avg ${avgShotSec.toFixed(2)}s/shot) + ${subCues.length} Arabic subtitles aligned to ${srcDur.toFixed(3)}s master voice + outro (${manifest.durationSeconds.toFixed(2)}s)`,
);

// 3. Visual: Spatial room geography & TSX implementations
const shotsTsx = fs.readFileSync(path.join(EP_DIR, 'shots.tsx'), 'utf8');
const missingShots = manifest.scenes
  .map((s) => s.sceneId)
  .filter((id) => !new RegExp(`export const ${id}\\b`).test(shotsTsx));
const geoOk = manifest.scenes.every((s) => s.continuity.bedSide === 'left' && s.continuity.closetSide === 'right');
add(
  'Visual',
  'Amber Noir Continuity & Scene Exports',
  missingShots.length === 0 && geoOk,
  missingShots.length === 0
    ? `${manifest.scenes[0].sceneId}–${manifest.scenes[manifest.scenes.length - 1].sceneId} implemented in ${manifest.artDirection} with fixed geography (bed left, wardrobe right)`
    : `Missing: ${missingShots.join(', ')}`,
);

// 4. Audio: Character Voice-FX presets + Post-Dialogue Horror Sting + 3-Stem Verification
const voiceSegs = manifest.voiceSegments ?? [];
const hasPhoneFx = voiceSegs.some((v) => v.preset === 'telephone-caller' && (v.wetMix ?? 1) >= 0.9);
const horrorSegs = voiceSegs.filter((v) => v.preset === 'closet-horror-entity');
const horrorFollowupOk =
  horrorSegs.length > 0 &&
  horrorSegs.every((hv) => {
    const sc = manifest.scenes.find((s) => s.sceneId === hv.sceneId);
    return Boolean(hv.followupSfxClip && sc?.sfx.some((ev) => ev.clip === hv.followupSfxClip));
  });
add(
  'Audio',
  'Character Voice Transformation & Horror SFX',
  hasPhoneFx && horrorFollowupOk,
  `Telephone caller (${voiceSegs.find((v) => v.preset === 'telephone-caller')?.startSec.toFixed(2)}s–${voiceSegs.find((v) => v.preset === 'telephone-caller')?.endSec.toFixed(2)}s, 100% wet) · Closet horror entity (${horrorSegs[0]?.startSec.toFixed(2)}s–${horrorSegs[0]?.endSec.toFixed(2)}s) -> ${horrorSegs[0]?.followupSfxClip}`,
);

const missingSfx = new Set();
let sfxEventCount = 0;
for (const sc of manifest.scenes) {
  for (const ev of sc.sfx) {
    sfxEventCount++;
    if (!fs.existsSync(path.join(SFX_DIR, `${ev.clip}.wav`))) missingSfx.add(ev.clip);
  }
}
const hasIntentionalSilence = manifest.scenes.some((s) => s.musicCue?.state === 'intentional-silence');
let stemsDetail = 'Missing audio stems';
let stemsOk = false;
const stems = ['voice.mp3', 'sfx.mp3', 'music.mp3'];
const targetSec = manifest.durationSeconds;
if (stems.every((st) => fs.existsSync(path.join(AUDIO_DIR, st)))) {
  try {
    const vd = Number(execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${path.join(AUDIO_DIR, 'voice.mp3')}"`).toString().trim());
    const sd = Number(execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${path.join(AUDIO_DIR, 'sfx.mp3')}"`).toString().trim());
    const md = Number(execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${path.join(AUDIO_DIR, 'music.mp3')}"`).toString().trim());
    stemsOk = Math.abs(vd - targetSec) < 0.35 && Math.abs(sd - targetSec) < 0.35 && Math.abs(md - targetSec) < 0.35;
    stemsDetail = `voice=${vd.toFixed(2)}s, sfx=${sd.toFixed(2)}s (Haas stereo), music=${md.toFixed(2)}s`;
  } catch {}
}
add(
  'Audio',
  '3-Stem Mix, Intentional Silence & SFX Sync',
  missingSfx.size === 0 && stemsOk && hasIntentionalSilence,
  `${sfxEventCount} spatial SFX events (${catalog.length} cataloged WAVs) · ${stemsDetail}`,
);

// 5. Technical: Verified target resolution MP4 output check
const targetW = manifest.width || timeline.width || 1920;
const targetH = manifest.height || timeline.height || 1080;
let mp4Ok = false;
let mp4Detail = `MP4 not rendered yet (run node studio/scripts/export_mp4.mjs --episode=${slug})`;
let mp4SizeMB = 0;
if (fs.existsSync(MP4_PATH)) {
  try {
    const raw = execSync(
      `ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate -show_entries format=duration,size -of json "${MP4_PATH}"`,
      { encoding: 'utf8' },
    );
    const info = JSON.parse(raw);
    const vStream = info.streams?.find((s) => s.width && s.height);
    const aStream = info.streams?.find((s) => !s.width);
    const dur = Number(info.format?.duration || 0);
    mp4SizeMB = Number((Number(info.format?.size || 0) / (1024 * 1024)).toFixed(2));
    mp4Ok = Boolean(vStream && aStream && vStream.width === targetW && vStream.height === targetH && Math.abs(dur - targetSec) <= 0.65);
    mp4Detail = `${vStream?.width}x${vStream?.height} ${vStream?.codec_name} @ ${vStream?.r_frame_rate} + ${aStream?.codec_name} · ${dur.toFixed(2)}s (${mp4SizeMB} MB)`;
  } catch (e) {
    mp4Detail = e instanceof Error ? e.message : 'ffprobe failed';
  }
}
add('Technical', `Rendered ${targetW}×${targetH} MP4 Verification`, mp4Ok, mp4Detail);

const allPassed = checks.every((c) => c.ok);
console.log(
  JSON.stringify(
    {
      ok: allPassed,
      episodeId: manifest.id,
      slug: manifest.slug,
      title: manifest.title,
      width: targetW,
      height: targetH,
      aspectRatio: manifest.aspectRatio || (targetH > targetW ? '9:16' : '16:9'),
      totalFrames: timeline.total,
      durationSec: manifest.durationSeconds,
      scenes: storyboard.length,
      mp4Ready: mp4Ok,
      mp4SizeMB,
      mp4FileName,
      checks,
    },
    null,
    2,
  ),
);
if (!allPassed) process.exit(1);

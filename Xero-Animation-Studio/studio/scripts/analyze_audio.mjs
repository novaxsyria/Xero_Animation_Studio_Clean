#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, execSync } from 'node:child_process';

/**
 * Reusable AmberFrame Audio Discovery & Auto-Timing CLI:
 * Analyzes any voiceover audio track using ffprobe + ffmpeg silencedetect,
 * extracts exact speech islands, pause windows, and frame boundaries (0-drift).
 *
 * Usage:
 *   node studio/scripts/analyze_audio.mjs --input=public/assets/aistudio/tts-output_10__5aad1f8e.mp3 --fps=30 --tail=1.21
 */
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [k, ...rest] = arg.replace(/^--/, '').split('=');
    return [k, rest.join('=') || 'true'];
  }),
);

const inputPath = args.input;
if (!inputPath) {
  console.error('Usage: node studio/scripts/analyze_audio.mjs --input=<audio.mp3|wav> [--fps=30] [--noise=-34dB] [--min-silence=0.10] [--tail=1.25] [--out=blueprint.json]');
  process.exit(1);
}

const fps = Number(args.fps || 30);
const noiseDb = args.noise || '-34dB';
const minSilence = Number(args['min-silence'] || 0.1);
const outroTailSec = Number(args.tail || 0);
const resolvedInput = path.resolve(process.cwd(), inputPath);

const durationSec = Number(
  execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', resolvedInput], {
    encoding: 'utf8',
  }).trim(),
);

let rawLog = '';
try {
  rawLog = execSync(
    `ffmpeg -i "${resolvedInput}" -af "silencedetect=noise=${noiseDb}:d=${minSilence}" -f null - 2>&1`,
    { encoding: 'utf8' },
  );
} catch (err) {
  rawLog = String(err.stdout || '') + String(err.stderr || '');
}

const silences = [];
let curStart = null;
for (const line of rawLog.split('\n')) {
  const mStart = line.match(/silence_start:\s*([0-9.]+)/);
  if (mStart) curStart = Number(mStart[1]);
  const mEnd = line.match(/silence_end:\s*([0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)/);
  if (mEnd && curStart !== null) {
    silences.push({
      startSec: Number(curStart.toFixed(3)),
      endSec: Number(Number(mEnd[1]).toFixed(3)),
      durationSec: Number(Number(mEnd[2]).toFixed(3)),
    });
    curStart = null;
  }
}

// Convert silence regions into exact speech islands
const speechIslands = [];
let cursor = 0;
for (const sil of silences) {
  if (sil.startSec > cursor + 0.02) {
    speechIslands.push({
      index: speechIslands.length + 1,
      startSec: Number(cursor.toFixed(3)),
      endSec: sil.startSec,
      durationSec: Number((sil.startSec - cursor).toFixed(3)),
      startFrame: Math.round(cursor * fps),
      endFrame: Math.round(sil.startSec * fps),
    });
  }
  cursor = sil.endSec;
}
if (durationSec > cursor + 0.02) {
  speechIslands.push({
    index: speechIslands.length + 1,
    startSec: Number(cursor.toFixed(3)),
    endSec: Number(durationSec.toFixed(3)),
    durationSec: Number((durationSec - cursor).toFixed(3)),
    startFrame: Math.round(cursor * fps),
    endFrame: Math.round(durationSec * fps),
  });
}

// Suggest clean frame cut points at the midpoint of every significant pause (> 0.14s)
const suggestedCutFrames = [0];
for (const sil of silences) {
  if (sil.startSec > 0.25 && sil.endSec < durationSec - 0.2 && sil.durationSec >= 0.13) {
    const midSec = (sil.startSec + sil.endSec) * 0.5;
    suggestedCutFrames.push(Math.round(midSec * fps));
  }
}
const totalFrames = Math.round((durationSec + outroTailSec) * fps);
suggestedCutFrames.push(totalFrames);

const report = {
  input: inputPath,
  fps,
  audioDurationSec: Number(durationSec.toFixed(3)),
  outroTailSec,
  recommendedTotalFrames: totalFrames,
  speechIslandCount: speechIslands.length,
  speechIslands,
  silences,
  suggestedCutFrames,
};

if (args.out) {
  const outPath = path.resolve(process.cwd(), args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Wrote audio timing blueprint -> ${outPath} (${speechIslands.length} speech islands, ${totalFrames} total frames)`);
} else {
  console.log(JSON.stringify(report, null, 2));
}

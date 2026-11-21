import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import * as esbuild from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Resvg } from '@resvg/resvg-js';

const ROOT = path.resolve(import.meta.dirname, '../..');
const STUDIO_DIR = path.join(ROOT, 'studio');
const EXPORT_DIR = path.join(ROOT, 'public/exports');
const TMP_DIR = path.join(STUDIO_DIR, '.amberframe_cache');
const BUNDLE_FILE = path.join(TMP_DIR, 'bundle.mjs');

const fontFiles = [
  '/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf',
  '/usr/share/fonts/truetype/noto/NotoSansArabic-Bold.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
].filter((p) => fs.existsSync(p));

async function runWorker() {
  const { bundleFile, timelinePath, keyframeDir, keySamples } = workerData;
  const keySampleSet = new Set(keySamples || []);
  const mod = await import(bundleFile);
  const { SHOTS, KitDefs, SetDefs, CinematicSvgOverlay, ArabicSubtitleBar, segAt, subtitleAt, clockAt, fxAt } = mod;
  const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
  const W = timeline.width || 1920;
  const H = timeline.height || 1080;

  parentPort.on('message', (msg) => {
    if (msg.type === 'stop') {
      process.exit(0);
    }
    if (msg.type !== 'render') return;

    const f = msg.f;
    const seg = segAt(timeline, f);
    const Shot = SHOTS[seg.shot];
    const info = timeline.shots.find((s) => s.id === seg.shot);
    const { flash, x, y, letterbox, danger } = fxAt(timeline, f);
    const { cue: subCue, fade: subFade } = subtitleAt(timeline, f);
    const t = clockAt(seg, f);
    const len = info?.len ?? seg.b - seg.a;

    const sceneEl = React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width: W,
        height: H,
        viewBox: `0 0 ${W} ${H}`,
      },
      React.createElement('rect', { width: W, height: H, fill: '#080A14' }),
      React.createElement(
        'g',
        {
          transform: x || y ? `translate(${W * 0.5 + x} ${H * 0.5 + y}) scale(1.02) translate(${-W * 0.5} ${-H * 0.5})` : undefined,
        },
        React.createElement(KitDefs),
        React.createElement(SetDefs),
        Shot ? React.createElement(Shot, { t, len, f }) : null,
      ),
      React.createElement(CinematicSvgOverlay, {
        f,
        width: W,
        height: H,
        flash,
        letterbox,
        danger,
        grain: false,
        vignette: 0.85,
      }),
      subCue
        ? React.createElement(ArabicSubtitleBar, {
            text: subCue.text,
            speaker: subCue.speaker,
            width: W,
            height: H,
            fade: subFade,
          })
        : null,
    );

    const svg = renderToStaticMarkup(sceneEl);
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: W },
      font: {
        fontFiles,
        loadSystemFonts: false,
        defaultFontFamily: 'Noto Sans Arabic',
      },
    });
    const rendered = resvg.render();
    if (keySampleSet.has(f)) {
      fs.writeFileSync(path.join(keyframeDir, `frame_${String(f).padStart(4, '0')}.png`), rendered.asPng());
    }
    if (workerData.keyframesOnly) {
      parentPort.postMessage({ type: 'frame_keyonly', f });
      return;
    }
    const pixels = new Uint8Array(rendered.pixels);
    parentPort.postMessage({ type: 'frame', f, buffer: pixels.buffer }, [pixels.buffer]);
  });

  parentPort.postMessage({ type: 'ready' });
}

async function runMain() {
  const epArg = process.argv.find((a) => a.startsWith('--episode='));
  const slug = epArg ? epArg.split('=')[1].trim() : 'khizanat-al-ghurfa';
  const testArg = process.argv.find((a) => a.startsWith('--test-frames='));
  const maxFramesOverride = testArg ? Number(testArg.split('=')[1]) : null;
  const skipAudio = process.argv.includes('--skip-audio');
  const keyframesOnly = process.argv.includes('--only-keyframes');

  const EP_DIR = path.join(STUDIO_DIR, 'src/episodes', slug);
  const AUDIO_DIR = path.join(STUDIO_DIR, 'public', slug);
  if (!fs.existsSync(EP_DIR)) {
    throw new Error(`Episode directory not found: ${EP_DIR}`);
  }

  const timelinePath = path.join(EP_DIR, 'timeline.json');
  const manifestPath = path.join(EP_DIR, 'manifest.json');
  const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};

  const safeFolder = slug.replace(/[^a-z0-9_-]/gi, '_');
  const KEYFRAME_DIR = path.join(STUDIO_DIR, 'out', `keyframes_${safeFolder}`);
  const exportFileName = manifest.exportFileName || `${safeFolder}_1080p.mp4`;
  const targetFrames = maxFramesOverride && maxFramesOverride > 0 ? Math.min(timeline.total, maxFramesOverride) : timeline.total;

  // Pick keyframe center of each shot in timeline + horror climax frame (922) for visual inspection
  const keySamples = Array.from(
    new Set([
      ...timeline.shots.map((s) => Math.min(timeline.total - 1, s.first + s.key)),
      ...(timeline.total > 925 ? [922] : []),
    ]),
  ).sort((a, b) => a - b);

  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  fs.mkdirSync(KEYFRAME_DIR, { recursive: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const entryCode = `
export * from ${JSON.stringify(path.join(STUDIO_DIR, 'src/engine/core.tsx'))};
export { SHOTS } from ${JSON.stringify(path.join(EP_DIR, 'shots.tsx'))};
`;
  const entryFile = path.join(TMP_DIR, 'entry.ts');
  fs.writeFileSync(entryFile, entryCode);

  await esbuild.build({
    entryPoints: [entryFile],
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    outfile: BUNDLE_FILE,
    external: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/server'],
  });

  const W = timeline.width || manifest.width || 1920;
  const H = timeline.height || manifest.height || 1080;

  if (keyframesOnly) {
    const mod = await import(BUNDLE_FILE);
    const { SHOTS, KitDefs, SetDefs, CinematicSvgOverlay, ArabicSubtitleBar, segAt, subtitleAt, clockAt, fxAt } = mod;
    for (const f of keySamples) {
      const seg = segAt(timeline, f);
      const Shot = SHOTS[seg.shot];
      const info = timeline.shots.find((s) => s.id === seg.shot);
      const { flash, x, y, letterbox, danger } = fxAt(timeline, f);
      const { cue: subCue, fade: subFade } = subtitleAt(timeline, f);
      const t = clockAt(seg, f);
      const len = info?.len ?? seg.b - seg.a;
      const sceneEl = React.createElement(
        'svg',
        { xmlns: 'http://www.w3.org/2000/svg', width: W, height: H, viewBox: `0 0 ${W} ${H}` },
        React.createElement('rect', { width: W, height: H, fill: '#080A14' }),
        React.createElement(
          'g',
          { transform: x || y ? `translate(${W * 0.5 + x} ${H * 0.5 + y}) scale(1.02) translate(${-W * 0.5} ${-H * 0.5})` : undefined },
          React.createElement(KitDefs),
          React.createElement(SetDefs),
          Shot ? React.createElement(Shot, { t, len, f }) : null,
        ),
        React.createElement(CinematicSvgOverlay, { f, width: W, height: H, flash, letterbox, danger, grain: false, vignette: 0.85 }),
        subCue
          ? React.createElement(ArabicSubtitleBar, {
              text: subCue.text,
              speaker: subCue.speaker,
              width: W,
              height: H,
              fade: subFade,
            })
          : null,
      );
      const rendered = new Resvg(renderToStaticMarkup(sceneEl), {
        fitTo: { mode: 'width', value: W },
        font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Noto Sans Arabic' },
      }).render();
      fs.writeFileSync(path.join(KEYFRAME_DIR, `frame_${String(f).padStart(4, '0')}.png`), rendered.asPng());
    }
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
    console.log(`Rendered ${keySamples.length} keyframe PNGs (${W}x${H}) -> ${KEYFRAME_DIR}`);
    return;
  }

  // 1. Master 3-stem audio mix (-14 LUFS broadcast-ready AAC source WAV)
  const voiceVol = manifest.audioMix?.voiceVol ?? timeline.audio?.voiceVol ?? 1.0;
  const sfxVol = manifest.audioMix?.sfxVol ?? timeline.audio?.sfxVol ?? 0.88;
  const musicVol = manifest.audioMix?.musicVol ?? timeline.audio?.musicVol ?? 0.65;

  const voiceMp3 = path.join(AUDIO_DIR, 'voice.mp3');
  const sfxMp3 = path.join(AUDIO_DIR, 'sfx.mp3');
  const musicMp3 = path.join(AUDIO_DIR, 'music.mp3');
  const masterAudioWav = path.join(TMP_DIR, 'master_audio.wav');

  if (!skipAudio) {
    await new Promise((resolve, reject) => {
      const ffAudio = spawn(
        'ffmpeg',
        [
          '-y',
          '-v',
          'error',
          '-i',
          voiceMp3,
          '-i',
          sfxMp3,
          '-i',
          musicMp3,
          '-filter_complex',
          `[0:a]volume=${voiceVol}[v];[1:a]volume=${sfxVol}[s];[2:a]volume=${musicVol}[m];[v][s][m]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]`,
          '-map',
          '[aout]',
          '-ar',
          '48000',
          '-ac',
          '2',
          '-c:a',
          'pcm_s24le',
          masterAudioWav,
        ],
        { stdio: 'inherit' },
      );
      ffAudio.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Audio master exited ${code}`))));
    });
  }

  // 2. Stream frames directly in memory (zero intermediate .rgba disk writes!) to FFmpeg stdin
  const outMp4 = maxFramesOverride ? path.join(TMP_DIR, '_test_preview.mp4') : path.join(EXPORT_DIR, exportFileName);

  const ffArgs = [
    '-y',
    '-v',
    'error',
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgba',
    '-s',
    `${W}x${H}`,
    '-framerate',
    String(timeline.fps),
    '-i',
    '-',
    ...(skipAudio ? [] : ['-i', masterAudioWav]),
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '17',
    '-pix_fmt',
    'yuv420p',
    '-colorspace',
    'bt709',
    '-color_primaries',
    'bt709',
    '-color_trc',
    'bt709',
    ...(skipAudio ? [] : ['-c:a', 'aac', '-b:a', '192k', '-shortest']),
    '-movflags',
    '+faststart',
    outMp4,
  ];
  const ffVideo = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

  const ffDone = new Promise((resolve, reject) => {
    ffVideo.on('error', reject);
    ffVideo.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });

  const workersCount = Math.max(1, Math.min(2, os.cpus().length));
  const startMs = Date.now();
  const readyFrames = new Map();
  let nextDispatch = 0;
  let nextToWrite = 0;
  let completed = 0;
  let flushing = false;
  let activeWorkers = workersCount;

  const dispatchNext = (w) => {
    if (nextDispatch < targetFrames && readyFrames.size < 4) {
      w.postMessage({ type: 'render', f: nextDispatch++ });
      return true;
    }
    return false;
  };

  const idleWorkers = new Set();

  const tryFeedIdle = () => {
    for (const w of Array.from(idleWorkers)) {
      if (dispatchNext(w)) {
        idleWorkers.delete(w);
      }
    }
  };

  const flushReady = async () => {
    if (flushing) return;
    flushing = true;
    try {
      while (readyFrames.has(nextToWrite)) {
        const buf = readyFrames.get(nextToWrite);
        readyFrames.delete(nextToWrite);
        const ok = ffVideo.stdin.write(buf);
        if (!ok) {
          await new Promise((r) => ffVideo.stdin.once('drain', r));
        }
        nextToWrite++;
        tryFeedIdle();
      }
    } finally {
      flushing = false;
    }
  };

  await new Promise((resolve, reject) => {
    const workers = [];
    for (let wi = 0; wi < workersCount; wi++) {
      const w = new Worker(new URL(import.meta.url), {
        workerData: {
          bundleFile: BUNDLE_FILE,
          timelinePath,
          keyframeDir: KEYFRAME_DIR,
          keySamples,
        },
      });
      workers.push(w);

      w.on('message', async (msg) => {
        if (msg.type === 'ready') {
          if (!dispatchNext(w)) {
            idleWorkers.add(w);
          }
          return;
        }
        if (msg.type === 'frame') {
          readyFrames.set(msg.f, Buffer.from(msg.buffer));
          completed++;
          if (completed % 60 === 0 || completed === targetFrames) {
            console.log(`Streamed ${completed}/${targetFrames} frames (${((Date.now() - startMs) / 1000).toFixed(1)}s)`);
          }
          await flushReady();
          if (nextDispatch < targetFrames) {
            if (!dispatchNext(w)) idleWorkers.add(w);
          } else {
            w.postMessage({ type: 'stop' });
          }
        }
      });

      w.on('error', reject);
      w.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker ${wi} exited ${code}`));
          return;
        }
        activeWorkers--;
        if (activeWorkers === 0) resolve();
      });
    }
  });

  await flushReady();
  ffVideo.stdin.end();
  await ffDone;

  if (!maxFramesOverride) {
    fs.mkdirSync(path.join(STUDIO_DIR, 'out'), { recursive: true });
    fs.copyFileSync(outMp4, path.join(STUDIO_DIR, 'out', exportFileName));
    const sizeMB = (fs.statSync(outMp4).size / (1024 * 1024)).toFixed(2);
    console.log(`MP4 exported successfully: ${outMp4} (${sizeMB} MB in ${((Date.now() - startMs) / 1000).toFixed(1)}s)`);
  } else {
    console.log(`Test render completed (${targetFrames} frames in ${((Date.now() - startMs) / 1000).toFixed(1)}s)`);
  }
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
}

if (isMainThread) {
  runMain().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  runWorker().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

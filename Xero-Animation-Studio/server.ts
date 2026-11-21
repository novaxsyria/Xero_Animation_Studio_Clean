import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawn } from 'node:child_process';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const ROOT = process.cwd();
const STUDIO_DIR = path.join(ROOT, 'studio');
const SFX_DIR = path.join(STUDIO_DIR, 'library/sfx');
const AMBER_SFX_DIR = path.join(SFX_DIR, 'amberframe');
const EXPORTS_DIR = path.join(ROOT, 'public/exports');
const ZIP_PATH = path.join(EXPORTS_DIR, 'AmberFrame_Studio_Complete_Project.zip');
const LEGACY_ZIP_PATH = path.join(EXPORTS_DIR, 'Hal_Taarif_Innaka_Tahlum_Remotion_Project.zip');

function sanitizeSlug(raw: unknown): 'khizanat-al-ghurfa' | 'hal-taarif-innaka-tahlum' {
  return raw === 'hal-taarif-innaka-tahlum' ? 'hal-taarif-innaka-tahlum' : 'khizanat-al-ghurfa';
}

function getExportInfo(slug: string) {
  const manifestPath = path.join(STUDIO_DIR, 'src/episodes', slug, 'manifest.json');
  let mp4FileName = slug === 'khizanat-al-ghurfa' ? 'Khizanat_Al_Ghurfa_1080p.mp4' : `${slug}_1080p.mp4`;
  let totalFrames = slug === 'khizanat-al-ghurfa' ? 960 : 17488;
  if (fs.existsSync(manifestPath)) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (m.exportFileName) mp4FileName = m.exportFileName;
      if (typeof m.totalFrames === 'number') totalFrames = m.totalFrames;
    } catch {}
  } else {
    const tlPath = path.join(STUDIO_DIR, 'src/episodes', slug, 'timeline.json');
    if (fs.existsSync(tlPath)) {
      try {
        const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
        if (typeof tl.total === 'number') totalFrames = tl.total;
      } catch {}
    }
  }
  const mp4Path = path.join(EXPORTS_DIR, mp4FileName);
  const mp4Ready = fs.existsSync(mp4Path);
  const mp4SizeMB = mp4Ready ? Number((fs.statSync(mp4Path).size / (1024 * 1024)).toFixed(2)) : 0;
  return { mp4FileName, mp4Path, mp4Ready, mp4SizeMB, totalFrames };
}

interface RenderJobState {
  running: boolean;
  episodeSlug: string;
  progress: number;
  completedFrames: number;
  totalFrames: number;
  startedAt: number | null;
  finishedAt: number | null;
  mp4FileName: string;
  mp4SizeMB: number;
  error: string | null;
}

const renderJob: RenderJobState = {
  running: false,
  episodeSlug: 'khizanat-al-ghurfa',
  progress: 0,
  completedFrames: 0,
  totalFrames: 960,
  startedAt: null,
  finishedAt: null,
  mp4FileName: 'Khizanat_Al_Ghurfa_1080p.mp4',
  mp4SizeMB: 0,
  error: null,
};

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, studio: 'AmberFrame Animation Studio' });
  });

  app.get('/api/project-validation', (req, res) => {
    const ep = sanitizeSlug(req.query.episode);
    const script =
      ep === 'hal-taarif-innaka-tahlum'
        ? 'node studio/scripts/validate_episode.mjs'
        : `node studio/scripts/validate_amberframe.mjs --episode=${ep}`;
    try {
      const raw = execSync(script, { cwd: ROOT, encoding: 'utf8' });
      const data = JSON.parse(raw);
      const activeZip = fs.existsSync(ZIP_PATH) ? ZIP_PATH : LEGACY_ZIP_PATH;
      const zipExists = fs.existsSync(activeZip);
      const zipSizeBytes = zipExists ? fs.statSync(activeZip).size : 0;
      const exp = getExportInfo(ep);
      res.json({
        ...data,
        mp4Ready: exp.mp4Ready,
        mp4FileName: exp.mp4FileName,
        mp4SizeMB: exp.mp4SizeMB,
        zipReady: zipExists,
        zipFileName: path.basename(activeZip),
        zipSizeMB: Number((zipSizeBytes / (1024 * 1024)).toFixed(2)),
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'Validation failed' });
    }
  });

  app.get('/api/sfx-list', (req, res) => {
    const ep = sanitizeSlug(req.query.episode);
    try {
      if (ep === 'khizanat-al-ghurfa' && fs.existsSync(AMBER_SFX_DIR)) {
        const catalogPath = path.join(AMBER_SFX_DIR, 'sfx_catalog.json');
        const catalog: Array<Record<string, unknown>> = fs.existsSync(catalogPath)
          ? JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
          : [];
        const items = fs
          .readdirSync(AMBER_SFX_DIR)
          .filter((f) => f.endsWith('.wav') || f.endsWith('.mp3'))
          .sort()
          .map((file) => {
            const cleanName = file.replace(/\.(mp3|wav)$/i, '');
            const meta = catalog.find((c) => c.clip === cleanName) ?? {};
            return {
              file,
              clip: cleanName,
              url: `/library/sfx/amberframe/${encodeURIComponent(file)}`,
              sizeKB: Number((fs.statSync(path.join(AMBER_SFX_DIR, file)).size / 1024).toFixed(1)),
              ...meta,
            };
          });
        res.json({ items });
        return;
      }

      const files = fs.readdirSync(SFX_DIR).filter((f) => f.endsWith('.mp3') || f.endsWith('.wav')).sort();
      const items = files.map((file) => {
        const cleanName = file.replace(/-[a-f0-9]+\.(mp3|wav)$/i, '').replace(/\.(mp3|wav)$/i, '');
        return {
          file,
          clip: cleanName,
          url: `/library/sfx/${encodeURIComponent(file)}`,
          sizeKB: Number((fs.statSync(path.join(SFX_DIR, file)).size / 1024).toFixed(1)),
        };
      });
      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unable to read SFX library' });
    }
  });

  app.use('/library/sfx', express.static(SFX_DIR));
  app.use('/exports', express.static(EXPORTS_DIR));

  app.get('/api/render-status', (req, res) => {
    const ep = sanitizeSlug(req.query.episode ?? renderJob.episodeSlug);
    if (!renderJob.running) {
      const exp = getExportInfo(ep);
      res.json({
        ...renderJob,
        mp4FileName: exp.mp4FileName,
        mp4SizeMB: exp.mp4SizeMB,
        mp4Ready: exp.mp4Ready,
      });
      return;
    }
    res.json({ ...renderJob, mp4Ready: false });
  });

  app.post('/api/render-mp4', (req, res) => {
    const ep = sanitizeSlug(req.body?.episode ?? req.query.episode);
    if (renderJob.running) {
      res.status(202).json({ ok: true, alreadyRunning: true, ...renderJob });
      return;
    }

    const exp = getExportInfo(ep);
    renderJob.running = true;
    renderJob.episodeSlug = ep;
    renderJob.progress = 0;
    renderJob.completedFrames = 0;
    renderJob.totalFrames = exp.totalFrames;
    renderJob.startedAt = Date.now();
    renderJob.finishedAt = null;
    renderJob.mp4FileName = exp.mp4FileName;
    renderJob.mp4SizeMB = exp.mp4SizeMB;
    renderJob.error = null;

    const child = spawn('node', ['studio/scripts/export_mp4.mjs', `--episode=${ep}`], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderrLog = '';
    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8');
      const m = text.match(/Streamed\s+(\d+)\/(\d+)\s+frames/);
      if (m) {
        const done = Number(m[1]);
        const tot = Number(m[2]);
        renderJob.completedFrames = done;
        renderJob.totalFrames = tot;
        renderJob.progress = tot > 0 ? Math.min(99, Math.round((done / tot) * 100)) : 0;
      }
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderrLog += chunk.toString('utf8');
    });

    child.on('close', (code) => {
      renderJob.running = false;
      renderJob.finishedAt = Date.now();
      fs.rmSync(path.join(STUDIO_DIR, '.amberframe_cache'), { recursive: true, force: true });
      if (code === 0) {
        const updated = getExportInfo(ep);
        renderJob.progress = 100;
        renderJob.completedFrames = updated.totalFrames;
        renderJob.totalFrames = updated.totalFrames;
        renderJob.mp4FileName = updated.mp4FileName;
        renderJob.mp4SizeMB = updated.mp4SizeMB;
        renderJob.error = null;
      } else {
        renderJob.error = stderrLog.trim() || `MP4 export exited with code ${code}`;
      }
    });

    child.on('error', (err) => {
      renderJob.running = false;
      renderJob.finishedAt = Date.now();
      renderJob.error = err.message;
    });

    res.status(202).json({ ok: true, started: true, ...renderJob });
  });

  app.get('/api/download-mp4', (req, res) => {
    const ep = sanitizeSlug(req.query.episode);
    const exp = getExportInfo(ep);
    if (!exp.mp4Ready) {
      res.status(404).json({ error: '1080p MP4 not rendered yet.' });
      return;
    }
    res.download(exp.mp4Path, exp.mp4FileName);
  });

  app.get('/api/download-zip', (_req, res) => {
    const activeZip = fs.existsSync(ZIP_PATH) ? ZIP_PATH : LEGACY_ZIP_PATH;
    if (!fs.existsSync(activeZip)) {
      res.status(404).json({ error: 'ZIP archive not built yet.' });
      return;
    }
    res.download(activeZip, path.basename(activeZip));
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AmberFrame Studio server listening on http://localhost:${PORT}`);
  });
}

startServer();

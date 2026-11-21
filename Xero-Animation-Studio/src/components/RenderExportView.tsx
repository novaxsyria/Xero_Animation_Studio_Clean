import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Download, Copy, Check, RefreshCw, Film } from 'lucide-react';
import { EpisodeSlug, ValidationResponse } from '../types/episode';

interface RenderExportViewProps {
  episodeSlug: EpisodeSlug;
  validation: ValidationResponse | null;
  onRefreshValidation: () => void;
}

interface RenderStatus {
  running: boolean;
  episodeSlug: string;
  progress: number;
  completedFrames: number;
  totalFrames: number;
  mp4FileName?: string;
  mp4SizeMB?: number;
  error?: string | null;
}

const COMMANDS = [
  {
    title: '1. Install Remotion Studio & Verify RTX 3060 NVENC',
    cmd: 'npm install\n.\\check_gpu.ps1',
  },
  {
    title: '2. Preview Interactive Remotion Studio (Port 3430)',
    cmd: 'npm run studio',
  },
  {
    title: '3. Render Crisp 1080p MP4 on Windows RTX 3060 (AmberFrame Default)',
    cmd: '.\\render_nvidia.ps1 -Episode KhizanatAlGhurfa',
  },
  {
    title: '4. Optional Headless Cloud MP4 Export (All Episodes)',
    cmd: 'node studio/scripts/export_mp4.mjs --episode=khizanat-al-ghurfa\n# Validate QC:\nnode studio/scripts/validate_amberframe.mjs',
  },
];

export const RenderExportView: React.FC<RenderExportViewProps> = ({
  episodeSlug,
  validation,
  onRefreshValidation,
}) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [renderingMp4, setRenderingMp4] = useState(false);
  const [renderStatus, setRenderStatus] = useState<RenderStatus | null>(null);
  const [videoRevision, setVideoRevision] = useState(0);

  const copyCmd = (idx: number, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1600);
  };

  useEffect(() => {
    if (!renderingMp4) return;
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/render-status?episode=${episodeSlug}`);
        const data = (await res.json()) as RenderStatus;
        if (!active) return;
        setRenderStatus(data);
        if (!data.running) {
          setRenderingMp4(false);
          setVideoRevision((v) => v + 1);
          onRefreshValidation();
        }
      } catch {
        // retry on next tick
      }
    };
    void poll();
    const timer = setInterval(() => void poll(), 900);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [renderingMp4, episodeSlug, onRefreshValidation]);

  const triggerReRender = async () => {
    setRenderingMp4(true);
    try {
      const res = await fetch(`/api/render-mp4?episode=${episodeSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episode: episodeSlug }),
      });
      const data = (await res.json()) as RenderStatus;
      setRenderStatus(data);
      if (!data.running) {
        setRenderingMp4(false);
        onRefreshValidation();
      }
    } catch {
      setRenderingMp4(false);
    }
  };

  const isKhizanat = episodeSlug === 'khizanat-al-ghurfa';
  const mp4FileName = validation?.mp4FileName || 'Khizanat_Al_Ghurfa_1080p.mp4';
  const resW = validation?.width ?? (isKhizanat ? 1080 : 1920);
  const resH = validation?.height ?? (isKhizanat ? 1920 : 1080);
  const isPortrait = resH > resW;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-4 items-start">
      {/* Left: Verified MP4 Preview/Download + Automated QC Report */}
      <div className="space-y-4">
        {isKhizanat ? (
          <div className="rounded-lg border border-slate-800/90 bg-[#111624] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>Rendered {isPortrait ? '9:16 Vertical' : '1080p'} Master MP4 — من داخل الخزانة</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  H.264 BT.709 ({resW}×{resH} @ 30 FPS · 18 Dynamic Shots) + -14 LUFS AAC stereo mix (Haas Spatial SFX + Bowed Score & Dead Silence).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerReRender}
                  disabled={renderingMp4}
                  className="h-9 px-3 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${renderingMp4 ? 'animate-spin' : ''}`} />
                  <span>
                    {renderingMp4
                      ? `Rendering ${renderStatus?.progress ?? 0}%`
                      : 'Re-render MP4'}
                  </span>
                </button>
                <a
                  href={`/api/download-mp4?episode=${episodeSlug}`}
                  download={mp4FileName}
                  className="h-9 px-4 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    Download MP4{validation?.mp4SizeMB ? ` (${validation.mp4SizeMB} MB)` : ''}
                  </span>
                </a>
              </div>
            </div>

            {renderingMp4 && renderStatus ? (
              <div className="rounded-md border border-amber-500/30 bg-[#0B0E17] p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono-tabular">
                  <span className="text-amber-300">Headless 1080p Render Active</span>
                  <span className="text-slate-300">
                    {renderStatus.completedFrames} / {renderStatus.totalFrames} frames ({renderStatus.progress}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${Math.max(3, renderStatus.progress)}%` }}
                  />
                </div>
              </div>
            ) : null}

            {renderStatus?.error ? (
              <div className="rounded-md border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-200">
                Render error: {renderStatus.error}
              </div>
            ) : null}

            {validation?.mp4Ready ? (
              <div className="rounded-md overflow-hidden border border-slate-800 bg-black flex justify-center">
                <video
                  key={videoRevision}
                  src={`/exports/${mp4FileName}?v=${videoRevision}`}
                  controls
                  preload="metadata"
                  className={isPortrait ? 'w-full max-w-[360px] aspect-[9/16]' : 'w-full aspect-video'}
                />
              </div>
            ) : null}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <div className="text-slate-400">Resolution</div>
                <div className="font-mono-tabular text-slate-100 font-semibold mt-0.5">
                  {resW} × {resH}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Frame Rate</div>
                <div className="font-mono-tabular text-slate-100 font-semibold mt-0.5">30 FPS</div>
              </div>
              <div>
                <div className="text-slate-400">Total Frames</div>
                <div className="font-mono-tabular text-slate-100 font-semibold mt-0.5">
                  {(validation?.totalFrames ?? 960).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Duration</div>
                <div className="font-mono-tabular text-slate-100 font-semibold mt-0.5">
                  00:{(validation?.durationSec ?? 32).toFixed(2).padStart(5, '0')}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border border-slate-800/90 bg-[#111624] p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Complete AmberFrame Remotion Studio Archive</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Includes reusable AmberFrame engine, both episodes (من داخل الخزانة + هل تعرف إنك تحلم؟), all SFX catalogs, audio stems, and CLI automation.
              </p>
            </div>
            <a
              href="/api/download-zip"
              download={validation?.zipFileName || 'AmberFrame_Studio_Complete_Project.zip'}
              className="h-9 px-4 rounded-md bg-slate-100 hover:bg-white text-slate-950 font-semibold text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>
                Download ZIP{validation?.zipSizeMB ? ` (${validation.zipSizeMB} MB)` : ''}
              </span>
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800/90 bg-[#111624] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Automated Production QC Report</h3>
            <button
              type="button"
              onClick={onRefreshValidation}
              className="h-7 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Re-run</span>
            </button>
          </div>
          <div className="divide-y divide-slate-800/70">
            {validation?.checks?.map((c) => (
              <div key={c.name} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2">
                  {c.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-medium text-slate-200">
                      {c.category ? `${c.category} · ` : ''}{c.name}
                    </div>
                    <div className="text-slate-400 mt-0.5">{c.detail}</div>
                  </div>
                </div>
                <span className={`font-mono-tabular font-semibold shrink-0 ${c.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {c.ok ? 'PASS' : 'FAIL'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Windows PowerShell & CLI Render Guide */}
      <div className="rounded-lg border border-slate-800/90 bg-[#111624] p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Windows 11 / RTX 3060 & CLI Render Workflow</h3>
          <p className="text-xs text-slate-400 mt-1">
            After extracting the Studio ZIP, run these commands in PowerShell or Node inside the studio directory:
          </p>
        </div>

        <div className="space-y-3">
          {COMMANDS.map((item, idx) => (
            <div key={idx} className="rounded-md border border-slate-800 bg-[#0B0E17] p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200">{item.title}</span>
                <button
                  type="button"
                  onClick={() => copyCmd(idx, item.cmd)}
                  className="text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                >
                  {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono-tabular text-amber-200/90 overflow-x-auto leading-relaxed">
                {item.cmd}
              </pre>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 leading-relaxed">
          Engine standards: A6 Amber Noir lighting discipline, volumetric moonlight, ShadowEntity rig, Haas binaural SFX, non-destructive VoiceFX, and BT.709 color tags.
        </div>
      </div>
    </div>
  );
};

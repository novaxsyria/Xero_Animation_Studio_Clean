import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Search, X } from 'lucide-react';
import { ShotFrame, Grade } from '@/studio/src/engine/core';
import { getShotsForSlug } from './EpisodeStage';
import { EPISODE_ACTS, EpisodeSlug, StoryboardScene } from '../types/episode';

interface StoryboardViewProps {
  episodeSlug: EpisodeSlug;
  width?: number;
  height?: number;
  storyboard: StoryboardScene[];
  onPlayScene: (frame: number) => void;
}

const SceneThumbnail: React.FC<{
  episodeSlug: EpisodeSlug;
  scene: StoryboardScene;
  width: number;
  height: number;
  eager?: boolean;
  modal?: boolean;
}> = ({ episodeSlug, scene, width, height, eager = false, modal = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);
  const isPortrait = height > width;

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  const shots = getShotsForSlug(episodeSlug);
  const Shot = shots[scene.sceneId];
  const len = Math.max(1, scene.endFrame - scene.startFrame);

  return (
    <div ref={ref} className="relative w-full bg-[#090D1A] overflow-hidden border-b border-slate-800/90 flex justify-center">
      <div className={isPortrait ? (modal ? 'relative w-full max-w-[320px] aspect-[9/16]' : 'relative w-full max-w-[230px] aspect-[9/16]') : 'relative w-full aspect-video'}>
        {visible && Shot ? (
          <>
            <ShotFrame width={width} height={height}>
              <Shot t={scene.keyFrame} len={len} f={scene.startFrame + scene.keyFrame} />
            </ShotFrame>
            <Grade f={scene.keyFrame} width={width} height={height} grain={false} vignette />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-mono-tabular text-slate-500">
            {scene.sceneId} · {scene.set}
          </div>
        )}
      </div>
    </div>
  );
};

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  episodeSlug,
  width = 1920,
  height = 1080,
  storyboard,
  onPlayScene,
}) => {
  const [actFilter, setActFilter] = useState<number>(0);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<StoryboardScene | null>(null);

  useEffect(() => {
    setActFilter(0);
    setSelected(null);
  }, [episodeSlug]);

  const acts = EPISODE_ACTS[episodeSlug];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return storyboard.filter((s) => {
      if (actFilter !== 0) {
        const meta = acts.find((a) => a.act === actFilter);
        if (meta && (s.startFrame < meta.startFrame || s.startFrame >= meta.endFrame)) return false;
      }
      if (!q) return true;
      return (
        s.sceneId.toLowerCase().includes(q) ||
        s.narrationSegment.toLowerCase().includes(q) ||
        s.sceneDescription.toLowerCase().includes(q) ||
        s.set.toLowerCase().includes(q)
      );
    });
  }, [storyboard, actFilter, query, acts]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800/90 bg-[#111624] p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActFilter(0)}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
              actFilter === 0 ? 'bg-amber-400 text-slate-950 font-semibold' : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All {storyboard.length} Scenes
          </button>
          {acts.map((a) => (
            <button
              key={a.act}
              type="button"
              onClick={() => setActFilter(a.act)}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                actFilter === a.act ? 'bg-amber-400 text-slate-950 font-semibold' : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scene, set, or Arabic text..."
            className="w-full h-9 pl-9 pr-3 rounded-md bg-[#0B0E17] border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, idx) => (
          <article
            key={item.sceneId}
            onClick={() => setSelected(item)}
            className="rounded-lg border border-slate-800/90 bg-[#111624] hover:border-amber-400/60 transition-colors overflow-hidden cursor-pointer flex flex-col"
          >
            <SceneThumbnail episodeSlug={episodeSlug} scene={item} width={width} height={height} eager={idx < 12} />
            <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-tabular font-semibold text-amber-400">
                    {item.sceneId} · {item.durationSec}s
                  </span>
                  <span className="font-mono-tabular text-slate-400">
                    {item.startTime} → {item.endTime}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {item.size} · {item.set} · f:{item.startFrame}–{item.endFrame}
                </p>
                <p className="font-arabic text-sm text-slate-100 leading-relaxed text-right line-clamp-2" dir="rtl">
                  {item.narrationSegment}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">{item.sfxEvents.length} SFX · {item.vfxEvents.length} VFX</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayScene(item.startFrame);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 bg-[#111624] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  Scene {selected.sceneId}
                </h3>
                <p className="text-xs text-slate-400 font-mono-tabular">
                  {selected.startTime} – {selected.endTime} · Frames {selected.startFrame}–{selected.endFrame} · {selected.size} · {selected.set}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onPlayScene(selected.startFrame);
                    setSelected(null);
                  }}
                  className="h-8 px-3 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play from Scene</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="h-8 w-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <SceneThumbnail episodeSlug={episodeSlug} scene={selected} width={width} height={height} eager modal />

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="md:col-span-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Narration Segment</div>
                <p className="font-arabic text-base text-amber-100 leading-relaxed text-right" dir="rtl">
                  {selected.narrationSegment}
                </p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Scene Description</div>
                <p className="font-arabic text-sm text-slate-200 leading-relaxed text-right" dir="rtl">
                  {selected.sceneDescription}
                </p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Camera Composition</div>
                <p className="text-slate-300 leading-relaxed">{selected.cameraComposition}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Character Animation</div>
                <p className="text-slate-300 leading-relaxed">{selected.characterAnimation}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Environment & Background</div>
                <p className="text-slate-300 leading-relaxed">{selected.backgroundEnvironment}</p>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">SFX Events</div>
                {selected.sfxEvents.length ? (
                  <ul className="space-y-1 font-mono-tabular text-amber-300">
                    {selected.sfxEvents.map((ev, i) => (
                      <li key={i}>{ev.clip} @ f:{ev.triggerFrame} ({ev.time}, gain {ev.gain})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">None</p>
                )}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">VFX Events & Status</div>
                <ul className="space-y-1 text-slate-300">
                  {selected.vfxEvents.map((v, i) => (
                    <li key={i}>• {v}</li>
                  ))}
                </ul>
                <p className="mt-2 text-emerald-400 font-medium">Status: {selected.status}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

import React, { useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Timeline, segAt } from '@/studio/src/engine/core';
import { EpisodeStage } from './EpisodeStage';
import { EPISODE_ACTS, EpisodeSlug, StoryboardScene, formatTimecode } from '../types/episode';

interface PlayerViewProps {
  episodeSlug: EpisodeSlug;
  timeline: Timeline;
  storyboard: StoryboardScene[];
  frame: number;
  setFrame: (f: number) => void;
  playing: boolean;
  setPlaying: (p: boolean) => void;
  voiceVol: number;
  setVoiceVol: (v: number) => void;
  sfxVol: number;
  setSfxVol: (v: number) => void;
  musicVol: number;
  setMusicVol: (v: number) => void;
  defaultLevels: { voice: number; sfx: number; music: number };
  voiceRef: React.RefObject<HTMLAudioElement | null>;
  sfxRef: React.RefObject<HTMLAudioElement | null>;
  musicRef: React.RefObject<HTMLAudioElement | null>;
  onSeekFrame: (f: number, autoPlay?: boolean) => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  episodeSlug,
  timeline,
  storyboard,
  frame,
  playing,
  setPlaying,
  voiceVol,
  setVoiceVol,
  sfxVol,
  setSfxVol,
  musicVol,
  setMusicVol,
  defaultLevels,
  voiceRef,
  sfxRef,
  musicRef,
  onSeekFrame,
}) => {
  const seg = useMemo(() => segAt(timeline, frame), [timeline, frame]);
  const sceneIdx = useMemo(
    () => storyboard.findIndex((s) => s.sceneId === seg.shot),
    [storyboard, seg.shot],
  );
  const scene = storyboard[Math.max(0, sceneIdx)];
  const acts = EPISODE_ACTS[episodeSlug];
  const currentAct = acts.find((a) => frame >= a.startFrame && frame < a.endFrame) ?? acts[0];

  useEffect(() => {
    if (voiceRef.current) voiceRef.current.volume = voiceVol;
    if (sfxRef.current) sfxRef.current.volume = sfxVol;
    if (musicRef.current) musicRef.current.volume = musicVol;
  }, [voiceVol, sfxVol, musicVol, voiceRef, sfxRef, musicRef]);

  const togglePlay = () => {
    if (!voiceRef.current || !sfxRef.current || !musicRef.current) return;
    if (playing) {
      voiceRef.current.pause();
      sfxRef.current.pause();
      musicRef.current.pause();
      setPlaying(false);
    } else {
      const targetTime = frame / timeline.fps;
      voiceRef.current.currentTime = targetTime;
      sfxRef.current.currentTime = targetTime;
      musicRef.current.currentTime = targetTime;
      void voiceRef.current.play();
      void sfxRef.current.play();
      void musicRef.current.play();
      setPlaying(true);
    }
  };

  const prevScene = () => {
    const idx = Math.max(0, sceneIdx - 1);
    onSeekFrame(storyboard[idx].startFrame);
  };

  const nextScene = () => {
    const idx = Math.min(storyboard.length - 1, sceneIdx + 1);
    onSeekFrame(storyboard[idx].startFrame);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 items-start">
      {/* Left: Stage + Timeline + Narration */}
      <div className="space-y-3">
        <div className="rounded-lg border border-slate-800/90 bg-[#080A14] overflow-hidden shadow-2xl">
          <EpisodeStage timeline={timeline} frame={frame} />
        </div>

        {/* Transport & Timeline Scrubber */}
        <div className="rounded-lg border border-slate-800/90 bg-[#111624] p-4 space-y-3">
          <div className="space-y-1.5">
            <input
              type="range"
              min={0}
              max={timeline.total - 1}
              value={frame}
              onChange={(e) => onSeekFrame(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              aria-label="Episode timeline scrubber"
            />
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono-tabular">
              <span>{formatTimecode(frame)} · Frame {frame.toLocaleString()}</span>
              <span>{currentAct.label} · {scene?.sceneId} / {storyboard.length}</span>
              <span>{formatTimecode(timeline.total)} · {timeline.total.toLocaleString()} frames</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevScene}
                className="h-9 px-2.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                title="Previous Scene"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                onClick={() => onSeekFrame(Math.max(0, frame - 30))}
                className="h-9 px-2 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center text-xs font-mono-tabular whitespace-nowrap shrink-0 cursor-pointer"
                title="Step back 1s"
              >
                <ChevronLeft className="w-3.5 h-3.5" />1s
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="h-9 px-4 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold flex items-center gap-1.5 text-sm whitespace-nowrap shrink-0 cursor-pointer transition-colors"
              >
                {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{playing ? 'Pause' : 'Play'}</span>
              </button>
              <button
                type="button"
                onClick={() => onSeekFrame(Math.min(timeline.total - 1, frame + 30))}
                className="h-9 px-2 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center text-xs font-mono-tabular whitespace-nowrap shrink-0 cursor-pointer"
                title="Step forward 1s"
              >
                1s<ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextScene}
                className="h-9 px-2.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                title="Next Scene"
              >
                <span>Next</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3-Stem Mixer */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              {[
                { label: 'Voice', val: voiceVol, set: setVoiceVol, def: defaultLevels.voice },
                { label: 'SFX', val: sfxVol, set: setSfxVol, def: defaultLevels.sfx },
                { label: 'Music', val: musicVol, set: setMusicVol, def: defaultLevels.music },
              ].map((st) => (
                <div key={st.label} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => st.set(st.val > 0 ? 0 : st.def)}
                    className="text-slate-400 hover:text-slate-100 cursor-pointer"
                    title={`Mute/unmute ${st.label}`}
                  >
                    {st.val > 0 ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                  <span className="text-slate-400 w-9">{st.label}</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={st.val}
                    onChange={(e) => st.set(Number(e.target.value))}
                    className="w-16 accent-amber-400 cursor-pointer h-1"
                  />
                  <span className="font-mono-tabular text-[11px] text-slate-400 w-8 text-right">
                    {Math.round(st.val * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Beat / Act Jump Bar */}
          <div className={`grid grid-cols-2 ${acts.length <= 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-6'} gap-1.5 pt-2 border-t border-slate-800/80`}>
            {acts.map((act) => {
              const active = frame >= act.startFrame && frame < act.endFrame;
              return (
                <button
                  key={act.act}
                  type="button"
                  onClick={() => onSeekFrame(act.startFrame)}
                  className={`px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-500/15 border border-amber-400/50 text-amber-200'
                      : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-mono-tabular font-semibold">{act.label}</div>
                  <div className="text-[11px] font-arabic truncate" dir="rtl">{act.ar}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Authoritative Arabic Narration Readout */}
        <div className="rounded-lg border border-slate-800/90 bg-[#111624] px-5 py-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1.5 font-mono-tabular">
            Active Narration · {scene?.sceneId} · {scene?.startTime} – {scene?.endTime}
          </div>
          <p className="font-arabic text-lg leading-relaxed text-amber-100/95 text-right" dir="rtl">
            {scene?.narrationSegment}
          </p>
        </div>
      </div>

      {/* Right: Live Scene Director Inspector */}
      <aside className="rounded-lg border border-slate-800/90 bg-[#111624] p-4 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-slate-100">
              Scene {scene?.sceneId}
            </h2>
            <span className="text-xs font-mono-tabular text-amber-400">
              {scene?.startFrame}–{scene?.endFrame} ({scene?.durationSec}s)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {scene?.size} · {scene?.set} · look: {scene?.look}
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="text-slate-400 uppercase tracking-wider text-[10px] mb-1">Description</div>
            <p className="font-arabic text-slate-200 text-sm leading-relaxed text-right" dir="rtl">
              {scene?.sceneDescription}
            </p>
          </div>
          <div>
            <div className="text-slate-400 uppercase tracking-wider text-[10px] mb-1">Camera Composition</div>
            <p className="text-slate-300 leading-relaxed">{scene?.cameraComposition}</p>
          </div>
          <div>
            <div className="text-slate-400 uppercase tracking-wider text-[10px] mb-1">Character Animation</div>
            <p className="text-slate-300 leading-relaxed">{scene?.characterAnimation}</p>
          </div>
          <div>
            <div className="text-slate-400 uppercase tracking-wider text-[10px] mb-1">Environment & Lighting</div>
            <p className="text-slate-300 leading-relaxed">{scene?.backgroundEnvironment}</p>
          </div>
          {scene?.voicePerspective ? (
            <div>
              <div className="text-slate-400 uppercase tracking-wider text-[10px] mb-1">Voice Perspective & Character FX</div>
              <p className="text-amber-300/95 font-mono-tabular">
                {scene.voicePerspective === 'telephone-caller'
                  ? 'telephone-caller · -2.2st · 480–2450Hz speaker · 100% wet'
                  : scene.voicePerspective === 'closet-horror-entity'
                    ? 'closet-horror-entity · -3.8st + -7st shadow · horror sting'
                    : scene.voicePerspective}
              </p>
            </div>
          ) : null}
          <div>
            <div className="text-slate-400 uppercase tracking-wider text-[10px] mb-1">VFX & Typography</div>
            <ul className="space-y-1 text-slate-300">
              {scene?.vfxEvents.map((v, i) => (
                <li key={i} className="truncate">• {v}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-slate-400 uppercase tracking-wider text-[10px] mb-1">Frame-Aligned SFX</div>
            {scene?.sfxEvents.length ? (
              <div className="space-y-1 font-mono-tabular text-slate-300">
                {scene.sfxEvents.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                    <span className="text-amber-300">{ev.clip}</span>
                    <span className="text-slate-400">f:{ev.triggerFrame} · {ev.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Ambient score bed</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

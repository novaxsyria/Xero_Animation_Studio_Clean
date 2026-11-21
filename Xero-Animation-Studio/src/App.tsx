import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Film, Grid, Music2, PackageCheck } from 'lucide-react';
import { Timeline } from '@/studio/src/engine/core';
import khizanatTimelineJson from '@/studio/src/episodes/khizanat-al-ghurfa/timeline.json';
import khizanatStoryboardJson from '@/studio/src/episodes/khizanat-al-ghurfa/storyboard.json';
import dreamTimelineJson from '@/studio/src/episodes/hal-taarif-innaka-tahlum/timeline.json';
import dreamStoryboardJson from '@/studio/src/episodes/hal-taarif-innaka-tahlum/storyboard.json';
import { EpisodeSlug, StoryboardScene, ValidationResponse, formatTimecode } from './types/episode';
import { PlayerView } from './components/PlayerView';
import { StoryboardView } from './components/StoryboardView';
import { AudioSfxView } from './components/AudioSfxView';
import { RenderExportView } from './components/RenderExportView';

type StudioTab = 'player' | 'storyboard' | 'audio' | 'export';

const EPISODE_DATA: Record<
  EpisodeSlug,
  {
    title: string;
    timeline: Timeline;
    storyboard: StoryboardScene[];
    audioSrc: { voice: string; sfx: string; music: string };
    defaultLevels: { voice: number; sfx: number; music: number };
  }
> = {
  'khizanat-al-ghurfa': {
    title: 'من داخل الخزانة',
    timeline: khizanatTimelineJson as Timeline,
    storyboard: khizanatStoryboardJson as StoryboardScene[],
    audioSrc: {
      voice: '/khizanat-al-ghurfa-voice.mp3',
      sfx: '/khizanat-al-ghurfa-sfx.mp3',
      music: '/khizanat-al-ghurfa-music.mp3',
    },
    defaultLevels: { voice: 1.0, sfx: 0.88, music: 0.65 },
  },
  'hal-taarif-innaka-tahlum': {
    title: 'هل تعرف إنك تحلم؟',
    timeline: dreamTimelineJson as Timeline,
    storyboard: dreamStoryboardJson as StoryboardScene[],
    audioSrc: {
      voice: '/hal-taarif-innaka-tahlum-voice.mp3',
      sfx: '/hal-taarif-innaka-tahlum-sfx.mp3',
      music: '/hal-taarif-innaka-tahlum-music.mp3',
    },
    defaultLevels: { voice: 1.0, sfx: 0.13, music: 0.05 },
  },
};

export default function App() {
  const [episodeSlug, setEpisodeSlug] = useState<EpisodeSlug>('khizanat-al-ghurfa');
  const [tab, setTab] = useState<StudioTab>('player');
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voiceVol, setVoiceVol] = useState(1.0);
  const [sfxVol, setSfxVol] = useState(0.88);
  const [musicVol, setMusicVol] = useState(0.65);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);

  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const active = EPISODE_DATA[episodeSlug];

  const loadValidation = useCallback(() => {
    fetch(`/api/project-validation?episode=${episodeSlug}`)
      .then((r) => r.json())
      .then((d: ValidationResponse) => setValidation(d))
      .catch(() => {});
  }, [episodeSlug]);

  useEffect(() => {
    loadValidation();
  }, [loadValidation]);

  const switchEpisode = (slug: EpisodeSlug) => {
    if (slug === episodeSlug) return;
    if (voiceRef.current) voiceRef.current.pause();
    if (sfxRef.current) sfxRef.current.pause();
    if (musicRef.current) musicRef.current.pause();
    setPlaying(false);
    setFrame(0);
    setEpisodeSlug(slug);
    const defs = EPISODE_DATA[slug].defaultLevels;
    setVoiceVol(defs.voice);
    setSfxVol(defs.sfx);
    setMusicVol(defs.music);
  };

  // Synchronize SVG stage frame directly with authoritative voiceover audio clock
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const v = voiceRef.current;
      if (v) {
        const f = Math.min(active.timeline.total - 1, Math.round(v.currentTime * active.timeline.fps));
        setFrame(f);
        if (sfxRef.current && Math.abs(sfxRef.current.currentTime - v.currentTime) > 0.08) {
          sfxRef.current.currentTime = v.currentTime;
        }
        if (musicRef.current && Math.abs(musicRef.current.currentTime - v.currentTime) > 0.08) {
          musicRef.current.currentTime = v.currentTime;
        }
        if (v.ended) {
          setPlaying(false);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, active.timeline]);

  const seekFrame = useCallback(
    (targetFrame: number, autoPlay = false) => {
      const clamped = Math.max(0, Math.min(active.timeline.total - 1, Math.round(targetFrame)));
      setFrame(clamped);
      const sec = clamped / active.timeline.fps;
      if (voiceRef.current) voiceRef.current.currentTime = sec;
      if (sfxRef.current) sfxRef.current.currentTime = sec;
      if (musicRef.current) musicRef.current.currentTime = sec;
      if (autoPlay && voiceRef.current && sfxRef.current && musicRef.current) {
        void voiceRef.current.play();
        void sfxRef.current.play();
        void musicRef.current.play();
        setPlaying(true);
      }
    },
    [active.timeline],
  );

  const jumpAndPlay = (targetFrame: number) => {
    setTab('player');
    seekFrame(targetFrame, true);
  };

  return (
    <div className="min-h-screen bg-[#0B0E17] text-slate-100 flex flex-col">
      {/* Hidden synchronized 3-stem audio elements */}
      <audio key={`${episodeSlug}-v`} ref={voiceRef} src={active.audioSrc.voice} preload="metadata" />
      <audio key={`${episodeSlug}-s`} ref={sfxRef} src={active.audioSrc.sfx} preload="metadata" />
      <audio key={`${episodeSlug}-m`} ref={musicRef} src={active.audioSrc.music} preload="metadata" />

      {/* 3-Zone Top Studio Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-[#0B0E17]/95 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Zone 1: Brand & Active Episode Metadata (Unboxed Text) */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="font-semibold tracking-tight text-sm text-white whitespace-nowrap">
              AmberFrame Studio
            </div>
            <span className="text-slate-600">·</span>
            <div className="font-arabic text-sm font-bold text-amber-300 truncate" dir="rtl">
              {active.title}
            </div>
            <span className="hidden md:inline text-xs font-mono-tabular text-slate-400 whitespace-nowrap">
              · {formatTimecode(active.timeline.total)} · {active.storyboard.length} Scenes
            </span>
          </div>

          {/* Zone 2: Primary View Tabs */}
          <nav className="flex items-center gap-1">
            {[
              { id: 'player' as const, label: 'Player', icon: Film },
              { id: 'storyboard' as const, label: 'Storyboard', icon: Grid },
              { id: 'audio' as const, label: 'Audio & SFX', icon: Music2 },
              { id: 'export' as const, label: 'Render & Export', icon: PackageCheck },
            ].map((item) => {
              const Icon = item.icon;
              const activeTab = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`h-8 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    activeTab
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-400/40'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Output Download CTA */}
          {episodeSlug === 'khizanat-al-ghurfa' ? (
            <a
              href="/api/download-mp4"
              download="Khizanat_Al_Ghurfa_1080p.mp4"
              className="h-8 px-3 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download MP4</span>
            </a>
          ) : (
            <a
              href="/api/download-zip"
              download={validation?.zipFileName || 'AmberFrame_Studio_Complete_Project.zip'}
              className="h-8 px-3 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </a>
          )}
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 space-y-4">
        {/* Production Switcher Toolbar (below Top Bar) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800/90 bg-[#111624] px-3.5 py-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 mr-1">Production</span>
            <button
              type="button"
              onClick={() => switchEpisode('khizanat-al-ghurfa')}
              className={`h-7 px-3 rounded text-xs font-arabic flex items-center gap-2 cursor-pointer transition-colors ${
                episodeSlug === 'khizanat-al-ghurfa'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
              }`}
              dir="rtl"
            >
              <span>من داخل الخزانة</span>
              <span className="font-mono-tabular text-[11px] opacity-80" dir="ltr">
                {formatTimecode(EPISODE_DATA['khizanat-al-ghurfa'].timeline.total)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => switchEpisode('hal-taarif-innaka-tahlum')}
              className={`h-7 px-3 rounded text-xs font-arabic flex items-center gap-2 cursor-pointer transition-colors ${
                episodeSlug === 'hal-taarif-innaka-tahlum'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
              }`}
              dir="rtl"
            >
              <span>هل تعرف إنك تحلم؟</span>
              <span className="font-mono-tabular text-[11px] opacity-80" dir="ltr">09:42.93</span>
            </button>
          </div>
          <div className="text-xs text-slate-400 font-mono-tabular">
            {episodeSlug === 'khizanat-al-ghurfa'
              ? `A6 Amber Noir · ${active.timeline.width ?? 1080}×${active.timeline.height ?? 1920} · 9:16 Vertical · 30 FPS`
              : 'Full Episode Archive · 70 Scenes · 17,488 Frames'}
          </div>
        </div>

        {tab === 'player' ? (
          <PlayerView
            episodeSlug={episodeSlug}
            timeline={active.timeline}
            storyboard={active.storyboard}
            frame={frame}
            setFrame={setFrame}
            playing={playing}
            setPlaying={setPlaying}
            voiceVol={voiceVol}
            setVoiceVol={setVoiceVol}
            sfxVol={sfxVol}
            setSfxVol={setSfxVol}
            musicVol={musicVol}
            setMusicVol={setMusicVol}
            defaultLevels={active.defaultLevels}
            voiceRef={voiceRef}
            sfxRef={sfxRef}
            musicRef={musicRef}
            onSeekFrame={seekFrame}
          />
        ) : null}

        {tab === 'storyboard' ? (
          <StoryboardView
            episodeSlug={episodeSlug}
            width={active.timeline.width ?? 1920}
            height={active.timeline.height ?? 1080}
            storyboard={active.storyboard}
            onPlayScene={jumpAndPlay}
          />
        ) : null}

        {tab === 'audio' ? (
          <AudioSfxView episodeSlug={episodeSlug} storyboard={active.storyboard} onPlayAtFrame={jumpAndPlay} />
        ) : null}

        {tab === 'export' ? (
          <RenderExportView
            episodeSlug={episodeSlug}
            validation={validation}
            onRefreshValidation={loadValidation}
          />
        ) : null}
      </main>
    </div>
  );
}

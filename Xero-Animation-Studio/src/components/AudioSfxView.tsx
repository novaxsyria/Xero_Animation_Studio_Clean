import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Volume2 } from 'lucide-react';
import { EpisodeSlug, SfxLibraryItem, StoryboardScene } from '../types/episode';

interface AudioSfxViewProps {
  episodeSlug: EpisodeSlug;
  storyboard: StoryboardScene[];
  onPlayAtFrame: (frame: number) => void;
}

export const AudioSfxView: React.FC<AudioSfxViewProps> = ({ episodeSlug, storyboard, onPlayAtFrame }) => {
  const [sfxItems, setSfxItems] = useState<SfxLibraryItem[]>([]);
  const [activeClip, setActiveClip] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch(`/api/sfx-list?episode=${episodeSlug}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.items)) setSfxItems(d.items);
      })
      .catch(() => {});
  }, [episodeSlug]);

  const allEvents = useMemo(
    () =>
      storyboard.flatMap((sc) =>
        sc.sfxEvents.map((ev) => ({
          sceneId: sc.sceneId,
          act: sc.act,
          ...ev,
        })),
      ),
    [storyboard],
  );

  const auditionClip = (clipName: string) => {
    const match = sfxItems.find((it) => it.clip === clipName || it.file.startsWith(clipName));
    if (!match) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const a = new Audio(match.url);
    audioRef.current = a;
    setActiveClip(match.clip);
    a.onended = () => setActiveClip(null);
    void a.play();
  };

  const stems =
    episodeSlug === 'khizanat-al-ghurfa'
      ? [
          {
            title: 'Master Narration & Character FX',
            file: 'voice.mp3 · 32.00s',
            detail:
              'Preserves authoritative 30.792s Arabic narrator cleanly, transforming caller warning (21.90s–24.06s) to 100% wet telephone-caller (-2.2st · 480–2450Hz) and closet twist (28.90s–30.52s) to deep closet-horror-entity (-3.8st + -7st sub double).',
            accent: 'text-sky-400',
          },
          {
            title: 'Haas Spatial Stereo SFX & Horror Sting',
            file: 'sfx.mp3 · 32.00s',
            detail: `${allEvents.length} frame-accurate binaural cues including occluded breath, 5 unique wood footsteps, sub-riser swell, phone buzz/static, door groan, and post-dialogue horror_sting_climax (f915).`,
            accent: 'text-amber-400',
          },
          {
            title: 'Dynamic Bowed Score & Dead Silence',
            file: 'music.mp3 · 32.00s',
            detail:
              'Multi-harmonic D-minor bowed strings + reactive heartbeat ducked smoothly beneath speech, dropping to dead silence (21.82s–28.85s) before detonating at f915.',
            accent: 'text-emerald-400',
          },
        ]
      : [
          {
            title: 'Master Narration Stem',
            file: 'voice.mp3 · 582.93s',
            detail: 'Original unedited Arabic narration · 44.1kHz stereo · Authority master timeline',
            accent: 'text-sky-400',
          },
          {
            title: 'Frame-Aligned SFX Stem',
            file: 'sfx.mp3 · 582.95s',
            detail: `${allEvents.length} exact scene triggers · Triple knocks, Oud melody, Hypnic Jerk, EOG beeps, Dawn birds`,
            accent: 'text-amber-400',
          },
          {
            title: 'Intro-Only Music Score',
            file: 'music.mp3 · 582.95s',
            detail: 'Original Act I intro music (00:00 → 00:10) at 5% mix; SFX at 13%; Voice at 100%',
            accent: 'text-emerald-400',
          },
        ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stems.map((stem) => (
          <div key={stem.title} className="rounded-lg border border-slate-800/90 bg-[#111624] p-4 space-y-1.5">
            <div className={`text-sm font-semibold ${stem.accent}`}>{stem.title}</div>
            <div className="text-xs font-mono-tabular text-slate-400">{stem.file}</div>
            <p className="text-xs text-slate-300 leading-relaxed">{stem.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        <div className="rounded-lg border border-slate-800/90 bg-[#111624] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Frame-Aligned SFX Cue Sheet ({allEvents.length} Events)</h3>
            <span className="text-xs text-slate-400">Click clip to audition or jump</span>
          </div>
          <div className="max-h-[540px] overflow-y-auto divide-y divide-slate-800/70">
            {allEvents.map((ev, i) => (
              <div key={`${ev.sceneId}-${ev.triggerFrame}-${i}`} className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/35">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono-tabular text-amber-400 w-9 shrink-0">{ev.sceneId}</span>
                  <span className="font-mono-tabular text-slate-400 w-16 shrink-0">{ev.time}</span>
                  <span className="font-mono-tabular text-slate-500 w-14 shrink-0">f:{ev.triggerFrame}</span>
                  <span className="font-mono-tabular text-slate-200 truncate">{ev.clip}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => auditionClip(ev.clip)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Hear</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPlayAtFrame(ev.triggerFrame)}
                    className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Jump</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800/90 bg-[#111624] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">SFX Library ({sfxItems.length} Clips)</h3>
            <span className="text-xs font-mono-tabular text-slate-400">
              {episodeSlug === 'khizanat-al-ghurfa' ? 'library/sfx/amberframe' : 'library/sfx'}
            </span>
          </div>
          <div className="max-h-[540px] overflow-y-auto divide-y divide-slate-800/70">
            {sfxItems.map((it) => (
              <div key={it.file} className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-800/35">
                <div className="min-w-0">
                  <div className="font-mono-tabular text-slate-200 truncate">{it.clip}</div>
                  {it.purpose ? (
                    <div className="text-[11px] text-slate-400 truncate">{it.category} · {it.purpose}</div>
                  ) : null}
                  <div className="text-[11px] font-mono-tabular text-slate-500">{it.file} · {it.sizeKB} KB</div>
                </div>
                <button
                  type="button"
                  onClick={() => auditionClip(it.clip)}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 shrink-0 cursor-pointer ${
                    activeClip === it.clip ? 'bg-amber-400 text-slate-950 font-semibold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{activeClip === it.clip ? 'Playing' : 'Play'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import { Pause, Play, Volume2, X } from "lucide-react";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { resolveAssetPath } from "./data";
import type { SongStory } from "./types";

interface AudioContextValue {
  currentTrack: SongStory | null;
  playing: boolean;
  volume: number;
  playTrack: (track: SongStory) => Promise<boolean>;
  toggle: () => Promise<void>;
  stop: () => void;
  setVolume: (volume: number) => void;
}

const VOLUME_KEY = "birthdayJourney:v1:volume";
const AudioContext = createContext<AudioContextValue | null>(null);

function initialVolume() {
  const stored = Number(localStorage.getItem(VOLUME_KEY));
  return Number.isFinite(stored) && stored >= 0 && stored <= 1 ? stored : .65;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState<SongStory | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(initialVolume);

  const playTrack = useCallback(async (track: SongStory) => {
    if (!track.audioPath || !audioRef.current) return false;
    const audio = audioRef.current;
    const nextSource = new URL(resolveAssetPath(track.audioPath), window.location.href).href;
    if (audio.src !== nextSource) {
      audio.src = nextSource;
      audio.load();
    }
    audio.volume = volume;
    setCurrentTrack(track);
    try {
      await audio.play();
      return true;
    } catch {
      setPlaying(false);
      return false;
    }
  }, [volume]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (audio.paused) {
      try { await audio.play(); } catch { setPlaying(false); }
    } else audio.pause();
  }, [currentTrack]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
    setCurrentTrack(null);
  }, []);

  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = Math.max(0, Math.min(1, nextVolume));
    if (audioRef.current) audioRef.current.volume = safeVolume;
    localStorage.setItem(VOLUME_KEY, String(safeVolume));
    setVolumeState(safeVolume);
  }, []);

  const value = useMemo(() => ({ currentTrack, playing, volume, playTrack, toggle, stop, setVolume }), [currentTrack, playTrack, playing, setVolume, stop, toggle, volume]);

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const value = useContext(AudioContext);
  if (!value) throw new Error("useAudio must be used within AudioProvider");
  return value;
}

export function GlobalAudioDock() {
  const { currentTrack, playing, volume, toggle, stop, setVolume } = useAudio();
  if (!currentTrack) return null;
  return (
    <aside className="audio-dock" aria-label="Now playing">
      <button className="audio-dock__play" onClick={toggle} aria-label={playing ? "Pause music" : "Resume music"}>
        {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
      </button>
      <div><small>Our soundtrack</small><strong>{currentTrack.title}</strong><span>{currentTrack.artist}</span></div>
      <label><Volume2 size={15} /><span className="sr-only">Volume</span><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
      <button className="audio-dock__close" onClick={stop} aria-label="Stop music"><X size={17} /></button>
    </aside>
  );
}

import { Pause, Play, Volume2, X } from "lucide-react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { resolveAssetPath, songs } from "./data";
import type { SongStory } from "./types";

interface AudioContextValue {
  currentTrack: SongStory | null;
  enabled: boolean;
  playing: boolean;
  volume: number;
  playTrack: (track: SongStory) => Promise<boolean>;
  toggle: () => Promise<void>;
  stop: () => void;
  setVolume: (volume: number) => void;
}

const VOLUME_KEY = "birthdayJourney:v1:volume";
const ENABLED_KEY = "birthdayJourney:v1:soundtrack-enabled";
const AudioContext = createContext<AudioContextValue | null>(null);
const openingSong = songs.find((song) => song.opening && song.audioPath);
const shuffledSongs = songs.filter((song) => song.audioPath && !song.opening && song.shuffle !== false);

function initialVolume() {
  const stored = Number(localStorage.getItem(VOLUME_KEY));
  return Number.isFinite(stored) && stored >= 0 && stored <= 1 ? stored : .65;
}

function initialEnabled() {
  return localStorage.getItem(ENABLED_KEY) !== "false";
}

export function isPlayableTrack(track: SongStory) {
  return Boolean(track.audioPath);
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrackRef = useRef<SongStory | null>(null);
  const enabledRef = useRef(initialEnabled());
  const playingRef = useRef(false);
  const volumeRef = useRef(initialVolume());
  const openingPlayedRef = useRef(false);
  const queueRef = useRef<SongStory[]>([]);
  const playRandomRef = useRef<() => Promise<boolean>>(async () => false);
  const playOpeningRef = useRef<() => Promise<boolean>>(async () => false);

  const [currentTrack, setCurrentTrackState] = useState<SongStory | null>(null);
  const [enabled, setEnabledState] = useState(enabledRef.current);
  const [playing, setPlayingState] = useState(false);
  const [volume, setVolumeState] = useState(volumeRef.current);

  const setCurrentTrack = useCallback((track: SongStory | null) => {
    currentTrackRef.current = track;
    setCurrentTrackState(track);
  }, []);

  const setPlaying = useCallback((nextPlaying: boolean) => {
    playingRef.current = nextPlaying;
    setPlayingState(nextPlaying);
  }, []);

  const setEnabled = useCallback((nextEnabled: boolean) => {
    enabledRef.current = nextEnabled;
    localStorage.setItem(ENABLED_KEY, String(nextEnabled));
    setEnabledState(nextEnabled);
  }, []);

  const playTrack = useCallback(async (track: SongStory) => {
    const audio = audioRef.current;
    if (!track.audioPath || !audio) return false;

    setEnabled(true);
    setCurrentTrack(track);
    if (track.opening) openingPlayedRef.current = true;

    const nextSource = new URL(resolveAssetPath(track.audioPath), window.location.href).href;
    if (audio.src !== nextSource) {
      audio.src = nextSource;
      audio.load();
    }
    audio.volume = volumeRef.current;
    try {
      await audio.play();
      return true;
    } catch {
      setPlaying(false);
      return false;
    }
  }, [setCurrentTrack, setEnabled, setPlaying]);

  const playRandom = useCallback(async () => {
    if (!shuffledSongs.length) return false;
    if (!queueRef.current.length) {
      queueRef.current = shuffle(shuffledSongs);
      const currentId = currentTrackRef.current?.id;
      if (queueRef.current.length > 1 && queueRef.current[0]?.id === currentId) {
        [queueRef.current[0], queueRef.current[1]] = [queueRef.current[1], queueRef.current[0]];
      }
    }
    const nextTrack = queueRef.current.shift();
    return nextTrack ? playTrack(nextTrack) : false;
  }, [playTrack]);

  const playOpening = useCallback(async () => {
    if (openingSong && !openingPlayedRef.current) return playTrack(openingSong);
    return playRandom();
  }, [playRandom, playTrack]);

  playRandomRef.current = playRandom;
  playOpeningRef.current = playOpening;

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!currentTrackRef.current) {
      setEnabled(true);
      await playOpeningRef.current();
      return;
    }

    if (playingRef.current) {
      setEnabled(false);
      audio?.pause();
      setPlaying(false);
      return;
    }

    setEnabled(true);
    if (audio) {
      try { await audio.play(); } catch { setPlaying(false); }
    }
  }, [setEnabled, setPlaying]);

  const stop = useCallback(() => {
    setEnabled(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    setPlaying(false);
    setCurrentTrack(null);
  }, [setCurrentTrack, setEnabled, setPlaying]);

  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = Math.max(0, Math.min(1, nextVolume));
    volumeRef.current = safeVolume;
    if (audioRef.current) audioRef.current.volume = safeVolume;
    localStorage.setItem(VOLUME_KEY, String(safeVolume));
    setVolumeState(safeVolume);
  }, []);

  useEffect(() => {
    const beginOnFirstInteraction = (event: MouseEvent | KeyboardEvent) => {
      if (!enabledRef.current || playingRef.current) return;
      if (event.target instanceof Element && event.target.closest("[data-audio-control]")) return;
      const track = currentTrackRef.current;
      if (track && audioRef.current) void audioRef.current.play().catch(() => setPlaying(false));
      else void playOpeningRef.current();
    };

    document.addEventListener("click", beginOnFirstInteraction, { passive: true });
    document.addEventListener("keydown", beginOnFirstInteraction);
    return () => {
      document.removeEventListener("click", beginOnFirstInteraction);
      document.removeEventListener("keydown", beginOnFirstInteraction);
    };
  }, [setPlaying]);

  const value = useMemo(() => ({ currentTrack, enabled, playing, volume, playTrack, toggle, stop, setVolume }), [currentTrack, enabled, playTrack, playing, setVolume, stop, toggle, volume]);

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          if (enabledRef.current) void playRandomRef.current();
        }}
        onError={() => {
          setPlaying(false);
          if (enabledRef.current && currentTrackRef.current) void playRandomRef.current();
        }}
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const value = useContext(AudioContext);
  if (!value) throw new Error("useAudio must be used within AudioProvider");
  return value;
}

export function GlobalAudioDock() {
  const { currentTrack, enabled, playing, volume, toggle, stop, setVolume } = useAudio();
  if (!currentTrack) return null;
  return (
    <aside className="audio-dock" aria-label="Now playing">
      <button data-audio-control className="audio-dock__play" onClick={() => void toggle()} aria-label={playing ? "Pause music" : "Resume music"}>
        {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
      </button>
      <div><small>{enabled ? "Shuffle soundtrack" : "Soundtrack paused"}</small><strong>{currentTrack.title}</strong><span>{currentTrack.artist}</span></div>
      <label><Volume2 size={15} /><span className="sr-only">Volume</span><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
      <button data-audio-control className="audio-dock__close" onClick={stop} aria-label="Stop music"><X size={17} /></button>
    </aside>
  );
}

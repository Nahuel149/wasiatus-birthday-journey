import { Pause, Play, Volume2, X } from "lucide-react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { resolveAssetPath, songs } from "./data";
import type { SongStory } from "./types";

interface YouTubePlayer {
  destroy: () => void;
  loadVideoById: (videoId: string) => void;
  pauseVideo: () => void;
  playVideo: () => void;
  setVolume: (volume: number) => void;
  stopVideo: () => void;
}

interface YouTubeNamespace {
  Player: new (element: HTMLElement, options: {
    videoId: string;
    width: number;
    height: number;
    playerVars: Record<string, number | string>;
    events: {
      onReady: (event: { target: YouTubePlayer }) => void;
      onStateChange: (event: { data: number }) => void;
    };
  }) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

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
let youtubeApiPromise: Promise<YouTubeNamespace> | null = null;

function initialVolume() {
  const stored = Number(localStorage.getItem(VOLUME_KEY));
  return Number.isFinite(stored) && stored >= 0 && stored <= 1 ? stored : .65;
}

function initialEnabled() {
  return localStorage.getItem(ENABLED_KEY) !== "false";
}

export function getYouTubeVideoId(track: SongStory) {
  return track.externalUrl?.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1] ?? null;
}

export function isPlayableTrack(track: SongStory) {
  return Boolean(track.audioPath || getYouTubeVideoId(track));
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YouTubeNamespace>((resolve, reject) => {
    window.onYouTubeIframeAPIReady = () => {
      if (window.YT?.Player) resolve(window.YT);
      else reject();
    };

    const existingScript = document.getElementById("youtube-iframe-api") as HTMLScriptElement | null;
    if (existingScript) return;
    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      youtubeApiPromise = null;
      reject();
    };
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

const shuffledSongs = songs.filter((song) => song.shuffle !== false && isPlayableTrack(song));

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const youtubeHostRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const youtubeReadyRef = useRef(false);
  const loadedVideoIdRef = useRef<string | null>(null);
  const requestedPlayingRef = useRef(false);
  const currentTrackRef = useRef<SongStory | null>(null);
  const enabledRef = useRef(initialEnabled());
  const playingRef = useRef(false);
  const volumeRef = useRef(initialVolume());
  const queueRef = useRef<SongStory[]>([]);
  const playRandomRef = useRef<() => Promise<boolean>>(async () => false);

  const [currentTrack, setCurrentTrackState] = useState<SongStory | null>(null);
  const [enabled, setEnabledState] = useState(enabledRef.current);
  const [playing, setPlayingState] = useState(false);
  const [volume, setVolumeState] = useState(volumeRef.current);
  const currentYouTubeId = currentTrack ? getYouTubeVideoId(currentTrack) : null;

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

  const syncYouTubeTrack = useCallback((track: SongStory) => {
    const videoId = getYouTubeVideoId(track);
    const player = youtubePlayerRef.current;
    if (!videoId || !player || !youtubeReadyRef.current) return;
    player.setVolume(volumeRef.current * 100);
    if (loadedVideoIdRef.current === videoId) player.playVideo();
    else {
      loadedVideoIdRef.current = videoId;
      player.loadVideoById(videoId);
    }
  }, []);

  const playTrack = useCallback(async (track: SongStory) => {
    const audio = audioRef.current;
    const videoId = getYouTubeVideoId(track);
    if (!track.audioPath && !videoId) return false;

    setEnabled(true);
    setCurrentTrack(track);
    requestedPlayingRef.current = true;

    if (track.audioPath && audio) {
      youtubePlayerRef.current?.pauseVideo();
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
    }

    audio?.pause();
    if (videoId) syncYouTubeTrack(track);
    return true;
  }, [setCurrentTrack, setEnabled, setPlaying, syncYouTubeTrack]);

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

  playRandomRef.current = playRandom;

  const toggle = useCallback(async () => {
    const track = currentTrackRef.current;
    const audio = audioRef.current;
    if (!track) {
      setEnabled(true);
      await playRandomRef.current();
      return;
    }

    if (playingRef.current) {
      requestedPlayingRef.current = false;
      setEnabled(false);
      if (track.audioPath) audio?.pause();
      else youtubePlayerRef.current?.pauseVideo();
      setPlaying(false);
      return;
    }

    requestedPlayingRef.current = true;
    setEnabled(true);
    if (track.audioPath && audio) {
      try { await audio.play(); } catch { setPlaying(false); }
    } else syncYouTubeTrack(track);
  }, [setEnabled, setPlaying, syncYouTubeTrack]);

  const stop = useCallback(() => {
    requestedPlayingRef.current = false;
    setEnabled(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    youtubePlayerRef.current?.stopVideo();
    setPlaying(false);
    setCurrentTrack(null);
  }, [setCurrentTrack, setEnabled, setPlaying]);

  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = Math.max(0, Math.min(1, nextVolume));
    volumeRef.current = safeVolume;
    if (audioRef.current) audioRef.current.volume = safeVolume;
    youtubePlayerRef.current?.setVolume(safeVolume * 100);
    localStorage.setItem(VOLUME_KEY, String(safeVolume));
    setVolumeState(safeVolume);
  }, []);

  useEffect(() => {
    if (import.meta.env.MODE === "test" || !youtubeHostRef.current || !shuffledSongs.length) return;
    let cancelled = false;
    const initialTrack = shuffledSongs[Math.floor(Math.random() * shuffledSongs.length)];
    const initialVideoId = getYouTubeVideoId(initialTrack);
    if (!initialVideoId) return;

    void loadYouTubeApi().then((youtube) => {
      if (cancelled || !youtubeHostRef.current) return;
      youtubePlayerRef.current = new youtube.Player(youtubeHostRef.current, {
        videoId: initialVideoId,
        width: 200,
        height: 200,
        playerVars: { autoplay: 0, controls: 1, playsinline: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: ({ target }) => {
            youtubeReadyRef.current = true;
            loadedVideoIdRef.current = initialVideoId;
            target.setVolume(volumeRef.current * 100);
            const requestedTrack = currentTrackRef.current;
            if (requestedPlayingRef.current && requestedTrack) syncYouTubeTrack(requestedTrack);
          },
          onStateChange: ({ data }) => {
            if (data === 1) setPlaying(true);
            if (data === 2) setPlaying(false);
            if (data === 0) {
              setPlaying(false);
              if (enabledRef.current) void playRandomRef.current();
            }
          },
        },
      });
    }).catch(() => setPlaying(false));

    return () => {
      cancelled = true;
      youtubePlayerRef.current?.destroy();
      youtubePlayerRef.current = null;
      youtubeReadyRef.current = false;
    };
  }, [setPlaying, syncYouTubeTrack]);

  useEffect(() => {
    const beginOnFirstInteraction = (event: MouseEvent | KeyboardEvent) => {
      if (!enabledRef.current || playingRef.current) return;
      if (event.target instanceof Element && event.target.closest("[data-audio-control]")) return;
      const track = currentTrackRef.current;
      if (track) {
        requestedPlayingRef.current = true;
        if (track.audioPath && audioRef.current) void audioRef.current.play().catch(() => setPlaying(false));
        else syncYouTubeTrack(track);
      } else void playRandomRef.current();
    };

    document.addEventListener("click", beginOnFirstInteraction, { passive: true });
    document.addEventListener("keydown", beginOnFirstInteraction);
    return () => {
      document.removeEventListener("click", beginOnFirstInteraction);
      document.removeEventListener("keydown", beginOnFirstInteraction);
    };
  }, [setPlaying, syncYouTubeTrack]);

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
      />
      <aside className={`youtube-soundtrack ${currentYouTubeId ? "is-visible" : ""}`} aria-hidden={!currentYouTubeId}>
        <div ref={youtubeHostRef} />
      </aside>
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

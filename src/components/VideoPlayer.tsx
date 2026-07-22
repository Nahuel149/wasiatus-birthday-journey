import { Film } from "lucide-react";
import type { SyntheticEvent } from "react";
import { useAudio } from "../audio";
import { resolveAssetPath } from "../data";
import type { VideoItem } from "../types";

interface VideoPlayerProps {
  video: VideoItem;
  cinematic?: boolean;
  onPlay?: () => void;
}

export function VideoPlayer({ video, cinematic = false, onPlay }: VideoPlayerProps) {
  const portrait = video.height > video.width;
  const { playing: soundtrackPlaying, toggle: toggleSoundtrack } = useAudio();
  const handlePlay = (event: SyntheticEvent<HTMLVideoElement>) => {
    document.querySelectorAll("video").forEach((player) => {
      if (player !== event.currentTarget) player.pause();
    });
    if (soundtrackPlaying) void toggleSoundtrack();
    onPlay?.();
  };
  return (
    <figure className={`video-player ${portrait ? "video-player--portrait" : ""} ${cinematic ? "video-player--cinematic" : ""}`}>
      <video
        controls
        playsInline
        preload="none"
        poster={resolveAssetPath(video.posterWebp)}
        width={video.width}
        height={video.height}
        onPlay={handlePlay}
        aria-label={video.title}
      >
        <source src={resolveAssetPath(video.src)} type="video/mp4" />
        {video.captions && <track kind="captions" src={resolveAssetPath(video.captions)} srcLang="en" label="English" default />}
        Your browser does not support local video playback.
      </video>
      <figcaption><Film size={14} /><span>{video.title}</span></figcaption>
    </figure>
  );
}

import { Film } from "lucide-react";
import { resolveAssetPath } from "../data";
import type { VideoItem } from "../types";

interface VideoPlayerProps {
  video: VideoItem;
  cinematic?: boolean;
  onPlay?: () => void;
}

export function VideoPlayer({ video, cinematic = false, onPlay }: VideoPlayerProps) {
  return (
    <figure className={`video-player ${cinematic ? "video-player--cinematic" : ""}`}>
      <video
        controls
        playsInline
        preload="metadata"
        poster={resolveAssetPath(video.posterWebp)}
        width={video.width}
        height={video.height}
        onPlay={onPlay}
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

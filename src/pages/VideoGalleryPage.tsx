import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { VideoPlayer } from "../components/VideoPlayer";
import { hydrateVideo, resolveAssetPath, type GeneratedVideo } from "../data";
import { useProgress } from "../progress";
import type { VideoItem } from "../types";

export function VideoGalleryPage() {
  const { recordActivity } = useProgress();
  const [videos, setVideos] = useState<VideoItem[] | null>([]);
  useEffect(() => {
    fetch(resolveAssetPath("media/video-manifest.json"))
      .then((response) => response.json() as Promise<GeneratedVideo[]>)
      .then((records) => setVideos(records.map(hydrateVideo)))
      .catch(() => setVideos(null));
  }, []);
  const formatDate = (date: string) => new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
  const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;
  return (
    <div className="video-page">
      <header className="page-intro page-intro--split">
        <div><p className="eyebrow">Little pieces of time</p><h1>Our home movies</h1></div>
        <p>{videos?.length ? `${videos.length} little films from the life we have shared—ordinary, playful, tender, and completely ours.` : "Ordinary, playful, tender moments from our life together."}</p>
      </header>

      {videos === null ? <section className="video-empty"><p className="eyebrow">Projector paused</p><h2>Refresh to load our films</h2></section> : videos.length ? <div className="video-grid">
        {videos.map((video, index) => (
          <motion.article key={video.id} initial={{ y: 22 }} animate={{ y: 0 }} transition={{ delay: index * .04 }}>
            <VideoPlayer video={video} onPlay={() => recordActivity("video-watched")} />
            <p className="eyebrow"><time dateTime={video.capturedAt}>{formatDate(video.capturedAt ?? "2022-08-21")}</time><span aria-hidden="true"> · </span>{formatDuration(video.durationSeconds)}</p>
            <h2>{video.title}</h2>
            <p>{video.description}</p>
          </motion.article>
        ))}
      </div> : <section className="video-empty"><p className="eyebrow">Preparing films</p><h2>Loading our films…</h2></section>}
    </div>
  );
}

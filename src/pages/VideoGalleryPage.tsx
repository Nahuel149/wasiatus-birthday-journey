import { motion } from "framer-motion";
import { VideoPlayer } from "../components/VideoPlayer";
import { videos } from "../data";
import { useProgress } from "../progress";

export function VideoGalleryPage() {
  const { recordActivity } = useProgress();
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
        <p>{videos.length} little films from the life we have shared—ordinary, playful, tender, and completely ours.</p>
      </header>

      <div className="video-grid">
        {videos.map((video, index) => (
          <motion.article key={video.id} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }}>
            <VideoPlayer video={video} onPlay={() => recordActivity("video-watched")} />
            <p className="eyebrow"><time dateTime={video.capturedAt}>{formatDate(video.capturedAt ?? "2022-08-21")}</time><span aria-hidden="true"> · </span>{formatDuration(video.durationSeconds)}</p>
            <h2>{video.title}</h2>
            <p>{video.description}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

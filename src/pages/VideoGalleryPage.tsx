import { Film, FolderPlus } from "lucide-react";
import { motion } from "framer-motion";
import { VideoPlayer } from "../components/VideoPlayer";
import { getMemory, videos } from "../data";
import { useProgress } from "../progress";

export function VideoGalleryPage() {
  const { recordActivity } = useProgress();
  return (
    <div className="video-page">
      <header className="page-intro page-intro--split">
        <div><p className="eyebrow">Little pieces of time</p><h1>Our home movies</h1></div>
        <p>Short clips, kept local and compressed for the web. Nothing loads until you choose to play it.</p>
      </header>

      {videos.length ? (
        <div className="video-grid">
          {videos.map((video, index) => {
            const memory = getMemory(video.memoryId);
            return (
              <motion.article key={video.id} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }}>
                <VideoPlayer video={video} onPlay={() => recordActivity("video-watched")} />
                <p className="eyebrow">{memory?.date}</p>
                <h2>{video.title}</h2>
                <p>{video.description}</p>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <section className="video-empty">
          <div className="video-empty__reel"><Film size={34} /><i /><i /><i /></div>
          <p className="eyebrow">The projector is ready</p>
          <h2>Add the first family film</h2>
          <p>Name a source clip after its memory ID, place it in <code>media-source/videos</code>, and run the local optimizer. The generated player will appear here automatically.</p>
          <span><FolderPlus size={16} /> npm run video:optimize</span>
        </section>
      )}
    </div>
  );
}

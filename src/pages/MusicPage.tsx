import { Music2, Pause, Play, VolumeX, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { useAudio } from "../audio";
import { MemoryVisual } from "../components/MemoryVisual";
import { getMediaForMemory, getMemory, songs } from "../data";
import { useProgress } from "../progress";

export function MusicPage() {
  const { currentTrack, playing, playTrack, toggle } = useAudio();
  const { recordActivity } = useProgress();

  return (
    <div className="music-page">
      <header className="page-intro page-intro--split">
        <div><p className="eyebrow">The songs behind the photographs</p><h1>Our soundtrack</h1></div>
        <p>Seven musical clues from our conversation, gathered in one place. Each one opens on YouTube only when you choose it.</p>
      </header>

      <div className="song-list">
        {songs.map((song, index) => {
          const memory = getMemory(song.memoryId);
          const active = currentTrack?.id === song.id;
          return (
            <motion.article
              className={`song-card ${active ? "is-active" : ""}`}
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: .2 }}
              transition={{ delay: index * .08 }}
            >
              <div className="song-card__art">
                {memory ? (
                  <MemoryVisual mood={memory.mood} label={memory.title} compact media={getMediaForMemory(memory.id)} />
                ) : (
                  <div className="song-card__record" aria-hidden="true">
                    <Music2 size={23} />
                  </div>
                )}
                <span>{String(song.order).padStart(2, "0")}</span>
              </div>
              <div className="song-card__copy">
                <p className="eyebrow">{song.artist}</p>
                <h2>{song.title}</h2>
                <p>{song.story}</p>
              </div>
              <div className="song-card__action">
                {song.audioPath ? (
                  <button onClick={async () => {
                    if (active) await toggle();
                    else if (await playTrack(song)) recordActivity("music-listened");
                  }} aria-label={active && playing ? `Pause ${song.title}` : `Play ${song.title}`}>
                    {active && playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
                  </button>
                ) : song.externalUrl ? (
                  <a href={song.externalUrl} target="_blank" rel="noreferrer" aria-label={`Watch ${song.title} on YouTube`}>
                    <Youtube size={20} />
                    <small>Watch</small>
                  </a>
                ) : (
                  <span title="Add a local audio file or external URL in songs.json"><VolumeX size={18} /><small>Story ready<br />audio pending</small></span>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>

      <aside className="music-note"><Youtube size={20} /><p><strong>Seven musical clues, one place:</strong> each selection opens its official or most relevant YouTube video in a new tab. The website itself stays silent until you choose.</p></aside>
    </div>
  );
}

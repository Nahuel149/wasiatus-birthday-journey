import { ExternalLink, Music2, Pause, Play, VolumeX } from "lucide-react";
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
        <p>Music is optional and silent by default. When a licensed local track is added, it continues softly while you explore.</p>
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
                {memory ? <MemoryVisual mood={memory.mood} label={memory.title} compact media={getMediaForMemory(memory.id)} /> : <Music2 size={30} />}
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
                  <a href={song.externalUrl} target="_blank" rel="noreferrer" aria-label={`Open ${song.title} externally`}><ExternalLink size={18} /></a>
                ) : (
                  <span title="Add a local audio file or external URL in songs.json"><VolumeX size={18} /><small>Story ready<br />audio pending</small></span>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>

      <aside className="music-note"><Music2 size={19} /><p><strong>To make a song playable:</strong> place a legally usable file in <code>public/media/audio</code>, then add its path as <code>audioPath</code> in <code>songs.json</code>.</p></aside>
    </div>
  );
}

import { ArrowLeft, ArrowRight, Maximize2, Pause, Play, RotateCcw, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MemoryVisual } from "../components/MemoryVisual";
import { VideoPlayer } from "../components/VideoPlayer";
import { getMediaForMemory, getVideoForMemory, memories } from "../data";
import { useProgress } from "../progress";

export function SlideshowPage() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const reducedMotion = useReducedMotion();
  const { recordActivity } = useProgress();
  const memory = memories[index];
  const video = getVideoForMemory(memory.id);

  const previous = useCallback(() => setIndex((current) => (current - 1 + memories.length) % memories.length), []);
  const next = useCallback(() => setIndex((current) => (current + 1) % memories.length), []);
  const togglePlaying = useCallback(() => {
    setPlaying((value) => {
      const nextValue = !value;
      if (nextValue) recordActivity("cinema-played");
      return nextValue;
    });
  }, [recordActivity]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(next, 6500);
    return () => window.clearInterval(timer);
  }, [next, playing]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
      if (event.key === " ") {
        event.preventDefault();
        togglePlaying();
      }
      if (event.key === "Escape") setImmersive(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous, togglePlaying]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", immersive);
    return () => document.body.classList.remove("no-scroll");
  }, [immersive]);

  return (
    <div className={`slideshow-page ${immersive ? "is-immersive" : ""}`}>
      <header className="slideshow-header">
        <div>
          <p className="eyebrow">Our memories, in motion</p>
          <h1>Cinema of us</h1>
        </div>
        <p>Use the arrow keys to move, space to play, and escape to leave fullscreen mode.</p>
      </header>

      <section className="slideshow-stage" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            className="slideshow-frame"
            key={memory.id}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: .985 }}
            transition={{ duration: reducedMotion ? .1 : .8, ease: [0.22, 1, 0.36, 1] }}
          >
            {video ? (
              <VideoPlayer video={video} cinematic onPlay={() => {
                setPlaying(false);
                recordActivity("video-watched");
              }} />
            ) : (
              <MemoryVisual mood={memory.mood} label={memory.title} media={getMediaForMemory(memory.id)} priority />
            )}
            <div className="slideshow-caption">
              <span>{String(index + 1).padStart(2, "0")} / {String(memories.length).padStart(2, "0")}</span>
              <div><p className="eyebrow">{memory.date} · {memory.location}</p><h2>{memory.title}</h2><p>{memory.summary}</p></div>
              <Link to={`/memories/${memory.id}`}>Read the memory <ArrowRight size={15} /></Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="slideshow-controls">
          <button onClick={previous} aria-label="Previous memory"><ArrowLeft size={19} /></button>
          <button className="slideshow-controls__play" onClick={togglePlaying} aria-label={playing ? "Pause slideshow" : "Play slideshow"}>
            {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button onClick={next} aria-label="Next memory"><ArrowRight size={19} /></button>
          <span />
          <button onClick={() => setIndex(0)} aria-label="Restart slideshow"><RotateCcw size={17} /></button>
          <button onClick={() => setImmersive((value) => !value)} aria-label={immersive ? "Leave immersive view" : "Enter immersive view"}>
            {immersive ? <X size={19} /> : <Maximize2 size={18} />}
          </button>
        </div>

        {playing && <motion.div className="slideshow-timer" key={`${memory.id}-timer`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 6.5, ease: "linear" }} />}
      </section>
    </div>
  );
}

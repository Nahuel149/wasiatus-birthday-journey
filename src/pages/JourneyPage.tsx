import { ArrowRight, Check, Heart, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MemoryVisual } from "../components/MemoryVisual";
import { chapters, getMediaForMemory, getMemory, memories } from "../data";
import { useProgress } from "../progress";
import type { Chapter } from "../types";

function ChapterSection({ chapter, index, onHeartFound }: { chapter: Chapter; index: number; onHeartFound: (chapterTitle: string) => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.42, once: true });
  const reducedMotion = useReducedMotion();
  const { visitChapter, visitedChapters, foundHearts, findHeart } = useProgress();
  const memory = getMemory(chapter.memoryId);
  const heartId = `heart-${chapter.id}`;
  const heartFound = foundHearts.has(heartId);
  const companionMemories = memories
    .filter((item) => item.chapterId === chapter.id && item.id !== memory?.id && item.tags.includes("core"))
    .slice(0, 3);

  useEffect(() => {
    if (inView) visitChapter(chapter.id);
  }, [chapter.id, inView, visitChapter]);

  if (!memory) return null;

  return (
    <section ref={ref} className={`chapter chapter--${chapter.mood}`}>
      <div className="chapter__number" aria-hidden="true">
        {String(chapter.number).padStart(2, "0")}
      </div>
      <button
        className={`hidden-heart hidden-heart--${index + 1} ${heartFound ? "is-found" : ""}`}
        onClick={() => {
          if (findHeart(heartId)) onHeartFound(chapter.title);
        }}
        aria-label={heartFound ? `Hidden heart found in ${chapter.title}` : `Discover a hidden heart in ${chapter.title}`}
        aria-pressed={heartFound}
      >
        <Heart size={heartFound ? 18 : 14} fill={heartFound ? "currentColor" : "none"} />
      </button>
      <motion.div
        className={`chapter__layout ${index % 2 ? "chapter__layout--reverse" : ""}`}
        initial={reducedMotion ? {} : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="chapter__visual-wrap">
          <MemoryVisual mood={chapter.mood} label={memory.title} media={getMediaForMemory(memory.id)} priority={index === 0} />
          <span className="chapter__caption">A real moment from our family story · {memory.date}</span>
        </div>
        <div className="chapter__copy">
          <p className="eyebrow">{chapter.kicker}</p>
          <h2>{chapter.title}</h2>
          <p className="chapter__intro">{chapter.introduction}</p>
          <blockquote>“{memory.quote}”</blockquote>
          <div className="chapter__actions">
            <Link to={`/memories/${memory.id}`} className="text-link">
              Read this memory <ArrowRight size={17} />
            </Link>
            {visitedChapters.has(chapter.id) && (
              <span className="visited-mark"><Check size={14} /> visited</span>
            )}
          </div>
        </div>
      </motion.div>
      {companionMemories.length > 0 && (
        <motion.div
          className="chapter__moments"
          initial={reducedMotion ? {} : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.72, delay: 0.12 }}
        >
          <div className="chapter__moments-intro">
            <span>More from this chapter</span>
            <i aria-hidden="true" />
          </div>
          <div className="chapter__moment-grid">
            {companionMemories.map((companion, companionIndex) => (
              <Link className={`chapter__moment chapter__moment--${companionIndex + 1}`} to={`/memories/${companion.id}`} key={companion.id}>
                <MemoryVisual mood={companion.mood} label={companion.title} compact media={getMediaForMemory(companion.id)} />
                <span><small>{companion.date}</small><strong>{companion.title}</strong></span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}

export function JourneyPage() {
  const { journeyComplete, progressPercent } = useProgress();
  const [discovery, setDiscovery] = useState<string | null>(null);

  const announceDiscovery = (chapterTitle: string) => {
    setDiscovery(chapterTitle);
    window.setTimeout(() => setDiscovery(null), 2800);
  };

  return (
    <div className="journey-page">
      <header className="page-intro page-intro--journey">
        <p className="eyebrow">The story of us</p>
        <h1>Six chapters.<br /><em>One beautiful life.</em></h1>
        <p>Scroll slowly, My Boobie. Some memories deserve a little more time.</p>
        <div className="page-progress" role="progressbar" aria-label="Journey progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </header>

      {chapters.map((chapter, index) => (
        <ChapterSection key={chapter.id} chapter={chapter} index={index} onHeartFound={announceDiscovery} />
      ))}

      <AnimatePresence>
        {discovery && (
          <motion.div
            className="discovery-toast"
            role="status"
            initial={{ opacity: 0, y: 18, scale: .96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: .98 }}
          >
            <span><Sparkles size={15} /></span>
            <div><strong>A hidden heart!</strong><small>Found inside “{discovery}”</small></div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="journey-ending">
        <Heart size={24} fill="currentColor" />
        <p className="eyebrow">One last page</p>
        <h2>{journeyComplete ? "You made it to today." : "Our story is waiting."}</h2>
        <p>
          {journeyComplete
            ? "Every chapter brought us here—and there is still one birthday surprise left."
            : "Visit each chapter to unlock the birthday surprise."}
        </p>
        <Link to="/finale" className={journeyComplete ? "primary-cta" : "secondary-cta"}>
          {journeyComplete ? "Open your surprise" : `${progressPercent}% explored`}
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}

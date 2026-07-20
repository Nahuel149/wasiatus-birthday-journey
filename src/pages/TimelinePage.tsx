import { ArrowUpRight, Check, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { chapters, getMemory } from "../data";
import { useProgress } from "../progress";

export function TimelinePage() {
  const { visitedChapters } = useProgress();

  return (
    <div className="standard-page timeline-page">
      <header className="page-intro">
        <p className="eyebrow">A life in moments</p>
        <h1>Our timeline</h1>
        <p>Not every important date lives on a calendar. Some are remembered by how the world felt afterward.</p>
      </header>

      <div className="timeline">
        <div className="timeline__line" aria-hidden="true" />
        {chapters.map((chapter, index) => {
          const memory = getMemory(chapter.memoryId);
          if (!memory) return null;
          const visited = visitedChapters.has(chapter.id);
          return (
            <motion.article
              className={`timeline-event ${index % 2 ? "timeline-event--right" : ""}`}
              key={chapter.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.06 * index }}
            >
              <span className={`timeline-event__dot ${visited ? "is-visited" : ""}`}>
                {visited ? <Check size={13} /> : chapter.number}
              </span>
              <div className="timeline-event__card">
                <p className="eyebrow">{memory.date}</p>
                <h2>{memory.title}</h2>
                <p>{memory.summary}</p>
                <span className="timeline-event__location"><MapPin size={14} />{memory.location}</span>
                <Link to={`/memories/${memory.id}`} aria-label={`Read ${memory.title}`}>
                  Open memory <ArrowUpRight size={16} />
                </Link>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

import { ArrowLeft, ArrowRight, Heart, MapPin, Users } from "lucide-react";
import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { MemoryVisual } from "../components/MemoryVisual";
import { chapters, getMediaForMemory, getMemory, memories } from "../data";
import { useProgress } from "../progress";

export function MemoryPage() {
  const { id } = useParams();
  const memory = getMemory(id);
  const { visitChapter, favorites, toggleFavorite } = useProgress();

  useEffect(() => {
    if (memory) visitChapter(memory.chapterId);
  }, [memory, visitChapter]);

  if (!memory) return <Navigate to="/journey" replace />;

  const index = memories.findIndex((item) => item.id === memory.id);
  const previous = memories[index - 1];
  const next = memories[index + 1];
  const chapter = chapters.find((item) => item.id === memory.chapterId);
  const favorite = favorites.has(memory.id);

  return (
    <article className={`memory-page memory-page--${memory.mood}`}>
      <div className="memory-page__hero">
        <Link to="/journey" className="back-link"><ArrowLeft size={16} /> Back to journey</Link>
        <div className="memory-page__title">
          <p className="eyebrow">{memory.eyebrow} · {chapter?.title}</p>
          <h1>{memory.title}</h1>
          <p>{memory.summary}</p>
        </div>
        <MemoryVisual mood={memory.mood} label={memory.title} media={getMediaForMemory(memory.id)} priority />
      </div>

      <div className="memory-page__body">
        <aside className="memory-meta">
          <div><span>When</span><strong>{memory.date}</strong></div>
          <div><span>Where</span><strong><MapPin size={14} /> {memory.location}</strong></div>
          <div><span>Together</span><strong><Users size={14} /> {memory.people.join(", ")}</strong></div>
          <button onClick={() => toggleFavorite(memory.id)} className={favorite ? "is-favorite" : ""}>
            <Heart size={16} fill={favorite ? "currentColor" : "none"} />
            {favorite ? "A favorite" : "Remember this"}
          </button>
        </aside>

        <div className="memory-story">
          <p className="dropcap">{memory.story[0]}</p>
          <blockquote>“{memory.quote}”</blockquote>
          {memory.story.slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="memory-tags">
            {memory.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
      </div>

      <nav className="memory-pagination" aria-label="Memory navigation">
        {previous ? (
          <Link to={`/memories/${previous.id}`}><ArrowLeft size={17} /><span><small>Previous</small>{previous.title}</span></Link>
        ) : <span />}
        {next ? (
          <Link to={`/memories/${next.id}`}><span><small>Next</small>{next.title}</span><ArrowRight size={17} /></Link>
        ) : (
          <Link to="/finale"><span><small>Next</small>The birthday finale</span><ArrowRight size={17} /></Link>
        )}
      </nav>
    </article>
  );
}

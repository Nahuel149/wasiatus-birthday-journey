import { Heart, RotateCcw, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { reasons } from "../data";
import { useProgress } from "../progress";

export function ReasonsPage() {
  const [index, setIndex] = useState(0);
  const { recordActivity } = useProgress();
  const reason = reasons[index];
  const completed = index === reasons.length - 1;

  useEffect(() => {
    if (completed) recordActivity("reasons-complete");
  }, [completed, recordActivity]);

  const nextReason = () => setIndex((current) => (current + 1) % reasons.length);

  return (
    <div className="reasons-page">
      <header className="page-intro">
        <p className="eyebrow">A hundred could never be enough</p>
        <h1>Reasons I love you</h1>
        <p>Twelve starter cards are waiting. Tap each one to move through the deck.</p>
      </header>

      <div className="reason-stage">
        <div className="reason-card reason-card--shadow reason-card--shadow-1" />
        <div className="reason-card reason-card--shadow reason-card--shadow-2" />
        <AnimatePresence mode="wait">
          <motion.button
            className="reason-card"
            key={reason.id}
            onClick={nextReason}
            initial={{ opacity: 0, x: 45, rotate: 3 }}
            animate={{ opacity: 1, x: 0, rotate: -1 }}
            exit={{ opacity: 0, x: -60, rotate: -5 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="reason-card__number">{String(reason.number).padStart(2, "0")}</span>
            <Heart size={18} fill="currentColor" />
            <h2>{reason.reason}</h2>
            <p>{reason.detail}</p>
            <small>{completed ? "One more time?" : "Tap for the next reason"}</small>
          </motion.button>
        </AnimatePresence>
      </div>

      <div className="reason-progress">
        <span><Sparkles size={15} /> {index + 1} of {reasons.length}</span>
        <div><span style={{ width: `${((index + 1) / reasons.length) * 100}%` }} /></div>
        <button onClick={() => setIndex(0)}><RotateCcw size={14} /> Start over</button>
      </div>

      <details className="reason-list">
        <summary>Read all reasons as a list</summary>
        <ol>{reasons.map((item) => <li key={item.id}><strong>{item.reason}</strong><span>{item.detail}</span></li>)}</ol>
      </details>
    </div>
  );
}

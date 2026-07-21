import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import notesJson from "../content/floating-notes.json";

interface FloatingNote {
  id: string;
  theme: string;
  message: string;
}

const notes = notesJson as FloatingNote[];

function routeSeed(pathname: string) {
  return [...pathname].reduce((total, character) => total + character.charCodeAt(0), 0) % notes.length;
}

export function FloatingLoveNotes({ pathname, landing = false }: { pathname: string; landing?: boolean }) {
  const reducedMotion = useReducedMotion();
  const startingIndex = useMemo(() => routeSeed(pathname), [pathname]);
  const [index, setIndex] = useState(startingIndex);

  useEffect(() => {
    setIndex(startingIndex);
    if (reducedMotion) return;

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % notes.length);
    }, 9000);

    return () => window.clearInterval(interval);
  }, [reducedMotion, startingIndex]);

  const note = notes[index];

  return (
    <aside
      className={`floating-love-note${landing ? " floating-love-note--landing" : ""}`}
      aria-label="A small love note"
    >
      <span className="floating-love-note__pin" aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={note.id}
          initial={reducedMotion ? false : { opacity: 0, y: 8, rotate: -0.8 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -7, rotate: 0.6 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <small>{note.theme}</small>
          <p>{note.message}</p>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}

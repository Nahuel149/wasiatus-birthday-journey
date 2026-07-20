import { ArrowUpRight, Compass, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MemoryVisual } from "../components/MemoryVisual";
import { getMediaForMemory, getMemory, places } from "../data";
import { useProgress } from "../progress";

export function PlacesPage() {
  const [selectedId, setSelectedId] = useState(places.find((place) => place.id === "japan")?.id ?? places[0]?.id);
  const { recordActivity } = useProgress();
  const selected = places.find((place) => place.id === selectedId) ?? places[0];
  const relatedMemories = selected?.memoryIds.map(getMemory).filter(Boolean) ?? [];

  return (
    <div className="places-page">
      <header className="page-intro page-intro--split">
        <div>
          <p className="eyebrow">Our world, made personal</p>
          <h1>Places we call ours</h1>
        </div>
        <p>Not a map of countries collected, but of places made meaningful because we stood there together.</p>
      </header>

      <div className="places-layout">
        <section className="keepsake-map" aria-label="Illustrative map of family memories">
          <div className="keepsake-map__compass" aria-hidden="true"><Compass size={19} /><span>N</span></div>
          <svg viewBox="0 0 1000 520" role="img" aria-label="Decorative world map">
            <path d="M82 136c38-52 95-77 152-68 36 6 61 24 91 38 21 10 50 5 66 24 16 20-2 46-17 62-24 26-42 45-50 82-8 35-36 68-62 91-18 16-44 12-51-13-8-31 5-60-14-89-15-23-47-31-70-47-29-20-67-45-45-80z" />
            <path d="M301 300c31-8 67 9 81 38 13 28-2 58-14 84-10 23-15 60-43 70-20 7-35-20-41-37-10-28-24-52-25-82-1-29 11-65 42-73z" />
            <path d="M448 111c31-27 80-31 117-17 31 12 50 2 82-1 42-5 90 10 123 35 27 21 59 25 91 33 27 7 65 32 52 64-11 29-55 26-81 26-38 0-57 16-87 36-25 16-65 14-84 39-23 30-12 75-38 103-18 19-52 8-65-12-15-23-3-53-15-77-15-32-53-42-76-67-25-28-38-67-41-104-2-21 5-43 22-58z" />
            <path d="M790 350c29-19 72-18 99 5 21 18 33 52 13 75-23 26-63 30-95 23-29-6-57-29-51-61 3-17 18-32 34-42z" />
            <path d="M920 248c8-7 22-3 25 8 3 12-8 23-19 18-10-4-13-18-6-26z" />
          </svg>
          {places.map((place, index) => (
            <button
              key={place.id}
              className={`map-pin ${selected?.id === place.id ? "is-active" : ""}`}
              style={{ left: `${place.x}%`, top: `${place.y}%` }}
              onClick={() => {
                setSelectedId(place.id);
                recordActivity("place-explored");
              }}
              aria-label={`Show memories from ${place.name}`}
              aria-pressed={selected?.id === place.id}
            >
              <span>{index + 1}</span>
              <i />
            </button>
          ))}
          <p className="keepsake-map__note">An illustrative keepsake map · positions are edited in places.json</p>
        </section>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.aside
              className="place-card"
              key={selected.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: .38 }}
            >
              <span className="place-card__index">{String(places.indexOf(selected) + 1).padStart(2, "0")}</span>
              <p className="eyebrow"><MapPin size={13} /> {selected.country}</p>
              <h2>{selected.name}</h2>
              <p>{selected.note}</p>
              <div className="place-card__memories">
                {relatedMemories.map((memory) => memory && (
                  <Link to={`/memories/${memory.id}`} key={memory.id}>
                    <MemoryVisual mood={memory.mood} label={memory.title} compact media={getMediaForMemory(memory.id)} />
                    <span><strong>{memory.title}</strong><small>{memory.date}</small></span>
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

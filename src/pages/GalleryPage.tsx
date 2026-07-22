import { ChevronLeft, ChevronRight, Grid2X2, Heart, LayoutGrid, Rows3, Search, ZoomIn, ZoomOut, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MemoryVisual } from "../components/MemoryVisual";
import { categories, getMediaForMemory, memories } from "../data";
import { useProgress } from "../progress";
import { createMemoryLoadFixture, filterMemories } from "../search";
import type { Memory } from "../types";

const PAGE_SIZE = 60;

interface LightboxProps {
  items: Memory[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

function Lightbox({ items, index, onIndexChange, onClose }: LightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const memory = items[index];
  const move = useCallback((direction: number) => {
    setZoomed(false);
    onIndexChange((index + direction + items.length) % items.length);
  }, [index, items.length, onIndexChange]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add("no-scroll");
    closeRef.current?.focus();
    return () => {
      document.body.classList.remove("no-scroll");
      previousFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])")];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, onClose]);

  return (
    <motion.div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button ref={closeRef} className="lightbox__close" onClick={onClose} aria-label="Close viewer"><X size={22} /></button>
      <button className="lightbox__nav lightbox__nav--previous" onClick={(event) => { event.stopPropagation(); move(-1); }} aria-label="Previous memory"><ChevronLeft size={27} /></button>
      <button className="lightbox__nav lightbox__nav--next" onClick={(event) => { event.stopPropagation(); move(1); }} aria-label="Next memory"><ChevronRight size={27} /></button>
      <motion.div
        className="lightbox__content"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
      >
        <motion.div
          className={`lightbox__media ${zoomed ? "is-zoomed" : ""}`}
          drag={zoomed ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={.18}
          onDragEnd={(_event, info) => {
            if (info.offset.x < -70) move(1);
            if (info.offset.x > 70) move(-1);
          }}
          animate={{ scale: zoomed ? 1.65 : 1 }}
          transition={{ duration: .32 }}
        >
          <MemoryVisual mood={memory.mood} label={memory.title} media={getMediaForMemory(memory.id)} />
        </motion.div>
        <div className="lightbox__caption">
          <span className="lightbox__counter">{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
          <p className="eyebrow">{memory.date}</p><h2 id="lightbox-title">{memory.title}</h2><p>{memory.summary}</p>
          <button onClick={() => setZoomed((value) => !value)} aria-pressed={zoomed}>
            {zoomed ? <ZoomOut size={17} /> : <ZoomIn size={17} />}{zoomed ? "Return to fit" : "Zoom photograph"}
          </button>
          <small>Swipe or use the arrow keys to browse</small>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { favorites, toggleFavorite } = useProgress();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "All memories";
  const favoritesOnly = searchParams.get("favorites") === "true";
  const layout = searchParams.get("layout") === "uniform" ? "uniform" : "masonry";
  const requestedLoadCount = Number(searchParams.get("loadTest"));
  const loadCount = Number.isInteger(requestedLoadCount) && requestedLoadCount > 0 ? Math.min(requestedLoadCount, 1000) : 0;
  const galleryItems = useMemo(() => loadCount ? createMemoryLoadFixture(memories, loadCount) : memories, [loadCount]);

  const updateParam = useCallback((name: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    return filterMemories(galleryItems, { query, category, favoritesOnly, favorites });
  }, [category, favorites, favoritesOnly, galleryItems, query]);
  const visibleItems = filtered.slice(0, visibleCount);

  useEffect(() => {
    setSelectedIndex(null);
    setVisibleCount(PAGE_SIZE);
  }, [category, favoritesOnly, galleryItems, query]);

  const closeLightbox = useCallback(() => setSelectedIndex(null), []);

  return (
    <div className="standard-page gallery-page">
      <header className="page-intro page-intro--split">
        <div><p className="eyebrow">The memory room</p><h1>Our gallery</h1></div>
        <p>Seventy-four pieces of our story: early days, quiet love, becoming parents, and the little expressions we never want to forget.</p>
      </header>

      <div className="gallery-toolbar">
        <label className="search-field">
          <Search size={17} />
          <span className="sr-only">Search memories</span>
          <input type="search" name="memory-search" autoComplete="off" value={query} onChange={(event) => updateParam("q", event.target.value)} placeholder="Search places, people, moments…" />
        </label>
        <button className={favoritesOnly ? "is-active" : ""} onClick={() => updateParam("favorites", favoritesOnly ? undefined : "true")} aria-pressed={favoritesOnly}>
          <Heart size={16} fill={favoritesOnly ? "currentColor" : "none"} /> Favorites
        </button>
        <button onClick={() => updateParam("layout", layout === "masonry" ? "uniform" : undefined)} aria-label={layout === "masonry" ? "Equal grid — use equal gallery grid" : "Varied grid — use varied gallery grid"}>
          {layout === "masonry" ? <LayoutGrid size={16} /> : <Rows3 size={16} />}{layout === "masonry" ? "Equal grid" : "Varied grid"}
        </button>
        <span className="gallery-count" aria-live="polite"><Grid2X2 size={15} /> {filtered.length} memories</span>
      </div>

      <div className="filter-row" aria-label="Filter by category">
        {["All memories", ...categories].map((item) => (
          <button key={item} className={category === item ? "is-active" : ""} onClick={() => updateParam("category", item === "All memories" ? undefined : item)} aria-pressed={category === item}>{item}</button>
        ))}
      </div>

      <motion.div className={`gallery-grid gallery-grid--${layout}`} layout>
        <AnimatePresence mode="popLayout">
          {visibleItems.map((memory, index) => {
            const favorite = favorites.has(memory.id);
            const media = getMediaForMemory(memory.id);
            return (
              <motion.article
                className={`gallery-card gallery-card--${index % 3}`}
                key={memory.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                <button className="gallery-card__image" onClick={() => setSelectedIndex(index)} aria-label={`View ${memory.title}`}>
                  <MemoryVisual mood={memory.mood} label={memory.title} compact={index % 3 === 1} media={media} />
                </button>
                <div className="gallery-card__copy">
                  <div><p>{memory.date}</p><h2>{memory.title}</h2></div>
                  <button onClick={() => toggleFavorite(memory.id)} aria-label={favorite ? `Remove ${memory.title} from favorites` : `Favorite ${memory.title}`}>
                    <Heart size={17} fill={favorite ? "currentColor" : "none"} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {visibleCount < filtered.length && (
        <div className="gallery-more">
          <button onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length))}>Load 60 More Memories</button>
          <span>Showing {visibleItems.length} of {filtered.length}</span>
        </div>
      )}

      {filtered.length === 0 && <div className="empty-state"><Heart size={22} /><h2>No memories found</h2><p>Try another word or clear a filter.</p></div>}

      <AnimatePresence>
        {selectedIndex !== null && filtered[selectedIndex] && (
          <Lightbox items={filtered} index={selectedIndex} onIndexChange={setSelectedIndex} onClose={closeLightbox} />
        )}
      </AnimatePresence>
    </div>
  );
}

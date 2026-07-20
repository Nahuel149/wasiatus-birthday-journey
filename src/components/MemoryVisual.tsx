import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { resolveAssetPath } from "../data";
import type { ImageMediaItem, Mood } from "../types";

interface MemoryVisualProps {
  mood: Mood;
  label: string;
  compact?: boolean;
  media?: ImageMediaItem;
  priority?: boolean;
}

export function MemoryVisual({ mood, label, compact = false, media, priority = false }: MemoryVisualProps) {
  const [mediaFailed, setMediaFailed] = useState(false);

  useEffect(() => setMediaFailed(false), [media?.id]);

  if (media && !mediaFailed) {
    return (
      <motion.figure
        className={`memory-visual memory-visual--photo ${compact ? "memory-visual--compact" : ""}`}
        whileHover={{ scale: 1.012 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <picture>
          <source
            type="image/avif"
            srcSet={`${resolveAssetPath(media.sources.thumbnailAvif)} 480w, ${resolveAssetPath(media.sources.mediumAvif)} 960w, ${resolveAssetPath(media.sources.largeAvif)} 1920w`}
          />
          <source
            type="image/webp"
            srcSet={`${resolveAssetPath(media.sources.thumbnailWebp)} 480w, ${resolveAssetPath(media.sources.mediumWebp)} 960w, ${resolveAssetPath(media.sources.largeWebp)} 1920w`}
          />
          <img
            src={resolveAssetPath(media.sources.mediumWebp)}
            alt={media.alt}
            width={media.width}
            height={media.height}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            onError={() => setMediaFailed(true)}
          />
        </picture>
        <span className="memory-visual__grain" aria-hidden="true" />
      </motion.figure>
    );
  }

  return (
    <motion.div
      className={`memory-visual memory-visual--${mood} ${compact ? "memory-visual--compact" : ""}`}
      whileHover={{ scale: 1.012 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="img"
      aria-label={`Placeholder for a personal photograph: ${label}`}
    >
      <span className="memory-visual__sun" aria-hidden="true" />
      <span className="memory-visual__ridge memory-visual__ridge--back" aria-hidden="true" />
      <span className="memory-visual__ridge memory-visual__ridge--front" aria-hidden="true" />
      <span className="memory-visual__grain" aria-hidden="true" />
      <span className="memory-visual__label" aria-hidden="true">Your photograph here</span>
    </motion.div>
  );
}

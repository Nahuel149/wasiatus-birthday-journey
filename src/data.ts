import chaptersJson from "./content/chapters.json";
import memoriesJson from "./content/memories.json";
import reasonsJson from "./content/reasons.json";
import mediaJson from "./content/generated-media.json";
import placesJson from "./content/places.json";
import videosJson from "./content/generated-videos.json";
import songsJson from "./content/songs.json";
import type { Chapter, ImageMediaItem, LoveReason, Memory, Place, SongStory, VideoItem } from "./types";

export const chapters = chaptersJson as Chapter[];
export const memories = memoriesJson as Memory[];
export const reasons = reasonsJson as LoveReason[];
export const media = mediaJson as ImageMediaItem[];
export const places = placesJson as Place[];
export type GeneratedVideo = Omit<VideoItem, "id" | "kind" | "src" | "posterWebp"> & { slug?: string };
export function hydrateVideo({ slug: providedSlug, ...video }: GeneratedVideo): VideoItem {
  const slug = providedSlug ?? video.memoryId;
  if (!slug) throw new Error("Video record lacks a slug");
  return {
  ...video,
  id: `${slug}-video`,
  kind: "video",
  src: `media/videos/${slug}.mp4`,
  posterWebp: `media/posters/${slug}-poster.webp`,
  };
}
export const videos = (videosJson as GeneratedVideo[]).map(hydrateVideo);
export const songs = (songsJson as SongStory[]).slice().sort((a, b) => a.order - b.order);

export const memoryById = new Map(memories.map((memory) => [memory.id, memory]));
export const mediaByMemoryId = new Map(media.map((item) => [item.memoryId, item]));
export const videoByMemoryId = new Map(videos.flatMap((item) => item.memoryId ? [[item.memoryId, item] as const] : []));

export function getMemory(id: string | undefined) {
  return id ? memoryById.get(id) : undefined;
}

export function getMediaForMemory(id: string | undefined) {
  return id ? mediaByMemoryId.get(id) : undefined;
}

export function getVideoForMemory(id: string | undefined) {
  return id ? videoByMemoryId.get(id) : undefined;
}

export function resolveAssetPath(path: string) {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

export const categories = Array.from(new Set(memories.map((memory) => memory.category)));

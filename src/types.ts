export type Mood = "blush" | "gold" | "wine" | "dawn" | "sage" | "night";

export interface Memory {
  id: string;
  chapterId: string;
  eyebrow: string;
  title: string;
  date: string;
  location: string;
  people: string[];
  category: string;
  tags: string[];
  summary: string;
  story: string[];
  mood: Mood;
  favorite: boolean;
  quote?: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  kicker: string;
  introduction: string;
  memoryId: string;
  mood: Mood;
}

export interface LoveReason {
  id: string;
  number: number;
  reason: string;
  detail: string;
}

export interface ImageMediaItem {
  id: string;
  memoryId: string;
  kind: "image";
  alt: string;
  width: number;
  height: number;
  sources: {
    thumbnailAvif: string;
    thumbnailWebp: string;
    mediumAvif: string;
    mediumWebp: string;
    largeAvif: string;
    largeWebp: string;
  };
}

export interface VideoItem {
  id: string;
  memoryId?: string;
  kind: "video";
  title: string;
  description: string;
  src: string;
  posterWebp: string;
  width: number;
  height: number;
  durationSeconds: number;
  capturedAt?: string;
  captions?: string;
}

export interface SongStory {
  id: string;
  order: number;
  title: string;
  artist: string;
  story: string;
  memoryId?: string;
  audioPath?: string;
  shuffle?: boolean;
  opening?: boolean;
}

export interface Place {
  id: string;
  name: string;
  country: string;
  note: string;
  x: number;
  y: number;
  memoryIds: string[];
}

export interface AchievementStatus {
  id: string;
  title: string;
  description: string;
  unlockedCopy: string;
  icon: "spark" | "heart" | "book" | "star" | "map" | "film" | "gallery" | "music";
  current: number;
  target: number;
  unlocked: boolean;
}

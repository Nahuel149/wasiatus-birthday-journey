import type { AchievementStatus } from "./types";

interface AchievementInput {
  visitedCount: number;
  chapterCount: number;
  favoriteCount: number;
  heartCount: number;
  hiddenHeartCount: number;
  activities: Set<string>;
}

export function getAchievements(input: AchievementInput): AchievementStatus[] {
  const activity = (id: string) => input.activities.has(id) ? 1 : 0;
  return [
    {
      id: "first-page",
      title: "The first page",
      description: "Begin exploring the story.",
      unlockedCopy: "Every story begins with one small step.",
      icon: "spark",
      current: Math.min(input.visitedCount, 1),
      target: 1,
      unlocked: input.visitedCount >= 1,
    },
    {
      id: "whole-story",
      title: "The whole story",
      description: "Visit every chapter in the journey.",
      unlockedCopy: "Six chapters, held together by one love.",
      icon: "book",
      current: input.visitedCount,
      target: input.chapterCount,
      unlocked: input.visitedCount >= input.chapterCount,
    },
    {
      id: "first-secret",
      title: "A secret between us",
      description: "Discover a hidden heart.",
      unlockedCopy: "You found the first little piece of love.",
      icon: "heart",
      current: Math.min(input.heartCount, 1),
      target: 1,
      unlocked: input.heartCount >= 1,
    },
    {
      id: "heart-keeper",
      title: "Keeper of hearts",
      description: "Find every hidden heart in the journey.",
      unlockedCopy: "Nothing loving stays hidden from you for long.",
      icon: "heart",
      current: input.heartCount,
      target: input.hiddenHeartCount,
      unlocked: input.heartCount >= input.hiddenHeartCount,
    },
    {
      id: "memory-curator",
      title: "Memory curator",
      description: "Save three memories as favorites.",
      unlockedCopy: "A tiny museum of the moments you love most.",
      icon: "gallery",
      current: Math.min(input.favoriteCount, 3),
      target: 3,
      unlocked: input.favoriteCount >= 3,
    },
    {
      id: "letter-reader",
      title: "Words kept close",
      description: "Open and read the love letter.",
      unlockedCopy: "Some words were always meant only for you.",
      icon: "star",
      current: activity("letter-read"),
      target: 1,
      unlocked: activity("letter-read") === 1,
    },
    {
      id: "reason-collector",
      title: "Twelve times loved",
      description: "Reveal every starter love reason.",
      unlockedCopy: "Twelve reasons found. Eighty-eight are still waiting.",
      icon: "spark",
      current: activity("reasons-complete"),
      target: 1,
      unlocked: activity("reasons-complete") === 1,
    },
    {
      id: "world-explorer",
      title: "Our little world",
      description: "Explore a place on the memory map.",
      unlockedCopy: "Home is every place where we found each other.",
      icon: "map",
      current: activity("place-explored"),
      target: 1,
      unlocked: activity("place-explored") === 1,
    },
    {
      id: "cinema-night",
      title: "Cinema night",
      description: "Play the memory slideshow.",
      unlockedCopy: "Our life deserves the big screen.",
      icon: "film",
      current: activity("cinema-played"),
      target: 1,
      unlocked: activity("cinema-played") === 1,
    },
    {
      id: "our-soundtrack",
      title: "Our soundtrack",
      description: "Play a song from the music page.",
      unlockedCopy: "Some memories begin again with the very first note.",
      icon: "music",
      current: activity("music-listened"),
      target: 1,
      unlocked: activity("music-listened") === 1,
    },
  ];
}

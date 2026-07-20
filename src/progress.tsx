import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { chapters, memories } from "./data";
import { getAchievements } from "./achievements";
import type { AchievementStatus } from "./types";

interface ProgressContextValue {
  visitedChapters: Set<string>;
  favorites: Set<string>;
  foundHearts: Set<string>;
  activities: Set<string>;
  achievements: AchievementStatus[];
  unlockedAchievementCount: number;
  journeyComplete: boolean;
  progressPercent: number;
  visitChapter: (id: string) => void;
  toggleFavorite: (id: string) => void;
  findHeart: (id: string) => boolean;
  recordActivity: (id: string) => void;
  resetProgress: () => void;
}

const VISITED_KEY = "birthdayJourney:v1:visited";
const FAVORITES_KEY = "birthdayJourney:v1:favorites";
const HEARTS_KEY = "birthdayJourney:v1:hearts";
const ACTIVITIES_KEY = "birthdayJourney:v1:activities";
export const HIDDEN_HEART_COUNT = 6;

function readSet(key: string, fallback: string[] = []) {
  try {
    const raw = localStorage.getItem(key);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : fallback);
  } catch {
    return new Set<string>(fallback);
  }
}

function saveSet(key: string, value: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...value]));
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [visitedChapters, setVisitedChapters] = useState(() => readSet(VISITED_KEY));
  const [favorites, setFavorites] = useState(() => readSet(FAVORITES_KEY, memories.filter((memory) => memory.favorite).map((memory) => memory.id)));
  const [foundHearts, setFoundHearts] = useState(() => readSet(HEARTS_KEY));
  const [activities, setActivities] = useState(() => readSet(ACTIVITIES_KEY));

  const visitChapter = useCallback((id: string) => {
    setVisitedChapters((current) => {
      if (current.has(id)) return current;
      const next = new Set(current).add(id);
      saveSet(VISITED_KEY, next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const findHeart = useCallback((id: string) => {
    if (foundHearts.has(id)) return false;
    const next = new Set(foundHearts).add(id);
    saveSet(HEARTS_KEY, next);
    setFoundHearts(next);
    return true;
  }, [foundHearts]);

  const recordActivity = useCallback((id: string) => {
    setActivities((current) => {
      if (current.has(id)) return current;
      const next = new Set(current).add(id);
      saveSet(ACTIVITIES_KEY, next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const empty = new Set<string>();
    saveSet(VISITED_KEY, empty);
    setVisitedChapters(empty);
  }, []);

  const value = useMemo(() => {
    const completed = chapters.filter((chapter) => visitedChapters.has(chapter.id)).length;
    const achievements = getAchievements({
      visitedCount: completed,
      chapterCount: chapters.length,
      favoriteCount: favorites.size,
      heartCount: foundHearts.size,
      hiddenHeartCount: HIDDEN_HEART_COUNT,
      activities,
    });
    return {
      visitedChapters,
      favorites,
      foundHearts,
      activities,
      achievements,
      unlockedAchievementCount: achievements.filter((achievement) => achievement.unlocked).length,
      journeyComplete: completed === chapters.length,
      progressPercent: Math.round((completed / chapters.length) * 100),
      visitChapter,
      toggleFavorite,
      findHeart,
      recordActivity,
      resetProgress,
    };
  }, [activities, favorites, findHeart, foundHearts, recordActivity, resetProgress, toggleFavorite, visitChapter, visitedChapters]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress must be used within ProgressProvider");
  return value;
}

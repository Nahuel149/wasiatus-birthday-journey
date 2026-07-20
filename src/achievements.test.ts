import { describe, expect, it } from "vitest";
import { getAchievements } from "./achievements";

const base = {
  visitedCount: 0,
  chapterCount: 6,
  favoriteCount: 0,
  heartCount: 0,
  hiddenHeartCount: 6,
  activities: new Set<string>(),
};

describe("getAchievements", () => {
  it("returns every keepsake locked for an untouched journey", () => {
    const achievements = getAchievements(base);
    expect(achievements).toHaveLength(10);
    expect(achievements.every((achievement) => !achievement.unlocked)).toBe(true);
  });

  it("unlocks chapter and heart milestones at their exact targets", () => {
    const achievements = getAchievements({ ...base, visitedCount: 6, heartCount: 6 });
    expect(achievements.find((item) => item.id === "whole-story")?.unlocked).toBe(true);
    expect(achievements.find((item) => item.id === "heart-keeper")?.unlocked).toBe(true);
  });

  it("derives activity keepsakes from recorded browser activity", () => {
    const achievements = getAchievements({ ...base, activities: new Set(["letter-read", "music-listened"]) });
    expect(achievements.find((item) => item.id === "letter-reader")?.unlocked).toBe(true);
    expect(achievements.find((item) => item.id === "our-soundtrack")?.unlocked).toBe(true);
    expect(achievements.find((item) => item.id === "cinema-night")?.unlocked).toBe(false);
  });

  it("caps displayed progress at each achievement target", () => {
    const achievements = getAchievements({ ...base, favoriteCount: 20, visitedCount: 20 });
    expect(achievements.find((item) => item.id === "memory-curator")?.current).toBe(3);
    expect(achievements.find((item) => item.id === "first-page")?.current).toBe(1);
  });
});

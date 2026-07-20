import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { chapters, memories } from "./data";
import { ProgressProvider, useProgress } from "./progress";

describe("ProgressProvider", () => {
  it("starts with curated favorites and allows removing one", () => {
    const { result } = renderHook(() => useProgress(), { wrapper: ProgressProvider });
    const seededFavorites = memories.filter((memory) => memory.favorite);

    expect(result.current.favorites.size).toBe(seededFavorites.length);

    act(() => result.current.toggleFavorite(seededFavorites[0].id));

    expect(result.current.favorites.has(seededFavorites[0].id)).toBe(false);
    expect(JSON.parse(localStorage.getItem("birthdayJourney:v1:favorites") ?? "[]")).not.toContain(seededFavorites[0].id);
  });

  it("persists chapter visits and unlocks the finale", () => {
    const { result, unmount } = renderHook(() => useProgress(), { wrapper: ProgressProvider });

    act(() => chapters.forEach((chapter) => result.current.visitChapter(chapter.id)));

    expect(result.current.journeyComplete).toBe(true);
    expect(result.current.progressPercent).toBe(100);

    unmount();
    const restored = renderHook(() => useProgress(), { wrapper: ProgressProvider });
    expect(restored.result.current.visitedChapters.size).toBe(chapters.length);
  });

  it("records a hidden heart once and derives activity achievements", () => {
    const { result } = renderHook(() => useProgress(), { wrapper: ProgressProvider });

    let firstDiscovery = false;
    act(() => { firstDiscovery = result.current.findHeart("heart-how-we-met"); });
    let duplicateDiscovery = true;
    act(() => { duplicateDiscovery = result.current.findHeart("heart-how-we-met"); });
    act(() => result.current.recordActivity("music-listened"));

    expect(firstDiscovery).toBe(true);
    expect(duplicateDiscovery).toBe(false);
    expect(result.current.foundHearts.size).toBe(1);
    expect(result.current.achievements.find((item) => item.id === "our-soundtrack")?.unlocked).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { chapters, getMediaForMemory, getMemory, getVideoForMemory, media, places, songs } from "./data";

describe("content selectors", () => {
  it("resolves every chapter's canonical memory", () => {
    expect(chapters.every((chapter) => getMemory(chapter.memoryId))).toBe(true);
  });

  it("keeps every place relationship valid", () => {
    const linkedIds = places.flatMap((place) => place.memoryIds);
    expect(linkedIds.every((id) => getMemory(id))).toBe(true);
  });

  it("keeps songs ordered and connected to known memories", () => {
    expect(songs.map((song) => song.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(songs[0]).toMatchObject({ id: "song-birthday-indonesia", opening: true });
    expect(songs.every((song) => song.audioPath)).toBe(true);
    expect(songs.every((song) => !song.memoryId || getMemory(song.memoryId))).toBe(true);
  });

  it("connects the approved personal media to every memory", () => {
    expect(media).toHaveLength(72);
    expect(new Set(media.map((item) => item.sources.mediumWebp)).size).toBe(media.length);
    expect(getMemory("our-first-hello")?.date).toBe("2022-08-21");
    expect(getMediaForMemory("our-first-hello")?.alt).toContain("August 21, 2022");
    expect(getVideoForMemory("our-first-hello")).toBeUndefined();
  });
});

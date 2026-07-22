import { describe, expect, it } from "vitest";
import { memories } from "./data";
import { createMemoryLoadFixture, filterMemories, normalizeSearchText } from "./search";

describe("memory search", () => {
  it("normalizes case and diacritics", () => {
    expect(normalizeSearchText("  Kyōto Éternel  ")).toBe("kyoto eternel");
  });

  it("matches all query terms across people, tags, and locations", () => {
    const result = filterMemories(memories, {
      query: "Rayden Japan",
      category: "All memories",
      favoritesOnly: false,
      favorites: new Set(),
    });
    expect(result.map((memory) => memory.id)).toContain("our-japan-chapter");
    expect(result.every((memory) => memory.people.includes("Rayden"))).toBe(true);
  });

  it("combines category and browser-favorite filters", () => {
    const result = filterMemories(memories, {
      query: "",
      category: "Family",
      favoritesOnly: true,
      favorites: new Set(["hello-rayden", "our-first-hello"]),
    });
    expect(result.map((memory) => memory.id)).toEqual(["hello-rayden"]);
  });

  it("returns no items when every term cannot match", () => {
    const result = filterMemories(memories, {
      query: "Rayden wedding",
      category: "All memories",
      favoritesOnly: false,
      favorites: new Set(),
    });
    expect(result).toEqual([]);
  });

  it("creates a stable 300-record load fixture with unique IDs", () => {
    const fixture = createMemoryLoadFixture(memories, 300);

    expect(fixture).toHaveLength(300);
    expect(new Set(fixture.map((memory) => memory.id)).size).toBe(300);
    expect(fixture.every((memory) => !memory.favorite)).toBe(true);
  });
});

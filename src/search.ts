import type { Memory } from "./types";

export interface MemoryFilters {
  query: string;
  category: string;
  favoritesOnly: boolean;
  favorites: Set<string>;
}

export function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}

export function searchableMemoryText(memory: Memory) {
  return normalizeSearchText([
    memory.title,
    memory.date,
    memory.location,
    memory.category,
    memory.summary,
    ...memory.people,
    ...memory.tags,
  ].join(" "));
}

export function filterMemories(items: Memory[], filters: MemoryFilters) {
  const terms = normalizeSearchText(filters.query).split(/\s+/).filter(Boolean);
  return items.filter((memory) => {
    const searchable = searchableMemoryText(memory);
    const matchesQuery = terms.every((term) => searchable.includes(term));
    const matchesCategory = filters.category === "All memories" || memory.category === filters.category;
    const matchesFavorite = !filters.favoritesOnly || filters.favorites.has(memory.id);
    return matchesQuery && matchesCategory && matchesFavorite;
  });
}

export function createMemoryLoadFixture(items: Memory[], count: number) {
  if (!items.length || count <= 0) return [];
  return Array.from({ length: count }, (_, index) => {
    const source = items[index % items.length];
    const copyNumber = Math.floor(index / items.length) + 1;
    return {
      ...source,
      id: `${source.id}-load-${index + 1}`,
      title: copyNumber === 1 ? source.title : `${source.title} · ${copyNumber}`,
      favorite: false,
    };
  });
}

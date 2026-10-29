import "server-only";

import type { Person, Tag } from "../types";
import { normalizeTagName } from "../validation";
import { delay, store } from "./store";

export async function searchPeople(query: string, limit = 10): Promise<Person[]> {
  await delay(100);
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return store()
    .people.filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, limit);
}

export async function searchTags(query: string, limit = 10): Promise<Tag[]> {
  await delay(100);
  const q = normalizeTagName(query).toLowerCase();
  if (!q) return [];
  return store()
    .tags.filter((t) => t.name.toLowerCase().includes(q))
    .slice(0, limit);
}

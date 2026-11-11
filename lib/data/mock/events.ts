import "server-only";

import type {
  EventDetail,
  EventInput,
  EventSummary,
  MutationResult,
  Page,
  Person,
  Tag,
} from "../types";
import { normalizeTagName, validateEventInput } from "../validation";
import { delay, store, type MockEvent } from "./store";

function toTag(id: string): Tag | null {
  return store().tags.find((t) => t.id === id) ?? null;
}

function toPerson(id: string): Person | null {
  return store().people.find((p) => p.id === id) ?? null;
}

function toSummary(e: MockEvent): EventSummary {
  return {
    id: e.id,
    title: e.title,
    heldAt: e.heldAt,
    place: e.place,
    coverPhotoUrl: e.photoUrls[0] ?? null,
    tags: e.tagIds.map(toTag).filter((t): t is Tag => t !== null),
    participantCount: e.personIds.length,
  };
}

function toDetail(e: MockEvent): EventDetail {
  return {
    id: e.id,
    title: e.title,
    heldAt: e.heldAt,
    place: e.place,
    memo: e.memo,
    photos: e.photoUrls.map((url, i) => ({ id: `${e.id}-photo-${i}`, url, position: i })),
    participants: e.personIds.map(toPerson).filter((p): p is Person => p !== null),
    tags: e.tagIds.map(toTag).filter((t): t is Tag => t !== null),
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

function sortByHeldAtDesc(events: MockEvent[]) {
  return [...events].sort((a, b) => Date.parse(b.heldAt) - Date.parse(a.heldAt));
}

function paginate<T>(items: T[], cursor: string | null | undefined, limit: number): Page<T> {
  const start = cursor ? Number(cursor) : 0;
  const page = items.slice(start, start + limit);
  const next = start + limit;
  return { items: page, nextCursor: next < items.length ? String(next) : null };
}

export async function listEvents(options: { cursor?: string | null; limit?: number } = {}) {
  await delay();
  const events = sortByHeldAtDesc(store().events).map(toSummary);
  return paginate(events, options.cursor, options.limit ?? 20);
}

export async function getEvent(id: string): Promise<EventDetail | null> {
  await delay();
  const e = store().events.find((ev) => ev.id === id);
  return e ? toDetail(e) : null;
}

export async function searchEvents(
  query: string,
  options: { cursor?: string | null; limit?: number } = {},
): Promise<Page<EventSummary>> {
  await delay();
  const q = normalizeTagName(query).toLowerCase();
  if (!q) return { items: [], nextCursor: null };

  const hits = store().events.filter((e) => {
    const texts = [
      e.title,
      e.place ?? "",
      ...e.tagIds.map((id) => toTag(id)?.name ?? ""),
      ...e.personIds.map((id) => toPerson(id)?.name ?? ""),
    ];
    return texts.some((t) => t.toLowerCase().includes(q));
  });
  return paginate(sortByHeldAtDesc(hits).map(toSummary), options.cursor, options.limit ?? 20);
}

/** 参加者・タグを解決して ID の配列にする（新しい人・タグはここで作成） */
function resolveRelations(input: EventInput) {
  const s = store();

  const personIds: string[] = [];
  for (const p of input.participants) {
    if ("personId" in p) {
      if (!s.people.some((x) => x.id === p.personId)) return null;
      personIds.push(p.personId);
    } else {
      const person = { id: crypto.randomUUID(), name: p.name.trim(), note: p.note?.trim() || null };
      s.people.push(person);
      personIds.push(person.id);
    }
  }

  const tagIds: string[] = [];
  for (const raw of input.tags) {
    const name = normalizeTagName(raw);
    let tag = s.tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (!tag) {
      tag = { id: crypto.randomUUID(), name };
      s.tags.push(tag);
    }
    tagIds.push(tag.id);
  }

  return { personIds: [...new Set(personIds)], tagIds: [...new Set(tagIds)] };
}

export async function createEvent(input: EventInput): Promise<MutationResult<{ id: string }>> {
  await delay();
  const errors = validateEventInput(input);
  if (errors) return { ok: false, errors };

  const rel = resolveRelations(input);
  if (!rel) return { ok: false, errors: { participants: "選択された参加者が見つかりません" } };

  const now = new Date().toISOString();
  const event: MockEvent = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    heldAt: new Date(input.heldAt).toISOString(),
    place: input.place?.trim() || null,
    memo: input.memo?.trim() || null,
    photoUrls: [],
    ...rel,
    createdAt: now,
    updatedAt: now,
  };
  store().events.push(event);
  return { ok: true, data: { id: event.id } };
}

export async function updateEvent(id: string, input: EventInput): Promise<MutationResult> {
  await delay();
  const event = store().events.find((e) => e.id === id);
  if (!event) return { ok: false, errors: { form: "飲み会が見つかりません" } };

  const errors = validateEventInput(input);
  if (errors) return { ok: false, errors };

  const rel = resolveRelations(input);
  if (!rel) return { ok: false, errors: { participants: "選択された参加者が見つかりません" } };

  Object.assign(event, {
    title: input.title.trim(),
    heldAt: new Date(input.heldAt).toISOString(),
    place: input.place?.trim() || null,
    memo: input.memo?.trim() || null,
    ...rel,
    updatedAt: new Date().toISOString(),
  });
  return { ok: true, data: undefined };
}

export async function deleteEvent(id: string): Promise<MutationResult> {
  await delay();
  const s = store();
  const index = s.events.findIndex((e) => e.id === id);
  if (index === -1) return { ok: false, errors: { form: "飲み会が見つかりません" } };
  s.events.splice(index, 1);
  return { ok: true, data: undefined };
}

"use server";

// 入力補完用の Server Action（Client Component から入力のたびに呼ぶ想定）

import { searchPeople, searchTags } from "@/lib/data/suggestions";
import type { Person, Tag } from "@/lib/data/types";

export async function searchPeopleAction(query: string): Promise<Person[]> {
  return searchPeople(query);
}

export async function searchTagsAction(query: string): Promise<Tag[]> {
  return searchTags(query);
}

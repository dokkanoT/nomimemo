import "server-only";

// 参加者・タグの入力補完用（サーバー専用）
// Client Component からは lib/actions/suggestions.ts を使う。
//
// TODO(#7): モックから Supabase の実装に差し替える。

import * as mock from "./mock/suggestions";
import type { Person, Tag } from "./types";

/** 名前の部分一致。同姓同名もそれぞれ返るので note と一緒に表示する */
export async function searchPeople(query: string, limit = 10): Promise<Person[]> {
  return mock.searchPeople(query, limit);
}

/** タグ名の部分一致（先頭の # は無視） */
export async function searchTags(query: string, limit = 10): Promise<Tag[]> {
  return mock.searchTags(query, limit);
}

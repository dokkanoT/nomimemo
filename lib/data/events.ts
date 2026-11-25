import "server-only";

// 飲み会データの取得・保存（サーバー専用）
// 画面からはこのファイルの関数か、lib/actions/ の Server Action を使う。
//
// TODO(#5): 中身をモックから Supabase の実装に差し替える。
//           関数名・引数・戻り値の型は変えないので、画面側の修正は不要。

import { connection } from "next/server";
import * as mock from "./mock/events";
import type { EventDetail, EventInput, EventSummary, MutationResult, Page } from "./types";

/**
 * タイムライン用の一覧（開催日時の新しい順）
 * 続きを読むときは前回の nextCursor を cursor に渡す。
 */
export async function listEvents(
  options: { cursor?: string | null; limit?: number } = {},
): Promise<Page<EventSummary>> {
  // 本物はログイン情報（cookie）を読むのでリクエスト時に実行される。モックでも同じ動きにしておく。
  await connection();
  return mock.listEvents(options);
}

/** 詳細。見つからない（または他人の飲み会）なら null */
export async function getEvent(id: string): Promise<EventDetail | null> {
  await connection();
  return mock.getEvent(id);
}

/** タイトル・場所・タグ名・参加者名の部分一致で検索 */
export async function searchEvents(
  query: string,
  options: { cursor?: string | null; limit?: number } = {},
): Promise<Page<EventSummary>> {
  await connection();
  return mock.searchEvents(query, options);
}

export async function createEvent(input: EventInput): Promise<MutationResult<{ id: string }>> {
  return mock.createEvent(input);
}

export async function updateEvent(id: string, input: EventInput): Promise<MutationResult> {
  return mock.updateEvent(id, input);
}

export async function deleteEvent(id: string): Promise<MutationResult> {
  return mock.deleteEvent(id);
}

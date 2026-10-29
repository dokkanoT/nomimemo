// 画面で使うデータの型
// DB の列名（snake_case）ではなく、画面向けの camelCase に揃えている。
// DB そのものの型は types/database.ts（自動生成）を参照。

/** 日時は ISO 8601 文字列（例: "2026-10-24T19:00:00+09:00"） */
export type ISODateString = string;

export type Person = {
  id: string;
  name: string;
  /** 同姓同名を見分けるための一言（例: "テニサー"） */
  note: string | null;
};

export type Tag = {
  id: string;
  /** 先頭の # は付かない（表示時に付ける） */
  name: string;
};

export type Photo = {
  id: string;
  /** そのまま <img src> に使える URL */
  url: string;
  /** 小さい順に表示 */
  position: number;
};

/** タイムライン・検索結果のカード1枚分 */
export type EventSummary = {
  id: string;
  title: string;
  heldAt: ISODateString;
  place: string | null;
  /** 1枚目の写真。写真がなければ null */
  coverPhotoUrl: string | null;
  tags: Tag[];
  participantCount: number;
};

/** 飲み会詳細画面 */
export type EventDetail = {
  id: string;
  title: string;
  heldAt: ISODateString;
  place: string | null;
  memo: string | null;
  photos: Photo[];
  participants: Person[];
  tags: Tag[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

/**
 * 参加者の指定方法
 * - 既存の人を選んだ → personId
 * - 新しく追加する   → name（と note）
 * 同姓同名を許しているので、既存の人は必ず ID で指定する。
 */
export type ParticipantInput = { personId: string } | { name: string; note?: string | null };

/** 飲み会の作成・更新で渡すデータ */
export type EventInput = {
  title: string;
  heldAt: ISODateString;
  place?: string | null;
  memo?: string | null;
  participants: ParticipantInput[];
  /** タグ名の配列。既存なら再利用、なければ作成される。先頭の # は付けても外される */
  tags: string[];
  // 写真は #6 で追加予定
};

export type Page<T> = {
  items: T[];
  /** 次のページを取るときに渡す値。最後のページなら null */
  nextCursor: string | null;
};

/** 入力エラー（項目名 → メッセージ）。form は項目に紐づかない全体のエラー */
export type FieldErrors = Partial<Record<keyof EventInput | "form", string>>;

/** 作成・更新の結果 */
export type MutationResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; errors: FieldErrors };

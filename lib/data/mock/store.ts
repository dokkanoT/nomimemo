import "server-only";

// モック用のメモリ上のデータ置き場（#5 で Supabase の実装に差し替える）
// 開発サーバーを再起動すると初期データに戻る。

type MockEvent = {
  id: string;
  title: string;
  heldAt: string;
  place: string | null;
  memo: string | null;
  photoUrls: string[];
  personIds: string[];
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
};

type MockPerson = { id: string; name: string; note: string | null };
type MockTag = { id: string; name: string };

type MockStore = {
  events: MockEvent[];
  people: MockPerson[];
  tags: MockTag[];
};

function seed(): MockStore {
  const people: MockPerson[] = [
    { id: "person-1", name: "田中", note: "テニサー" },
    { id: "person-2", name: "田中", note: "バイト先" },
    { id: "person-3", name: "佐藤", note: null },
    { id: "person-4", name: "鈴木", note: "ゼミ" },
    { id: "person-5", name: "伊藤", note: "先生" },
    { id: "person-6", name: "伊藤", note: "SS" },
    { id: "person-7", name: "高橋", note: null },
  ];
  const tags: MockTag[] = [
    { id: "tag-1", name: "AWS" },
    { id: "tag-2", name: "就活" },
    { id: "tag-3", name: "CTF" },
    { id: "tag-4", name: "野球" },
    { id: "tag-5", name: "資格" },
    { id: "tag-6", name: "インターン" },
  ];
  const ev = (
    n: number,
    title: string,
    heldAt: string,
    place: string | null,
    memo: string | null,
    photos: number[],
    personIds: string[],
    tagIds: string[],
  ): MockEvent => ({
    id: `event-${n}`,
    title,
    heldAt,
    place,
    memo,
    photoUrls: photos.map((p) => `/mock/photo-${p}.svg`),
    personIds,
    tagIds,
    createdAt: heldAt,
    updatedAt: heldAt,
  });
  const events: MockEvent[] = [
    ev(1, "テニサー秋合宿の打ち上げ", "2026-10-24T19:00:00+09:00", "鳥貴族 渋谷店",
      "田中（テニサー）が AWS SAA に合格したらしい。次はSAPを狙うとのこと。",
      [1, 2, 3], ["person-1", "person-3", "person-7"], ["tag-1", "tag-5"]),
    ev(2, "ゼミの懇親会", "2026-10-17T18:30:00+09:00", "大学近くの居酒屋",
      "鈴木が夏にインターン行ってた。来年の就活の話で盛り上がった。",
      [4], ["person-4", "person-5"], ["tag-2", "tag-6"]),
    ev(3, "バイト先の送別会", "2026-10-10T20:00:00+09:00", "笑笑 新宿店",
      null, [5, 6], ["person-2", "person-6"], ["tag-4"]),
    ev(4, "CTF 勉強会のあと", "2026-10-03T21:00:00+09:00", null,
      "伊藤（SS）が Web 問得意。次の大会一緒に出ようと誘われた。",
      [], ["person-6", "person-7"], ["tag-3"]),
    ev(5, "クラスの交流会", "2026-09-26T19:00:00+09:00", "磯丸水産",
      null, [3], ["person-3"], []),
    ev(6, "野球観戦のあと一杯", "2026-09-19T21:30:00+09:00", "神宮外苑の焼き鳥屋",
      "佐藤はヤクルトファン。", [2], ["person-3", "person-4"], ["tag-4"]),
  ];
  return { events, people, tags };
}

// 開発中のホットリロードでデータが消えないように globalThis に置く
const g = globalThis as typeof globalThis & { __nomimemoMock?: MockStore };

export function store(): MockStore {
  g.__nomimemoMock ??= seed();
  return g.__nomimemoMock;
}

export type { MockEvent, MockPerson, MockTag };

/** 読み込み中の表示を確認できるように少し待つ */
export function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

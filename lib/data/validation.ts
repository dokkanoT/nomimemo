// 入力チェック。DB の制約（supabase/migrations）と同じ上限にしている。
// サーバーでもブラウザでも使えるので、フォームのその場チェックにも使ってよい。
import type { EventInput, FieldErrors } from "./types";

export const LIMITS = {
  title: 100,
  place: 100,
  memo: 5000,
  personName: 50,
  personNote: 100,
  tagName: 30,
} as const;

/** "#AWS " → "AWS" */
export function normalizeTagName(name: string): string {
  return name.trim().replace(/^#+/, "").trim();
}

export function validateEventInput(input: EventInput): FieldErrors | null {
  const errors: FieldErrors = {};

  const title = input.title.trim();
  if (!title) errors.title = "タイトルを入力してください";
  else if (title.length > LIMITS.title) errors.title = `タイトルは${LIMITS.title}文字以内にしてください`;

  if (!input.heldAt || Number.isNaN(Date.parse(input.heldAt))) {
    errors.heldAt = "日時を入力してください";
  }

  if (input.place && input.place.trim().length > LIMITS.place) {
    errors.place = `場所は${LIMITS.place}文字以内にしてください`;
  }

  if (input.memo && input.memo.length > LIMITS.memo) {
    errors.memo = `メモは${LIMITS.memo}文字以内にしてください`;
  }

  for (const p of input.participants) {
    if ("personId" in p) continue;
    const name = p.name.trim();
    if (!name) {
      errors.participants = "参加者の名前を入力してください";
      break;
    }
    if (name.length > LIMITS.personName) {
      errors.participants = `参加者の名前は${LIMITS.personName}文字以内にしてください`;
      break;
    }
    if (p.note && p.note.trim().length > LIMITS.personNote) {
      errors.participants = `参加者のメモは${LIMITS.personNote}文字以内にしてください`;
      break;
    }
  }

  for (const t of input.tags) {
    const name = normalizeTagName(t);
    if (!name) {
      errors.tags = "空のタグがあります";
      break;
    }
    if (name.length > LIMITS.tagName) {
      errors.tags = `タグは${LIMITS.tagName}文字以内にしてください`;
      break;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

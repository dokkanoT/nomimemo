# データの使い方（フロント担当向け）

画面からデータを読む・保存するための関数の使い方です。
**今はモック（ダミーデータ）で動いています。** 本物の DB に切り替わっても、関数の呼び出し方は変わりません。

> モックのデータはメモリ上にあるので、**開発サーバーを再起動すると初期データに戻ります**。
> 読み込み中の表示を確認しやすいように、わざと 0.3 秒待つようにしています。

---

## どれを使えばいい？

| やりたいこと | 使う関数 | import 元 | どこから呼ぶ |
|---|---|---|---|
| タイムラインを表示 | `listEvents()` | `@/lib/data/events` | Server Component |
| 詳細を表示 | `getEvent(id)` | `@/lib/data/events` | Server Component |
| 検索結果を表示 | `searchEvents(q)` | `@/lib/data/events` | Server Component |
| 飲み会を作成 | `createEventAction(input)` | `@/lib/actions/events` | Client Component（フォーム） |
| 飲み会を更新 | `updateEventAction(id, input)` | `@/lib/actions/events` | Client Component |
| 飲み会を削除 | `deleteEventAction(id)` | `@/lib/actions/events` | Client Component |
| 参加者の入力補完 | `searchPeopleAction(q)` | `@/lib/actions/suggestions` | Client Component |
| タグの入力補完 | `searchTagsAction(q)` | `@/lib/actions/suggestions` | Client Component |
| 入力チェック（その場で） | `validateEventInput(input)` | `@/lib/data/validation` | どこでも |

- **読む**ときは `lib/data/`。サーバー専用なので、Client Component（`"use client"`）から import するとエラーになります
- **書く**ときは `lib/actions/`（Server Action）。Client Component から普通の関数のように呼べます

型はすべて [`lib/data/types.ts`](../lib/data/types.ts) にあります。

---

## A さん向け：一覧と詳細を表示する

### ⚠️ 必ず `<Suspense>` で囲む

このプロジェクトは Next.js の **Cache Components** が有効になっています。
データを読むコンポーネントは `<Suspense>` で囲まないと**ビルドエラー**になります（または `loading.tsx` を置く）。

```tsx
// app/page.tsx
import { Suspense } from "react";
import { listEvents } from "@/lib/data/events";

export default function Home() {
  return (
    <main>
      <h1>タイムライン</h1>
      <Suspense fallback={<p>読み込み中…</p>}>
        <Timeline />
      </Suspense>
    </main>
  );
}

async function Timeline() {
  const { items, nextCursor } = await listEvents();

  if (items.length === 0) return <p>まだ飲み会がありません</p>;

  return (
    <ul>
      {items.map((e) => (
        <li key={e.id}>
          {e.coverPhotoUrl && <img src={e.coverPhotoUrl} alt="" />}
          <p>{e.title}</p>
          <p>{new Date(e.heldAt).toLocaleString("ja-JP")}</p>
          <p>{e.tags.map((t) => `#${t.name}`).join(" ")}</p>
        </li>
      ))}
    </ul>
  );
}
```

### 続きを読む（ページ送り）

1回で最大 20 件です。`nextCursor` が `null` でなければ続きがあります。

```ts
const first = await listEvents({ limit: 20 });
const second = await listEvents({ cursor: first.nextCursor, limit: 20 });
```

### 詳細

```tsx
// app/events/[id]/page.tsx
import { notFound } from "next/navigation";
import { getEvent } from "@/lib/data/events";

async function Detail({ id }: { id: string }) {
  const event = await getEvent(id);
  if (!event) notFound(); // 存在しない or 他人の飲み会
  // event.photos / event.participants / event.tags / event.memo
}
```

> `params` の受け取り方は Next.js 16 で変わっています。`node_modules/next/dist/docs/` で確認してください。

---

## B さん向け：フォームから保存する

### 作成

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createEventAction } from "@/lib/actions/events";
import type { FieldErrors } from "@/lib/data/types";

export function NewEventForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createEventAction({
        title: String(formData.get("title") ?? ""),
        heldAt: new Date(String(formData.get("heldAt"))).toISOString(),
        place: String(formData.get("place") ?? ""),
        memo: String(formData.get("memo") ?? ""),
        participants: [
          { personId: "person-1" },           // 既存の人を選んだ
          { name: "新人", note: "1年" },        // 新しく追加
        ],
        tags: ["AWS", "#就活"],               // # は付けても外れる
      });

      if (result.ok) router.push(`/events/${result.data.id}`);
      else setErrors(result.errors);
    });
  }

  return (
    <form action={onSubmit}>
      <input name="title" />
      {errors.title && <p>{errors.title}</p>}
      {/* … */}
      <button disabled={pending}>{pending ? "保存中…" : "保存"}</button>
    </form>
  );
}
```

### 結果の見方

保存系はすべて **例外を投げずに結果を返します**。

```ts
type MutationResult<T> =
  | { ok: true; data: T }               // 成功
  | { ok: false; errors: FieldErrors }; // 失敗（項目名 → メッセージ）
```

`errors` のキーは `title` / `heldAt` / `place` / `memo` / `participants` / `tags`、
どの項目でもない全体のエラーは `form` に入ります。

### 参加者の指定方法（重要）

**同姓同名を許している**ので、既存の人は**名前ではなく ID で**指定します。

```ts
participants: [
  { personId: "person-1" },            // 入力補完で選んだ既存の人
  { name: "田中", note: "テニサー" },   // 「＋新しい人として追加」を選んだ場合
]
```

### 入力補完

```ts
import { searchPeopleAction, searchTagsAction } from "@/lib/actions/suggestions";

const people = await searchPeopleAction("田中");
// → [{ id: "person-1", name: "田中", note: "テニサー" }, { id: "person-2", name: "田中", note: "バイト先" }]
// 「田中（テニサー）」のように note も一緒に表示する

const tags = await searchTagsAction("aw"); // → [{ id: "tag-1", name: "AWS" }]
```

### その場の入力チェック

保存時にサーバーでもチェックしますが、入力中に表示したいときは同じルールを使えます。

```ts
import { LIMITS, validateEventInput } from "@/lib/data/validation";

LIMITS.title; // 100
const errors = validateEventInput(input); // 問題なければ null
```

---

## モックの初期データ

| ID | タイトル | 写真 | ポイント |
|---|---|---|---|
| `event-1` | テニサー秋合宿の打ち上げ | 3枚 | タグ・参加者・メモあり |
| `event-2` | ゼミの懇親会 | 1枚 | |
| `event-3` | バイト先の送別会 | 2枚 | メモなし |
| `event-4` | CTF 勉強会のあと | **なし** | 場所なし。写真がない場合の表示確認に |
| `event-5` | クラスの交流会 | 1枚 | **タグなし** |
| `event-6` | 野球観戦のあと一杯 | 1枚 | |

人には同姓同名（`田中` × 2、`伊藤` × 2）を入れてあります。
写真は `public/mock/` の仮画像です。

---

## まだないもの

| 機能 | Issue |
|---|---|
| ログイン（今は誰でも全データが見える） | #4 |
| 本物の DB への保存 | #5 |
| 写真のアップロード | #6 |

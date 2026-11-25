"use server";

// フォームやボタンから呼ぶ Server Action
// 成功・失敗は戻り値の ok で判定する（例外は投げない）。

import { revalidatePath } from "next/cache";
import { createEvent, deleteEvent, updateEvent } from "@/lib/data/events";
import type { EventInput, MutationResult } from "@/lib/data/types";

export async function createEventAction(
  input: EventInput,
): Promise<MutationResult<{ id: string }>> {
  // TODO(#4): 未ログインなら弾く
  const result = await createEvent(input);
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

export async function updateEventAction(id: string, input: EventInput): Promise<MutationResult> {
  const result = await updateEvent(id, input);
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

export async function deleteEventAction(id: string): Promise<MutationResult> {
  const result = await deleteEvent(id);
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

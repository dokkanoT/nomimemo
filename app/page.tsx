"use client";

import { Header } from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { EventCard, type EventCardProps } from "@/components/ui/event-card";

// モックアップ画像に基づいた仮データ（サークル飲み会・クラス打ち上げ・LT会後飲み）
const MOCK_EVENTS: EventCardProps[] = [
  {
    id: "1",
    title: "サークル飲み会",
    heldAt: "2026/10/15 18:00",
    place: "大衆酒場 つにま",
    photoUrl:
      "https://images.unsplash.com/photo-1574096079513-d8259312b785?w=800&auto=format&fit=crop&q=80",
    dateBadge: "2026.10.15",
    participants: [
      {
        name: "山田",
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "板野",
        avatarUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "鈴木",
        avatarUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      },
    ],
    totalParticipantsCount: 6,
    tags: ["AWS", "教育", "野球", "CTF"],
    memo: "インターン応援で盛り上がった",
  },
  {
    id: "2",
    title: "クラス打ち上げ",
    heldAt: "2026/10/10 19:00",
    place: "キッチン ハル",
    photoUrl:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80",
    dateBadge: "2026.10.10",
    participants: [
      {
        name: "佐野",
        avatarUrl:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "西本",
        avatarUrl:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "田中",
        avatarUrl:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
      },
    ],
    totalParticipantsCount: 5,
    tags: ["花火", "旅行"],
    memo: "発表おつかれさま！次はみんなで旅行へ。",
  },
  {
    id: "3",
    title: "LT会後飲み",
    heldAt: "2026/10/03 18:30",
    place: "クラフト楽",
    photoUrl:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80",
    dateBadge: "2026.10.03",
    participants: [
      {
        name: "山田",
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "鈴木",
        avatarUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      },
      {
        name: "田中",
        avatarUrl:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
      },
    ],
    totalParticipantsCount: 4,
    tags: ["AWS", "CTF", "資格"],
    memo: "AWSの構成と、最近解いたCTFの話。",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex justify-center">
      {/* スマホ画面コンテナ（最大幅448px、PCで見ても中央にスマホ枠として綺麗に表示） */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col shadow-xl relative pb-28">
        {/* 上部ヘッダー */}
        <Header />

        {/* メインコンテンツ */}
        <main className="flex-1 px-4 pt-4">
          {/* サブヘッダー */}
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-orange-500 tracking-wide">
              飲み会版Instagram
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              飲み会の記録
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              参加者・話題・メモを確認できます。
            </p>
          </div>

          {/* フィルタータブ & 年月 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full bg-slate-900 px-3.5 py-1 text-xs font-semibold text-white shadow-xs"
              >
                すべて
              </button>
              <button
                type="button"
                className="rounded-full px-3.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors"
              >
                写真あり
              </button>
            </div>
            <span className="text-xs font-medium text-slate-400">
              2026年10月
            </span>
          </div>

          {/* タイムラインカード一覧 */}
          <section aria-label="タイムライン一覧" className="space-y-4">
            {MOCK_EVENTS.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </section>

          {/* フッター件数表示 */}
          <div className="mt-8 mb-4 text-center">
            <p className="text-xs text-slate-400 font-medium">
              今月の記録は {MOCK_EVENTS.length} 件です。
            </p>
          </div>
        </main>

        {/* 新規作成ボタン（右下浮遊） */}
        <FloatingActionButton />

        {/* ボトムナビゲーション */}
        <BottomNav currentTab="home" />
      </div>
    </div>
  );
}

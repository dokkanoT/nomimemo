"use client";

import { LogoIcon, SearchIcon, BellIcon } from "./icons";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white/95 px-5 py-3 backdrop-blur-sm border-b border-slate-100">
      {/* ロゴ */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
          <LogoIcon className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-orange-500">
          nomiメモ
        </span>
      </div>

      {/* 右側のアクションアイコン */}
      <div className="flex items-center gap-2 text-slate-600">
        <button
          type="button"
          aria-label="検索"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="通知"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
        >
          <BellIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

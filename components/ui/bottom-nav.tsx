"use client";

import { HomeIcon, SearchIcon, SquarePlusIcon, UsersIcon, UserIcon } from "./icons";

interface BottomNavProps {
  currentTab?: "home" | "search" | "create" | "people" | "profile";
}

export function BottomNav({ currentTab = "home" }: BottomNavProps) {
  const navItems = [
    { id: "home", label: "ホーム", icon: HomeIcon },
    { id: "search", label: "検索", icon: SearchIcon },
    { id: "create", label: "作成", icon: SquarePlusIcon },
    { id: "people", label: "人別", icon: UsersIcon },
    { id: "profile", label: "プロフィール", icon: UserIcon },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors ${
                isActive
                  ? "text-orange-500 font-semibold"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-[10px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

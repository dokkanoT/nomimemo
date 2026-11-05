"use client";

import { PlusIcon } from "./icons";

interface FloatingActionButtonProps {
  onClick?: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="飲み会を記録する"
      className="fixed bottom-20 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-500/30 transition-transform active:scale-95 hover:shadow-xl hover:shadow-orange-500/40"
    >
      <PlusIcon className="h-7 w-7 stroke-[3]" />
    </button>
  );
}

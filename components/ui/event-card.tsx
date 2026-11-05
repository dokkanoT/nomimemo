"use client";

/* eslint-disable @next/next/no-img-element */
import { ClockIcon, MoreHorizontalIcon, MemoIcon } from "./icons";

export interface Participant {
  name: string;
  avatarUrl?: string;
}

export interface EventCardProps {
  id?: string;
  title: string;
  heldAt: string;
  place?: string | null;
  photoUrl?: string | null;
  dateBadge?: string;
  participants?: Participant[];
  totalParticipantsCount?: number;
  tags?: string[];
  memo?: string | null;
  onClick?: () => void;
  onMenuClick?: () => void;
}

export function EventCard({
  title,
  heldAt,
  place,
  photoUrl,
  dateBadge,
  participants = [],
  totalParticipantsCount,
  tags = [],
  memo,
  onClick,
  onMenuClick,
}: EventCardProps) {
  // アバター表示（最大3人）
  const displayAvatars = participants.slice(0, 3);
  const participantNames = participants.map((p) => p.name).join("・");
  const extraCount =
    totalParticipantsCount && totalParticipantsCount > participants.length
      ? totalParticipantsCount - participants.length
      : 0;

  return (
    <article
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition-all hover:shadow-md cursor-pointer"
    >
      {/* 写真エリア */}
      {photoUrl && (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          <img
            src={photoUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
            loading="lazy"
          />
          {/* 日付バッジ */}
          {dateBadge && (
            <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 shadow-sm backdrop-blur-xs">
              <span className="text-xs font-semibold tracking-wider text-slate-800">
                {dateBadge}
              </span>
            </div>
          )}
        </div>
      )}

      {/* カード本文エリア */}
      <div className="p-4 space-y-3">
        {/* タイトル & メニュー */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-800 leading-snug">
            {title}
          </h2>
          <button
            type="button"
            aria-label="メニューを開く"
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick?.();
            }}
            className="text-slate-400 hover:text-slate-600 p-1 -mr-1 rounded-full transition-colors"
          >
            <MoreHorizontalIcon className="h-5 w-5" />
          </button>
        </div>

        {/* 日時 & 場所 */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <ClockIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>{heldAt}</span>
          {place && (
            <>
              <span className="text-slate-300">•</span>
              <span className="truncate">{place}</span>
            </>
          )}
        </div>

        {/* 参加者 */}
        {participants.length > 0 && (
          <div className="flex items-center gap-2 pt-0.5">
            {/* アバタースタック */}
            <div className="flex -space-x-1.5 overflow-hidden">
              {displayAvatars.map((person, idx) => (
                <div
                  key={`${person.name}-${idx}`}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white overflow-hidden bg-gradient-to-br from-amber-200 to-orange-300"
                >
                  {person.avatarUrl ? (
                    <img
                      src={person.avatarUrl}
                      alt={person.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-amber-900">
                      {person.name.slice(0, 1)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 参加者名 & 残り人数 */}
            <div className="text-xs text-slate-600 truncate">
              <span>{participantNames}</span>
              {extraCount > 0 && (
                <span className="ml-1 text-slate-400 font-medium">
                  +{extraCount}人
                </span>
              )}
            </div>
          </div>
        )}

        {/* 話題タグ */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-blue-50/80 px-2 py-0.5 text-xs font-medium text-blue-600"
              >
                #{tag.replace(/^#/, "")}
              </span>
            ))}
          </div>
        )}

        {/* メモ */}
        {memo && (
          <div className="flex items-start gap-1.5 pt-1 text-xs text-slate-600">
            <MemoIcon className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed text-slate-600">
              {memo}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

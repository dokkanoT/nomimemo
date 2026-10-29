-- nomiメモ 初期スキーマ
-- 方針:
--   - 全テーブルに user_id を持たせ、RLS は「user_id が自分」の1条件で統一する
--   - 子テーブルは (event_id, user_id) などの複合外部キーで親と同じ持ち主であることを保証する
--     （他人の飲み会に自分のタグを付ける、といったデータを DB レベルで作れなくする）
--   - 飲み会を消すと写真・参加者・タグの紐づけも消える。people / tags 自体は残る

-- ---------------------------------------------------------------
-- updated_at を自動更新するトリガー関数
-- ---------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------
-- events: 飲み会
-- ---------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  held_at timestamptz not null,
  place text check (char_length(place) <= 100),
  memo text check (char_length(memo) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

-- タイムライン（自分の飲み会を開催日時の新しい順）用
create index events_user_id_held_at_idx on public.events (user_id, held_at desc);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- event_photos: 飲み会の写真（実体は Storage、ここにはパスだけ）
-- ---------------------------------------------------------------
create table public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  user_id uuid not null default auth.uid(),
  storage_path text not null unique,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  foreign key (event_id, user_id) references public.events (id, user_id) on delete cascade
);

create index event_photos_event_id_user_id_position_idx
  on public.event_photos (event_id, user_id, position);

-- ---------------------------------------------------------------
-- people: 人（同姓同名は別人として登録できる。note で区別する）
-- ---------------------------------------------------------------
create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  note text check (char_length(note) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

-- 入力補完（名前の前方一致）用
create index people_user_id_name_idx on public.people (user_id, name);

create trigger people_set_updated_at
  before update on public.people
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- event_participants: 飲み会 × 人
-- ---------------------------------------------------------------
create table public.event_participants (
  event_id uuid not null,
  person_id uuid not null,
  user_id uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (event_id, person_id),
  foreign key (event_id, user_id) references public.events (id, user_id) on delete cascade,
  foreign key (person_id, user_id) references public.people (id, user_id) on delete cascade
);

create index event_participants_event_id_user_id_idx on public.event_participants (event_id, user_id);
create index event_participants_person_id_user_id_idx on public.event_participants (person_id, user_id);

-- ---------------------------------------------------------------
-- tags: 話題タグ（同じユーザー内で大文字小文字を区別せず一意。先頭の # は保存しない）
-- ---------------------------------------------------------------
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30 and name !~ '^#'),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index tags_user_id_lower_name_key on public.tags (user_id, lower(name));

-- ---------------------------------------------------------------
-- event_tags: 飲み会 × タグ
-- ---------------------------------------------------------------
create table public.event_tags (
  event_id uuid not null,
  tag_id uuid not null,
  user_id uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (event_id, tag_id),
  foreign key (event_id, user_id) references public.events (id, user_id) on delete cascade,
  foreign key (tag_id, user_id) references public.tags (id, user_id) on delete cascade
);

create index event_tags_event_id_user_id_idx on public.event_tags (event_id, user_id);
create index event_tags_tag_id_user_id_idx on public.event_tags (tag_id, user_id);

-- ---------------------------------------------------------------
-- 権限: ログインユーザーのみ。未ログイン（anon）には何も許可しない
-- ---------------------------------------------------------------
revoke all on
  public.events, public.event_photos, public.people,
  public.event_participants, public.tags, public.event_tags
from anon;

grant select, insert, update, delete on
  public.events, public.event_photos, public.people, public.tags
to authenticated;

grant select, insert, delete on
  public.event_participants, public.event_tags
to authenticated;

-- ---------------------------------------------------------------
-- RLS: 自分の行だけ読み書きできる
-- ---------------------------------------------------------------
alter table public.events enable row level security;
alter table public.event_photos enable row level security;
alter table public.people enable row level security;
alter table public.event_participants enable row level security;
alter table public.tags enable row level security;
alter table public.event_tags enable row level security;

-- events
create policy "自分の飲み会を参照" on public.events
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "自分の飲み会を作成" on public.events
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "自分の飲み会を更新" on public.events
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "自分の飲み会を削除" on public.events
  for delete to authenticated using ((select auth.uid()) = user_id);

-- event_photos
create policy "自分の写真を参照" on public.event_photos
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "自分の写真を追加" on public.event_photos
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "自分の写真を更新" on public.event_photos
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "自分の写真を削除" on public.event_photos
  for delete to authenticated using ((select auth.uid()) = user_id);

-- people
create policy "自分の人を参照" on public.people
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "自分の人を作成" on public.people
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "自分の人を更新" on public.people
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "自分の人を削除" on public.people
  for delete to authenticated using ((select auth.uid()) = user_id);

-- event_participants
create policy "自分の参加者紐づけを参照" on public.event_participants
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "自分の参加者紐づけを追加" on public.event_participants
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "自分の参加者紐づけを削除" on public.event_participants
  for delete to authenticated using ((select auth.uid()) = user_id);

-- tags
create policy "自分のタグを参照" on public.tags
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "自分のタグを作成" on public.tags
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "自分のタグを更新" on public.tags
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "自分のタグを削除" on public.tags
  for delete to authenticated using ((select auth.uid()) = user_id);

-- event_tags
create policy "自分のタグ紐づけを参照" on public.event_tags
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "自分のタグ紐づけを追加" on public.event_tags
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "自分のタグ紐づけを削除" on public.event_tags
  for delete to authenticated using ((select auth.uid()) = user_id);

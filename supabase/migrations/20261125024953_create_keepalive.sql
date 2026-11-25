-- Supabase 無料プランの自動一時停止（7日間アクセスなしで停止）を防ぐための表
-- GitHub Actions（.github/workflows/supabase-keepalive.yml）が週2回、この1行の pinged_at を更新する
--   - 行は常に1行だけ（id = 1 固定）。更新するだけなので表は大きくならない
--   - アプリからは使わない。anon / authenticated には何も許可しない
--   - RLS を有効にしてポリシーを作らないので、secret key（RLS を無視する）でしか書き込めない

create table public.keepalive (
  id smallint primary key default 1 check (id = 1),
  pinged_at timestamptz not null default now()
);

alter table public.keepalive enable row level security;

revoke all on public.keepalive from anon, authenticated;

insert into public.keepalive (id) values (1);

-- Run once in your Supabase SQL editor. No service-role key belongs in the browser.
create table if not exists public.farmer_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null default '{}'::jsonb
);
alter table public.farmer_workspaces enable row level security;
revoke all on public.farmer_workspaces from anon;
grant select, insert, update on public.farmer_workspaces to authenticated;
create policy "Read own workspace" on public.farmer_workspaces for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own workspace" on public.farmer_workspaces for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own workspace" on public.farmer_workspaces for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

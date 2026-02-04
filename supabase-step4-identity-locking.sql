-- Step 4: Identity + Locking + Findings (Phase 1)
-- Safe to run; does not modify existing tables.

-- Face registry for basic face verification (photo + name).
create table if not exists face_registry (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null, -- sanitation / area-lead / handover
  photo text not null, -- base64 with timestamp overlay
  created_at timestamptz default now(),
  last_seen_at timestamptz
);

alter table face_registry enable row level security;
create policy "face_registry_open_insert" on face_registry
  for insert with check (true);
create policy "face_registry_open_select" on face_registry
  for select using (true);
create policy "face_registry_open_update" on face_registry
  for update using (true) with check (true);

-- Lock table to prevent concurrent edits.
create table if not exists task_locks (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  task text not null, -- preclean | postclean | handover | inspection
  locked_by text not null,
  locked_at timestamptz default now(),
  status text default 'InProgress', -- InProgress | Completed | Unlocked
  unlock_reason text
);

create unique index if not exists idx_task_locks_unique
  on task_locks(area, task);

alter table task_locks enable row level security;
create policy "task_locks_open_access" on task_locks
  for all using (true) with check (true);

-- Post-release findings (optional but required by workflow).
create table if not exists post_release_findings (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  reported_by text not null,
  description text not null,
  photos jsonb not null,
  status text default 'Open', -- Open | Closed
  closed_by text,
  closed_photo text,
  created_at timestamptz default now(),
  closed_at timestamptz
);

alter table post_release_findings enable row level security;
create policy "findings_open_access" on post_release_findings
  for all using (true) with check (true);

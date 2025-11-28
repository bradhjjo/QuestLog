-- Add expires_at column to todos table for Event Quests
alter table todos 
add column if not exists expires_at timestamptz;

-- Add index for faster queries on expired quests
create index if not exists idx_todos_expires_at on todos(expires_at) where expires_at is not null;

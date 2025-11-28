-- Add is_daily column to todos table
alter table todos 
add column if not exists is_daily boolean default false;

-- Add index for faster daily quest queries
create index if not exists idx_todos_is_daily on todos(is_daily) where is_daily = true;

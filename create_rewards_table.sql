-- rewards 테이블 생성
create table rewards (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  cost integer not null,
  icon text default '🎁',
  created_by uuid references auth.users not null,
  inserted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 활성화
alter table rewards enable row level security;

-- 읽기: 인증된 사용자는 모두 볼 수 있음
create policy "Enable read access for authenticated users"
on rewards for select
using (auth.role() = 'authenticated');

-- 쓰기: 인증된 사용자는 누구나 생성 가능
create policy "Enable insert for authenticated users"
on rewards for insert
with check (auth.role() = 'authenticated');

-- 수정: 인증된 사용자는 누구나 수정 가능
create policy "Enable update for authenticated users"
on rewards for update
using (auth.role() = 'authenticated');

-- 삭제: 인증된 사용자는 누구나 삭제 가능
create policy "Enable delete for authenticated users"
on rewards for delete
using (auth.role() = 'authenticated');

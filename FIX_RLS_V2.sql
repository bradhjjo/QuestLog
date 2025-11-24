-- 기존 정책 모두 삭제 (충돌 방지)
drop policy if exists "Todos are viewable by everyone." on todos;
drop policy if exists "Users can insert their own todos." on todos;
drop policy if exists "Users can update their own todos." on todos;
drop policy if exists "Users can update own todos." on todos;
drop policy if exists "Authenticated users can update todos." on todos;
drop policy if exists "Users can delete their own todos." on todos;

-- 1. 읽기 (SELECT): 누구나 볼 수 있음
create policy "Enable read access for all users"
on todos for select
using (true);

-- 2. 쓰기 (INSERT): 인증된 사용자는 누구나 생성 가능
create policy "Enable insert for authenticated users"
on todos for insert
with check (auth.role() = 'authenticated');

-- 3. 수정 (UPDATE): 인증된 사용자는 누구나 수정 가능 (상태 변경 등)
create policy "Enable update for authenticated users"
on todos for update
using (auth.role() = 'authenticated');

-- 4. 삭제 (DELETE): 인증된 사용자는 누구나 삭제 가능 (부모가 삭제)
create policy "Enable delete for authenticated users"
on todos for delete
using (auth.role() = 'authenticated');

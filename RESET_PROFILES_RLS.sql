-- profiles 테이블의 모든 RLS 정책 확인 및 재설정

-- 1. 기존 정책 모두 삭제
drop policy if exists "Users can view own profile." on profiles;
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;
drop policy if exists "Enable update for authenticated users" on profiles;
drop policy if exists "Authenticated users can view all profiles" on profiles;

-- 2. 새로운 정책 생성
-- SELECT: 인증된 사용자는 모든 profiles 조회 가능
create policy "Enable read access for authenticated users"
on profiles for select
to authenticated
using (true);

-- INSERT: 본인 profile만 생성 가능
create policy "Enable insert for users based on user_id"
on profiles for insert
to authenticated
with check (auth.uid() = id);

-- UPDATE: 인증된 사용자는 모든 profiles 업데이트 가능 (Parent가 Teen XP 업데이트)
create policy "Enable update for authenticated users"
on profiles for update
to authenticated
using (true);

-- DELETE: 본인 profile만 삭제 가능
create policy "Enable delete for users based on user_id"
on profiles for delete
to authenticated
using (auth.uid() = id);

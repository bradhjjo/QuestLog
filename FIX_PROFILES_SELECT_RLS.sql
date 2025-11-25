-- profiles 테이블의 SELECT 정책 수정
-- 기존 정책 삭제
drop policy if exists "Users can view own profile." on profiles;
drop policy if exists "Public profiles are viewable by everyone." on profiles;

-- 새로운 정책: 인증된 사용자는 모든 profiles 조회 가능
-- (Parent가 자녀들의 XP를 볼 수 있도록)
create policy "Authenticated users can view all profiles"
on profiles for select
using (auth.role() = 'authenticated');

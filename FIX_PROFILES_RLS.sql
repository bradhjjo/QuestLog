-- profiles 테이블의 기존 UPDATE 정책 확인 및 수정
-- 현재는 "본인만 수정 가능"으로 되어 있어서, 부모가 자녀의 XP를 업데이트할 수 없습니다.

-- 기존 정책 삭제
drop policy if exists "Users can update own profile." on profiles;

-- 새로운 정책: 인증된 사용자는 누구나 profiles 수정 가능
-- (부모가 자녀의 XP를 업데이트할 수 있도록)
create policy "Authenticated users can update profiles"
on profiles for update
using (auth.role() = 'authenticated');

-- 기존 정책 삭제 (본인 것만 수정 가능했던 정책)
drop policy "Users can update their own todos." on todos;

-- 새로운 정책 추가 (로그인한 누구나 수정 가능)
-- 이렇게 해야 자녀가 부모님이 만든 퀘스트를 '완료' 상태로 바꿀 수 있습니다.
create policy "Authenticated users can update todos."
  on todos for update
  using ( auth.role() = 'authenticated' );

-- todos 테이블에 누가 완료했는지 저장할 컬럼 추가
alter table todos 
add column completed_by uuid references auth.users;

-- RLS 정책 업데이트 (completed_by 컬럼 수정 권한 확인)
-- 이미 "Authenticated users can update todos" 정책이 있어서 별도 추가는 필요 없지만,
-- 확실하게 하기 위해 기존 정책이 잘 작동하는지 확인합니다.

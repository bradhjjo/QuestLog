-- todos 테이블에 completed_by 컬럼이 있는지 확인하고, 없으면 추가
-- 이미 있으면 에러가 나지만 무시해도 됩니다.

-- 1. 컬럼 추가 (이미 있으면 에러 발생하지만 괜찮음)
alter table todos 
add column if not exists completed_by uuid references auth.users;

-- 2. 기존 데이터 확인 (테스트용)
-- 아래 쿼리를 실행해서 completed_by 컬럼이 보이는지 확인하세요
-- SELECT id, title, status, user_id, completed_by FROM todos LIMIT 5;

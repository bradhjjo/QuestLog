-- profiles 테이블에 level과 total_xp_earned 컬럼 추가
alter table profiles 
add column if not exists level integer default 1,
add column if not exists total_xp_earned integer default 0;

-- 기존 사용자들의 total_xp_earned를 현재 xp로 초기화
update profiles set total_xp_earned = xp where total_xp_earned = 0;

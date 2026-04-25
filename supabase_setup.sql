-- ============================================
-- KB금융 고객 문의 자동 분류 시스템 - 테이블 생성
-- ============================================
-- 사용법: Supabase 대시보드 → SQL Editor → New query → 아래 내용 붙여넣기 → Run

-- 기존 테이블이 있으면 삭제 (초기 설정용)
DROP TABLE IF EXISTS inquiries CASCADE;

-- inquiries 테이블 생성
CREATE TABLE inquiries (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at    timestamptz DEFAULT now(),
  customer_name text,
  inquiry       text,
  category      text,
  urgency       text,
  summary       text,
  department    text,
  script        text
);

-- 실습용: Row Level Security 비활성화
-- ⚠️ 프로덕션 환경에서는 반드시 RLS 정책을 별도로 설정하세요
ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;

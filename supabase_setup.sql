-- ============================================
-- 기업여신 상담 AI — consultation_logs 테이블 생성
-- ============================================
-- 사용법: Supabase 대시보드 → SQL Editor → New query → 아래 내용 붙여넣기 → Run

-- 기존 테이블 삭제 (초기 설정용)
DROP TABLE IF EXISTS consultation_logs CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;

-- consultation_logs 테이블 생성
CREATE TABLE consultation_logs (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name        TEXT NOT NULL,                    -- 고객명/기업명
  business_entity_type TEXT NOT NULL,                    -- '개인사업자' | '법인사업자'
  business_type        TEXT,                             -- 업종 (제조업, 건설업, 임대업 등)
  loan_type            TEXT NOT NULL,                    -- '신규' | '재대출/대약정' | '기한연장' | '조건변경' | '그외기타'
  loan_purpose         TEXT,                             -- 대출 용도 (운전자금, 시설자금 등)
  collateral_type      TEXT,                             -- 담보 형태 (신용, 부동산, 보증서 등)
  inquiry_text         TEXT NOT NULL,                    -- 고객 원문 메시지
  priority             TEXT DEFAULT '보통',               -- '높음' | '보통' | '낮음'
  summary              TEXT,                             -- AI 1줄 요약
  required_docs        JSONB DEFAULT '[]'::jsonb,        -- 안내된 서류 리스트 (배열)
  ai_response          TEXT,                             -- AI 안내 메시지 전문
  regulatory_flags     JSONB DEFAULT '[]'::jsonb,        -- 규제 검토 항목 (RTI, DSR 등)
  has_third_party_collateral BOOLEAN DEFAULT false,      -- 제3자 담보 제공 여부
  created_at           TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 (조회 성능 최적화)
CREATE INDEX idx_consultation_logs_entity ON consultation_logs(business_entity_type);
CREATE INDEX idx_consultation_logs_biz    ON consultation_logs(business_type);
CREATE INDEX idx_consultation_logs_loan   ON consultation_logs(loan_type);
CREATE INDEX idx_consultation_logs_date   ON consultation_logs(created_at DESC);

-- 실습용: Row Level Security 비활성화
-- ⚠️ 프로덕션 환경에서는 반드시 RLS 정책을 별도로 설정하세요
ALTER TABLE consultation_logs DISABLE ROW LEVEL SECURITY;

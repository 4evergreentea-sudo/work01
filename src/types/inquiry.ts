/** 사업자 구분 */
export type BusinessEntityType = '개인사업자' | '법인사업자';

/** 업종 분류 */
export type BusinessType =
  | '제조업'
  | '건설업'
  | '도소매업'
  | '임대업'
  | 'IT·정보통신'
  | '음식·숙박업'
  | '운수업'
  | '서비스업'
  | '기타';

/** 대출 유형 (기업대출 내 분류) */
export type LoanType =
  | '신규'
  | '재대출/대약정'
  | '기한연장'
  | '조건변경'
  | '그외기타';

/** 우선순위 */
export type Priority = '높음' | '보통' | '낮음';

/** 담보 구분 */
export type CollateralType = '신용' | '보증서' | '부동산' | '기타';

/** Gemini 분석 결과 타입 */
export interface ConsultationResult {
  business_entity_type: BusinessEntityType;
  business_type: BusinessType;
  loan_type: LoanType;
  loan_purpose: string;
  collateral_type: string;
  priority: Priority;
  summary: string;
  required_docs: string[];
  ai_response: string;
  regulatory_flags: string[];
  has_third_party_collateral?: boolean;
}

/** Supabase consultation_logs 레코드 타입 */
export interface ConsultationRecord extends ConsultationResult {
  id: string;
  created_at: string;
  customer_name: string;
  inquiry_text: string;
}

/** 업종 목록 상수 */
export const BUSINESS_TYPES: BusinessType[] = [
  '제조업', '건설업', '도소매업', '임대업',
  'IT·정보통신', '음식·숙박업', '운수업', '서비스업', '기타',
];

/** 대출 유형 목록 상수 */
export const LOAN_TYPES: LoanType[] = [
  '신규', '재대출/대약정', '기한연장', '조건변경', '그외기타',
];

/** 담보 구분 목록 상수 */
export const COLLATERAL_TYPES: CollateralType[] = [
  '신용', '보증서', '부동산', '기타',
];

/** 업종 아이콘 매핑 */
export const BUSINESS_TYPE_ICONS: Record<BusinessType, string> = {
  '제조업': '📦',
  '건설업': '🏗️',
  '도소매업': '🏪',
  '임대업': '🏠',
  'IT·정보통신': '💻',
  '음식·숙박업': '🍽️',
  '운수업': '🚛',
  '서비스업': '🏢',
  '기타': '❓',
};

/** 대출 유형 아이콘 매핑 */
export const LOAN_TYPE_ICONS: Record<LoanType, string> = {
  '신규': '🆕',
  '재대출/대약정': '🔄',
  '기한연장': '📅',
  '조건변경': '⚙️',
  '그외기타': '📋',
};

/** 담보 구분 아이콘 매핑 */
export const COLLATERAL_TYPE_ICONS: Record<CollateralType, string> = {
  '신용': '💳',
  '보증서': '📑',
  '부동산': '🏢',
  '기타': '📋',
};

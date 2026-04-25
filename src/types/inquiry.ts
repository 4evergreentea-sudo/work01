/** KB금융 고객 문의 분류 결과 타입 */
export interface InquiryResult {
  category: string;
  urgency: '높음' | '보통' | '낮음';
  summary: string;
  department: string;
  script: string;
}

/** Supabase에 저장된 문의 레코드 타입 */
export interface InquiryRecord extends InquiryResult {
  id: number;
  created_at: string;
  customer_name: string;
  inquiry: string;
}

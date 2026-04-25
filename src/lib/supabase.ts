import { createClient } from '@supabase/supabase-js';
import type { ConsultationResult, ConsultationRecord } from '../types/inquiry';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
}

/** Supabase 클라이언트 인스턴스 */
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

/** 상담 결과를 Supabase에 저장 */
export async function saveConsultation(
  customerName: string,
  inquiryText: string,
  result: ConsultationResult,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('consultation_logs').insert({
      customer_name: customerName,
      business_entity_type: result.business_entity_type,
      business_type: result.business_type,
      loan_type: result.loan_type,
      loan_purpose: result.loan_purpose || '',
      collateral_type: result.collateral_type || '',
      inquiry_text: inquiryText,
      priority: result.priority,
      summary: result.summary,
      required_docs: result.required_docs,
      ai_response: result.ai_response,
      regulatory_flags: result.regulatory_flags || [],
      has_third_party_collateral: result.has_third_party_collateral ?? false,
      is_multi_home_owner: result.is_multi_home_owner ?? false,
    });

    if (error) {
      console.error('Supabase Insert Error:', error);
      return { success: false, error: `Supabase 저장 실패: ${error.message} (${error.code})` };
    }
    console.log('Supabase Insert Success!');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return { success: false, error: `Supabase 연결 실패: ${message}` };
  }
}

/** 상담 내역 조회 (필터 지원) */
export async function fetchConsultations(filters?: {
  entityType?: string;
  businessType?: string;
  loanType?: string;
}): Promise<{ data: ConsultationRecord[]; error?: string }> {
  try {
    let query = supabase
      .from('consultation_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.entityType) {
      query = query.eq('business_entity_type', filters.entityType);
    }
    if (filters?.businessType) {
      query = query.eq('business_type', filters.businessType);
    }
    if (filters?.loanType) {
      query = query.eq('loan_type', filters.loanType);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: `상담 내역 조회 실패: ${error.message}` };
    }
    return { data: (data as ConsultationRecord[]) || [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return { data: [], error: `Supabase 연결 실패: ${message}` };
  }
}

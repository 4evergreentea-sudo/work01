import { createClient } from '@supabase/supabase-js';
import type { InquiryResult, InquiryRecord } from '../types/inquiry';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
}

/** Supabase 클라이언트 인스턴스 */
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

/** 문의 분류 결과를 Supabase에 저장 */
export async function saveInquiry(
  customerName: string,
  inquiry: string,
  result: InquiryResult
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('inquiries').insert({
      customer_name: customerName,
      inquiry,
      category: result.category,
      urgency: result.urgency,
      summary: result.summary,
      department: result.department,
      script: result.script,
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

/** Supabase에서 전체 문의 내역 조회 */
export async function fetchInquiries(): Promise<{
  data: InquiryRecord[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: `문의 내역 조회 실패: ${error.message}` };
    }
    return { data: (data as InquiryRecord[]) || [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return { data: [], error: `Supabase 연결 실패: ${message}` };
  }
}

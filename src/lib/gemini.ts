import { GoogleGenAI } from '@google/genai';
import type { InquiryResult } from '../types/inquiry';

/** 사용 모델: Gemini 3 Flash Preview */
const MODEL_NAME = 'gemini-3-flash-preview';

/** Gemini 응답에서 마크다운 코드블록 제거 */
function cleanJsonResponse(raw: string): string {
  return raw.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
}

/** 분류용 프롬프트 생성 */
function buildPrompt(customerName: string, inquiry: string): string {
  return `당신은 KB금융그룹의 고객 문의를 분류하는 AI 어시스턴트입니다.

[분류 규칙]
카테고리: 보험금청구 / 계약변경 / 해지 / 상품문의 / 대출 / 카드 / 기타

긴급도:
- 높음: 사고, 분실, 도난, 긴급 의료, 해외 사고 등 즉시 처리 필요
- 보통: 일반 문의, 상품 가입, 변경 요청
- 낮음: 단순 확인, 정보 요청

담당부서:
- 보험금 관련 → 보상심사팀
- 대출 관련 → 여신심사팀
- 카드 분실/도난 → 카드관리팀
- 적금/예금 → 수신팀
- 그 외 일반 → 고객지원팀

[고객 문의]
고객명: ${customerName}
문의 내용: ${inquiry}

응답은 아래 JSON 형식으로만. 마크다운 코드블록이나 설명 텍스트 없이 순수 JSON만 출력.
{
  "category": "카테고리",
  "urgency": "높음|보통|낮음",
  "summary": "한 줄 요약",
  "department": "담당부서",
  "script": "응대 스크립트 (3문장 이내)"
}`;
}

/** Gemini API를 호출하여 고객 문의 분류 */
export async function classifyInquiry(
  customerName: string,
  inquiry: string
): Promise<{ result?: InquiryResult; error?: string; rawResponse?: string }> {
  // 환경변수 확인
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      error: '환경변수 VITE_GEMINI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildPrompt(customerName, inquiry);

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const rawText = response.text ?? '';
    if (!rawText) {
      return { error: 'Gemini 응답이 비어 있습니다.', rawResponse: '' };
    }

    // JSON 파싱 전처리 및 파싱
    const cleaned = cleanJsonResponse(rawText);
    try {
      const parsed = JSON.parse(cleaned) as InquiryResult;

      // 필수 필드 유효성 검사
      if (!parsed.category || !parsed.urgency || !parsed.summary || !parsed.department || !parsed.script) {
        return {
          error: 'Gemini 응답에 필수 필드가 누락되었습니다.',
          rawResponse: rawText.substring(0, 200),
        };
      }

      return { result: parsed };
    } catch {
      return {
        error: `JSON 파싱 실패: Gemini 응답을 JSON으로 변환할 수 없습니다.`,
        rawResponse: rawText.substring(0, 200),
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return { error: `Gemini API 호출 실패: ${message}` };
  }
}

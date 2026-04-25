import { GoogleGenAI } from '@google/genai';
import type { ConsultationResult, BusinessEntityType } from '../types/inquiry';

/** 사용 모델: Gemini 3 Flash Preview */
const MODEL_NAME = 'gemini-3-flash-preview';

/** Gemini 응답에서 마크다운 코드블록 제거 */
function cleanJsonResponse(raw: string): string {
  return raw.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
}

/** 기업여신 전문 심사역 프롬프트 생성 */
function buildPrompt(
  customerName: string,
  inquiry: string,
  entityType?: BusinessEntityType,
  selectedBusinessType?: string,
  selectedLoanType?: string,
): string {
  const entityHint = entityType ? `\n사업자 구분 힌트: ${entityType}` : '';
  const bizHint = selectedBusinessType ? `\n업종 힌트: ${selectedBusinessType}` : '';
  const loanHint = selectedLoanType ? `\n대출 유형 힌트: ${selectedLoanType}` : '';

  return `당신은 KB금융그룹의 기업여신(기업대출) 전문 심사역입니다.
아래 고객 문의를 분석하여 정확하게 분류하고, 필요한 서류를 빠짐없이 안내하세요.

═══════════════════════════════════
[분류 규칙]
═══════════════════════════════════

■ 사업자 구분 (반드시 아래 중 하나):
  - 개인사업자: 사업자등록증 기반 개인 운영
  - 법인사업자: 법인등기 기반 법인 운영

■ 대출 유형 (반드시 아래 중 하나로 분류):
  - 신규: 최초 기업대출 신청
  - 재대출/대약정: 만기 도래 후 재실행, 대약정 갱신
  - 기한연장: 기존 대출 상환 기한 연장
  - 조건변경: 금리·상환방식 등 기존 조건 변경
  - 그외기타: 한도조회, 단순문의, 서류확인 등

■ 업종 (반드시 아래 중 하나로 분류):
  제조업 / 건설업 / 도소매업 / 임대업 / IT·정보통신 / 음식·숙박업 / 운수업 / 서비스업 / 기타

═══════════════════════════════════
[업종별 판단기준 및 추가 서류]
═══════════════════════════════════

■ 제조업:
  핵심지표: 매출채권 회전율, 재고자산 회전율, 가동률, 원가율
  추가서류: 공장등록증, 제조업 등록증명서, 원자재 매입 내역, 주요 거래처 현황표
  규제: 환경오염 업종 시 환경영향평가 확인, 산업단지 입주 확인

■ 건설업:
  핵심지표: 시공능력평가액, 수주잔고, 공사이익률, 미성공사 비율
  추가서류: 건설업 면허증, 시공능력평가 확인서, 공사수주 현황표, 공사도급계약서
  규제: PF(프로젝트파이낸싱) 관련 규제, 선급금 보증서 확인

■ 도소매업:
  핵심지표: 매출총이익률, 재고자산 회전율, 매입/매출 추이, 신용카드 매출 비중
  추가서류: 사업장 임대차계약서, 카드매출 내역서, 주요 매입처 거래내역
  규제: 유통산업발전법 관련 규제, 대규모 유통업 해당 여부

■ 임대업 (부동산):
  핵심지표: RTI(임대업이자상환비율), 공실률, 임대수익률, LTV
  추가서류: 등기사항전부증명원, 임대차계약서(전체), 임대수입 내역서, 감정평가서
  규제: ⚠️ RTI 1.25배 이상 유지 필요, 주택 보유 수 확인, DSR 규제, 임대사업자 등록 여부

■ IT·정보통신:
  핵심지표: 기술력 평가, 매출성장률, R&D 비율, 인건비 비중
  추가서류: 기술평가서(TCB), 소프트웨어사업자 신고확인증, 특허/지식재산 증빙, 주요 프로젝트 계약서
  규제: 벤처기업 확인서, 이노비즈/메인비즈 확인, 기보/신보 보증 가능 여부

■ 음식·숙박업:
  핵심지표: 카드매출 추이, 좌석 회전율, 인건비 비율, 식자재 원가율
  추가서류: 영업신고증(위생), 카드매출 내역서, 프랜차이즈 계약서(해당 시)
  규제: 식품위생법 위반 이력 확인, 프랜차이즈 가맹 관련 규정

■ 운수업:
  핵심지표: 차량 보유 대수, 운송수입금, 유류비 비율, 운송계약 현황
  추가서류: 운송사업 면허증, 차량등록증(전체), 운송계약서, 유류구매 내역
  규제: 화물운송 허가 확인, 운수업 면허 유효기간 확인

■ 서비스업:
  핵심지표: 매출 안정성, 인건비 비율, 고정비 구조, 주요 거래처 집중도
  추가서류: 업종별 인허가 증빙, 주요 용역계약서, 인력 현황표
  규제: 업종별 개별 인허가 유효성 확인

■ 기타:
  핵심지표: 유동비율, 부채비율, 영업이익률
  추가서류: 해당 업종 관련 인허가/등록 서류
  규제: 업종 특성에 따른 개별 규제 확인

═══════════════════════════════════
[서류 생성 규칙 - 4단계 누적]
═══════════════════════════════════

1단계 [공통 서류 - 모든 기업]:
  사업자등록증, 재무제표(최근 3개년), 부가세과세표준증명원, 국세납세증명서, 지방세납세증명서, 대표자 신분증 사본

2단계 [사업자 유형별 추가]:
  개인사업자: 소득금액증명원, 사업자 본인 신용정보 조회 동의서
  법인사업자: 정관, 주주명부, 법인인감증명서, 법인등기사항전부증명서, 이사회의사록(대출승인), 대표이사 신분증

3단계 [업종별 추가]: 위 업종별 판단기준의 추가서류 참조

4단계 [담보 형태별 추가]:
  신용(무담보): 추가 없음
  부동산 담보: 등기사항전부증명서(부동산), 감정평가서, 토지이용계획확인원, 임대차계약서(필요 시)
  보증서 담보: 보증서 사본, 보증약정서
  기타 담보: 담보물 관련 증빙

═══════════════════════════════════
[우선순위 판단 기준]
═══════════════════════════════════
높음: 시설자금 신규, 만기 임박 재대출/기한연장, 임대업 RTI 검토 필요 건
보통: 운전자금 신규, 조건변경
낮음: 단순문의, 한도조회, 서류확인 (그외기타)

═══════════════════════════════════
[고객 정보]
═══════════════════════════════════
고객명/기업명: ${customerName}${entityHint}${bizHint}${loanHint}
문의 내용: ${inquiry}

═══════════════════════════════════
[응답 형식]
═══════════════════════════════════
아래 JSON 형식으로만 응답하세요. 마크다운 코드블록이나 설명 텍스트 없이 순수 JSON만 출력.
{
  "business_entity_type": "개인사업자 또는 법인사업자",
  "business_type": "업종명",
  "loan_type": "대출 유형",
  "loan_purpose": "대출 용도 (운전자금/시설자금/기타)",
  "collateral_type": "담보 형태 (신용/부동산/보증서/기타)",
  "priority": "높음|보통|낮음",
  "summary": "상담 내용 한 줄 요약",
  "required_docs": ["서류1", "서류2", "서류3", ...],
  "ai_response": "고객에게 보여줄 친절하고 전문적인 안내 메시지 (서류 목록 포함, 3~5문장)",
  "regulatory_flags": ["해당되는 규제 검토 항목들 (없으면 빈 배열)"]
}`;
}

/** Gemini API를 호출하여 기업여신 상담 분석 */
export async function classifyConsultation(
  customerName: string,
  inquiry: string,
  entityType?: BusinessEntityType,
  selectedBusinessType?: string,
  selectedLoanType?: string,
): Promise<{ result?: ConsultationResult; error?: string; rawResponse?: string }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      error: '환경변수 VITE_GEMINI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildPrompt(customerName, inquiry, entityType, selectedBusinessType, selectedLoanType);

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const rawText = response.text ?? '';
    if (!rawText) {
      return { error: 'Gemini 응답이 비어 있습니다.', rawResponse: '' };
    }

    const cleaned = cleanJsonResponse(rawText);
    try {
      const parsed = JSON.parse(cleaned) as ConsultationResult;

      // 필수 필드 유효성 검사
      const requiredFields: (keyof ConsultationResult)[] = [
        'business_entity_type', 'business_type', 'loan_type',
        'priority', 'summary', 'required_docs', 'ai_response',
      ];
      const missing = requiredFields.filter((f) => !parsed[f]);
      if (missing.length > 0) {
        return {
          error: `Gemini 응답에 필수 필드가 누락되었습니다: ${missing.join(', ')}`,
          rawResponse: rawText.substring(0, 300),
        };
      }

      // required_docs가 배열인지 확인
      if (!Array.isArray(parsed.required_docs)) {
        parsed.required_docs = [];
      }
      if (!Array.isArray(parsed.regulatory_flags)) {
        parsed.regulatory_flags = [];
      }

      return { result: parsed };
    } catch {
      return {
        error: `JSON 파싱 실패: Gemini 응답을 JSON으로 변환할 수 없습니다.`,
        rawResponse: rawText.substring(0, 300),
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return { error: `Gemini API 호출 실패: ${message}` };
  }
}

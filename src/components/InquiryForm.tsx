import { useState } from 'react';
import type { InquiryResult } from '../types/inquiry';
import { classifyInquiry } from '../lib/gemini';
import { saveInquiry } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ResultCard from './ResultCard';

/** 문의 입력 + 분류 + 저장 화면 — 프리미엄 */
export default function InquiryForm() {
  const [customerName, setCustomerName] = useState('');
  const [inquiry, setInquiry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InquiryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleClassify = async () => {
    if (!customerName.trim() || !inquiry.trim()) {
      setError('고객 이름과 문의 내용을 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setResult(null);
    setError(null);
    setRawResponse(undefined);
    setIsSaved(false);

    const response = await classifyInquiry(customerName.trim(), inquiry.trim());
    setIsLoading(false);

    if (response.result) {
      setResult(response.result);
    } else {
      setError(response.error || '알 수 없는 오류가 발생했습니다.');
      setRawResponse(response.rawResponse);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    const response = await saveInquiry(customerName.trim(), inquiry.trim(), result);
    setIsSaving(false);
    if (response.success) {
      setIsSaved(true);
      alert('✅ 성공적으로 저장되었습니다!');
    } else {
      setError(response.error || '저장에 실패했습니다.');
      alert(`❌ 저장 실패: ${response.error}`);
    }
  };

  const handleReset = () => {
    setCustomerName('');
    setInquiry('');
    setResult(null);
    setError(null);
    setRawResponse(undefined);
    setIsSaved(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8">
      {/* 입력 폼 카드 */}
      <div className="glass-card p-8 animate-fade-in-up">
        {/* 카드 상단 장식선 */}
        <div
          className="h-1 w-16 rounded-full mb-6"
          style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
        />

        <h2 className="text-xl font-bold text-text-primary mb-2">문의 정보 입력</h2>
        <p className="text-text-muted text-sm mb-8">
          고객님의 문의 내용을 입력하면 AI가 자동으로 분류합니다
        </p>

        {/* 고객 이름 */}
        <div className="mb-6">
          <label htmlFor="customer-name" className="block text-sm font-semibold text-text-secondary mb-2.5">
            고객 이름
          </label>
          <input
            id="customer-name"
            type="text"
            className="input-field"
            placeholder="예: 홍길동"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* 문의 내용 */}
        <div className="mb-8">
          <label htmlFor="inquiry-content" className="block text-sm font-semibold text-text-secondary mb-2.5">
            문의 내용
          </label>
          <textarea
            id="inquiry-content"
            className="input-field min-h-[160px] resize-y"
            placeholder="예: 어제 교통사고가 났는데 보험금 청구는 어떻게 하나요?"
            value={inquiry}
            onChange={(e) => setInquiry(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* 버튼 그룹 */}
        <div className="flex gap-3 flex-wrap">
          <button
            id="btn-classify"
            onClick={handleClassify}
            disabled={isLoading || !customerName.trim() || !inquiry.trim()}
            className="btn-primary flex-1 sm:flex-none"
          >
            {isLoading ? '분류 중...' : '🔍 분류하기'}
          </button>
          {result && (
            <button onClick={handleReset} className="btn-secondary">
              🔄 새 문의
            </button>
          )}
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && <LoadingSpinner />}

      {/* 에러 */}
      {error && !isLoading && (
        <ErrorMessage
          message={error}
          rawResponse={rawResponse}
          onRetry={rawResponse ? handleClassify : undefined}
        />
      )}

      {/* 결과 */}
      {result && !isLoading && (
        <ResultCard
          result={result}
          customerName={customerName}
          onSave={handleSave}
          isSaving={isSaving}
          isSaved={isSaved}
        />
      )}
    </div>
  );
}

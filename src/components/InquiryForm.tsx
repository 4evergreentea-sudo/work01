import { useState } from 'react';
import type { ConsultationResult, BusinessEntityType, LoanType, BusinessType, CollateralType } from '../types/inquiry';
import { BUSINESS_TYPES, LOAN_TYPES, COLLATERAL_TYPES, BUSINESS_TYPE_ICONS, LOAN_TYPE_ICONS, COLLATERAL_TYPE_ICONS } from '../types/inquiry';
import { classifyConsultation } from '../lib/gemini';
import { saveConsultation } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ResultCard from './ResultCard';

/** 기업여신 상담 입력 폼 — 프리미엄 */
export default function InquiryForm() {
  const [customerName, setCustomerName] = useState('');
  const [entityType, setEntityType] = useState<BusinessEntityType>('개인사업자');
  const [selectedBizType, setSelectedBizType] = useState<BusinessType | ''>('');
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType | ''>('');
  const [inquiry, setInquiry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ConsultationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasThirdPartyCollateral, setHasThirdPartyCollateral] = useState(false);
  const [selectedCollateralType, setSelectedCollateralType] = useState<CollateralType | ''>('');

  const handleClassify = async () => {
    if (!customerName.trim() || !inquiry.trim()) {
      setError('기업명과 문의 내용을 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setResult(null);
    setError(null);
    setRawResponse(undefined);
    setIsSaved(false);

    const response = await classifyConsultation(
      customerName.trim(),
      inquiry.trim(),
      entityType,
      selectedBizType || undefined,
      selectedLoanType || undefined,
      hasThirdPartyCollateral,
      selectedCollateralType || undefined,
    );
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
    const response = await saveConsultation(customerName.trim(), inquiry.trim(), result);
    setIsSaving(false);
    if (response.success) {
      setIsSaved(true);
    } else {
      setError(response.error || '저장에 실패했습니다.');
    }
  };

  const handleReset = () => {
    setCustomerName('');
    setEntityType('개인사업자');
    setSelectedBizType('');
    setSelectedLoanType('');
    setInquiry('');
    setResult(null);
    setError(null);
    setRawResponse(undefined);
    setIsSaved(false);
    setHasThirdPartyCollateral(false);
    setSelectedCollateralType('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 space-y-8">
      {/* 입력 폼 카드 */}
      <div className="glass-card p-10 animate-fade-in-up">
        <h2 className="text-xl font-bold text-text-primary mb-2">상담 정보 입력</h2>
        <p className="text-text-muted text-sm mb-10">
          기업 정보와 문의 내용을 입력하시면 AI가 맞춤형 서류 안내를 도와드립니다.
        </p>

        {/* 기업명 */}
        <div className="mb-8">
          <label htmlFor="customer-name" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2 ml-1">
            기업명 / 고객명
          </label>
          <input
            id="customer-name"
            type="text"
            className="input-field"
            placeholder="예: (주)한국제조, 김철수 음식점"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* 사업자 구분 토글 */}
        <div className="mb-10">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 ml-1 opacity-70">
            사업자 구분
          </label>
          <div className="flex gap-4">
            {(['개인사업자', '법인사업자'] as const).map((type) => {
              const isActive = entityType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEntityType(type)}
                  disabled={isLoading}
                  className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-500 cursor-pointer flex items-center justify-center gap-2.5 ${
                    isActive 
                      ? 'bg-text-primary text-white shadow-xl shadow-text-primary/10' 
                      : 'bg-bg-secondary text-text-secondary hover:bg-white border border-black/[0.03]'
                  }`}
                >
                  <span className="text-lg">{type === '개인사업자' ? '👤' : '🏢'}</span>
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* 업종 + 대출 유형 + 담보 구분 선택 (3열) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {/* 업종 선택 */}
          <div>
            <label htmlFor="business-type" className="block text-sm font-semibold text-text-secondary mb-2.5">
              업종 <span className="text-text-muted font-normal">(AI 자동)</span>
            </label>
            <select
              id="business-type"
              className="input-field select-field"
              value={selectedBizType}
              onChange={(e) => setSelectedBizType(e.target.value as BusinessType | '')}
              disabled={isLoading}
            >
              <option value="">자동 판별</option>
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {BUSINESS_TYPE_ICONS[bt]} {bt}
                </option>
              ))}
            </select>
          </div>

          {/* 대출 유형 선택 */}
          <div>
            <label htmlFor="loan-type" className="block text-sm font-semibold text-text-secondary mb-2.5">
              대출 유형 <span className="text-text-muted font-normal">(AI 자동)</span>
            </label>
            <select
              id="loan-type"
              className="input-field select-field"
              value={selectedLoanType}
              onChange={(e) => setSelectedLoanType(e.target.value as LoanType | '')}
              disabled={isLoading}
            >
              <option value="">자동 판별</option>
              {LOAN_TYPES.map((lt) => (
                <option key={lt} value={lt}>
                  {LOAN_TYPE_ICONS[lt]} {lt}
                </option>
              ))}
            </select>
          </div>

          {/* 담보 구분 선택 */}
          <div>
            <label htmlFor="collateral-type" className="block text-sm font-semibold text-text-secondary mb-2.5">
              담보 구분 <span className="text-text-muted font-normal">(AI 자동)</span>
            </label>
            <select
              id="collateral-type"
              className="input-field select-field"
              value={selectedCollateralType}
              onChange={(e) => setSelectedCollateralType(e.target.value as CollateralType | '')}
              disabled={isLoading}
            >
              <option value="">자동 판별</option>
              {COLLATERAL_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {COLLATERAL_TYPE_ICONS[ct]} {ct}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 제3자 담보 제공 여부 */}
        <div className="mb-10 p-5 rounded-2xl bg-bg-secondary border border-black/[0.03] flex items-center justify-between group hover:bg-white hover:border-primary/20 transition-all duration-300">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1">
              제3자 담보 제공 여부
            </label>
            <p className="text-text-muted text-[12px] font-medium">
              대표자 본인 외의 제3자가 담보를 제공하는 경우 체크하세요
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHasThirdPartyCollateral(!hasThirdPartyCollateral)}
            disabled={isLoading}
            className={`w-14 h-8 rounded-full transition-all duration-500 relative cursor-pointer ${
              hasThirdPartyCollateral ? 'bg-primary' : 'bg-black/[0.1]'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-500 ${
                hasThirdPartyCollateral ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* 문의 내용 */}
        <div className="mb-8">
          <label htmlFor="inquiry-content" className="block text-sm font-semibold text-text-secondary mb-2.5">
            문의 내용
          </label>
          <textarea
            id="inquiry-content"
            className="input-field min-h-[160px] resize-y"
            placeholder="예: 제조업 법인인데 시설자금 10억 신규대출 문의합니다. 공장부지 담보가 있습니다."
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
            {isLoading ? '분석 중...' : '🔍 상담 분석'}
          </button>
          {result && (
            <button onClick={handleReset} className="btn-secondary">
              🔄 새 상담
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

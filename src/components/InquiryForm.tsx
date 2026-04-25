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

        {/* 주요 정보 선택 (업종, 대출유형, 담보구분) */}
        <div className="space-y-8 mb-10">
          {/* 업종 선택 */}
          <div>
            <label className="block text-[13px] font-black text-text-muted uppercase tracking-widest mb-4 opacity-70">
              01. 업종 분류
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedBizType('')}
                className={`px-5 py-3 rounded-2xl text-[14px] font-bold transition-all duration-300 border ${
                  selectedBizType === '' 
                    ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-105' 
                    : 'bg-bg-secondary text-text-secondary border-transparent hover:border-black/10'
                }`}
              >
                🤖 자동 판별
              </button>
              {BUSINESS_TYPES.map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => setSelectedBizType(bt)}
                  className={`px-5 py-3 rounded-2xl text-[14px] font-bold transition-all duration-300 border ${
                    selectedBizType === bt 
                      ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-105' 
                      : 'bg-bg-secondary text-text-secondary border-transparent hover:border-black/10'
                  }`}
                >
                  {BUSINESS_TYPE_ICONS[bt]} {bt}
                </button>
              ))}
            </div>
          </div>

          {/* 대출 유형 및 담보 구분 (2열 레이아웃) */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* 대출 유형 */}
            <div>
              <label className="block text-[13px] font-black text-text-muted uppercase tracking-widest mb-4 opacity-70">
                02. 대출 유형
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoanType('')}
                  className={`px-4 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 border text-center ${
                    selectedLoanType === '' 
                      ? 'bg-primary text-black border-primary shadow-md shadow-primary/10' 
                      : 'bg-bg-secondary text-text-secondary border-transparent hover:border-black/10'
                  }`}
                >
                  🔄 자동 판별
                </button>
                {LOAN_TYPES.map((lt) => (
                  <button
                    key={lt}
                    type="button"
                    onClick={() => setSelectedLoanType(lt)}
                    className={`px-4 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 border text-center ${
                      selectedLoanType === lt 
                        ? 'bg-primary text-black border-primary shadow-md shadow-primary/10' 
                        : 'bg-bg-secondary text-text-secondary border-transparent hover:border-black/10'
                    }`}
                  >
                    {LOAN_TYPE_ICONS[lt]} {lt}
                  </button>
                ))}
              </div>
            </div>

            {/* 담보 구분 (사용자가 요청한 항목 강조) */}
            <div>
              <label className="block text-[13px] font-black text-text-muted uppercase tracking-widest mb-4 opacity-70">
                03. 담보 구분
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCollateralType('')}
                  className={`px-4 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 border text-center ${
                    selectedCollateralType === '' 
                      ? 'bg-primary text-black border-primary shadow-md shadow-primary/10' 
                      : 'bg-bg-secondary text-text-secondary border-transparent hover:border-black/10'
                  }`}
                >
                  ⚖️ 자동 판별
                </button>
                {COLLATERAL_TYPES.map((ct) => (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => setSelectedCollateralType(ct)}
                    className={`px-4 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 border text-center ${
                      selectedCollateralType === ct 
                        ? 'bg-primary text-black border-primary shadow-md shadow-primary/10' 
                        : 'bg-bg-secondary text-text-secondary border-transparent hover:border-black/10'
                    }`}
                  >
                    {COLLATERAL_TYPE_ICONS[ct]} {ct}
                  </button>
                ))}
              </div>
            </div>
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

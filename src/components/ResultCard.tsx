import { useState } from 'react';
import type { ConsultationResult } from '../types/inquiry';
import { BUSINESS_TYPE_ICONS, LOAN_TYPE_ICONS } from '../types/inquiry';

interface ResultCardProps {
  result: ConsultationResult;
  customerName: string;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

/** 우선순위별 스타일 */
function getPriorityStyle(priority: string) {
  switch (priority) {
    case '높음':
      return { bg: 'var(--color-urgency-high-bg)', color: 'var(--color-urgency-high)', icon: '🔴', glow: 'rgba(248, 113, 113, 0.15)' };
    case '보통':
      return { bg: 'var(--color-urgency-medium-bg)', color: 'var(--color-urgency-medium)', icon: '🟡', glow: 'rgba(251, 191, 36, 0.15)' };
    case '낮음':
      return { bg: 'var(--color-urgency-low-bg)', color: 'var(--color-urgency-low)', icon: '🟢', glow: 'rgba(52, 211, 153, 0.15)' };
    default:
      return { bg: 'var(--color-surface-solid)', color: 'var(--color-text-secondary)', icon: '⚪', glow: 'transparent' };
  }
}

/** 기업여신 분석 결과 카드 — 프리미엄 */
export default function ResultCard({ result, customerName, onSave, isSaving, isSaved }: ResultCardProps) {
  const priority = getPriorityStyle(result.priority);
  const [copied, setCopied] = useState(false);

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(result.ai_response).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const bizIcon = BUSINESS_TYPE_ICONS[result.business_type as keyof typeof BUSINESS_TYPE_ICONS] || '❓';
  const loanIcon = LOAN_TYPE_ICONS[result.loan_type as keyof typeof LOAN_TYPE_ICONS] || '📋';

  return (
    <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      {/* 상단 장식선 */}
      <div className="h-1 w-16 rounded-full mb-6"
        style={{ background: `linear-gradient(90deg, ${priority.color}, var(--color-primary))` }} />

      {/* 헤더 */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <h3 className="text-xl font-bold text-text-primary mb-1">상담 분석 완료</h3>
          <p className="text-text-muted text-sm">{customerName}의 문의가 분석되었습니다</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* 사업자 구분 뱃지 */}
          <span className="badge-entity px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{
              background: result.business_entity_type === '법인사업자'
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(167, 139, 250, 0.1))'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.1))',
              color: result.business_entity_type === '법인사업자' ? '#A78BFA' : '#60A5FA',
              border: result.business_entity_type === '법인사업자'
                ? '1px solid rgba(139, 92, 246, 0.2)'
                : '1px solid rgba(59, 130, 246, 0.2)',
            }}>
            {result.business_entity_type === '법인사업자' ? '🏢' : '👤'} {result.business_entity_type}
          </span>
          {/* 업종 뱃지 */}
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.08))',
              color: 'var(--color-primary-light)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
            }}>
            {bizIcon} {result.business_type}
          </span>
          {/* 대출 유형 뱃지 */}
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(45, 212, 191, 0.08))',
              color: '#2DD4BF',
              border: '1px solid rgba(20, 184, 166, 0.15)',
            }}>
            {loanIcon} {result.loan_type}
          </span>
          {/* 우선순위 뱃지 */}
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
            style={{
              backgroundColor: priority.bg,
              color: priority.color,
              border: `1px solid ${priority.glow}`,
            }}>
            {priority.icon} {result.priority}
          </span>
        </div>
      </div>

      {/* 분석 요약 그리드 */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="info-cell p-4 rounded-2xl"
          style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.06)' }}>
          <div className="text-xs text-text-muted mb-1.5 font-semibold uppercase tracking-wider">대출 용도</div>
          <p className="text-text-primary text-sm font-bold">{result.loan_purpose || '-'}</p>
        </div>
        <div className="info-cell p-4 rounded-2xl"
          style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.06)' }}>
          <div className="text-xs text-text-muted mb-1.5 font-semibold uppercase tracking-wider">담보 형태</div>
          <p className="text-text-primary text-sm font-bold">{result.collateral_type || '-'}</p>
        </div>
        <div className="info-cell p-4 rounded-2xl sm:col-span-1"
          style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.06)' }}>
          <div className="text-xs text-text-muted mb-1.5 font-semibold uppercase tracking-wider">요약</div>
          <p className="text-text-primary text-sm font-bold">{result.summary}</p>
        </div>
      </div>

      {/* 규제 검토 알림 */}
      {result.regulatory_flags && result.regulatory_flags.length > 0 && (
        <div className="p-5 rounded-2xl mb-6 border-l-4"
          style={{
            background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.06), rgba(251, 146, 60, 0.04))',
            borderLeft: '4px solid var(--color-urgency-high)',
            border: '1px solid rgba(248, 113, 113, 0.12)',
            borderLeftWidth: '4px',
            borderLeftStyle: 'solid',
            borderLeftColor: 'var(--color-urgency-high)',
          }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
            style={{ color: 'var(--color-urgency-high)' }}>
            ⚠️ 규제 검토 필요
          </div>
          <ul className="space-y-2">
            {result.regulatory_flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-text-primary">
                <span className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs mt-0.5"
                  style={{ background: 'rgba(248, 113, 113, 0.15)', color: 'var(--color-urgency-high)' }}>
                  !
                </span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 필요 서류 체크리스트 */}
      <div className="p-6 rounded-2xl mb-6"
        style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.06)' }}>
        <div className="text-xs text-text-muted mb-4 font-semibold uppercase tracking-wider flex items-center gap-2">
          📋 필요 서류 목록 <span className="text-text-muted font-normal">({result.required_docs.length}건)</span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {result.required_docs.map((doc, i) => (
            <div key={i} className="doc-item flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
              style={{ background: 'rgba(59, 130, 246, 0.04)', border: '1px solid rgba(59, 130, 246, 0.08)' }}>
              <span className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.15))', color: 'var(--color-primary-light)' }}>
                {i + 1}
              </span>
              <span className="text-text-primary text-sm">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 고객 안내 메시지 */}
      <div className="p-5 rounded-2xl mb-7 relative"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(99, 102, 241, 0.04))',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderLeft: '4px solid var(--color-primary)',
        }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-text-muted font-semibold uppercase tracking-wider">💬 고객 안내 메시지</div>
          <button
            onClick={handleCopyResponse}
            className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
            style={{
              background: copied ? 'rgba(52, 211, 153, 0.15)' : 'rgba(59, 130, 246, 0.1)',
              color: copied ? 'var(--color-success)' : 'var(--color-primary-light)',
              border: copied ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid rgba(59, 130, 246, 0.15)',
            }}>
            {copied ? '✅ 복사됨' : '📋 복사'}
          </button>
        </div>
        <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">"{result.ai_response}"</p>
      </div>

      {/* 저장 버튼 */}
      <div>
        {isSaved ? (
          <div className="flex items-center gap-2.5 py-3 px-5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--color-success)', border: '1px solid rgba(52, 211, 153, 0.15)' }}>
            ✅ Supabase에 저장되었습니다
          </div>
        ) : (
          <button id="btn-save" onClick={onSave} disabled={isSaving} className="btn-success w-full sm:w-auto">
            {isSaving ? '저장 중...' : '💾 Supabase에 저장'}
          </button>
        )}
      </div>
    </div>
  );
}

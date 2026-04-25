import type { InquiryResult } from '../types/inquiry';

interface ResultCardProps {
  result: InquiryResult;
  customerName: string;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

/** 긴급도별 색상 */
function getUrgencyStyle(urgency: string) {
  switch (urgency) {
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

/** 분류 결과 카드 — 프리미엄 */
export default function ResultCard({ result, customerName, onSave, isSaving, isSaved }: ResultCardProps) {
  const urgency = getUrgencyStyle(result.urgency);

  return (
    <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      {/* 상단 장식선 */}
      <div className="h-1 w-16 rounded-full mb-6"
        style={{ background: `linear-gradient(90deg, ${urgency.color}, var(--color-primary))` }} />

      {/* 헤더 */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <h3 className="text-xl font-bold text-text-primary mb-1">분류 완료</h3>
          <p className="text-text-muted text-sm">{customerName}님의 문의가 분류되었습니다</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          {/* 카테고리 배지 */}
          <span className="px-4 py-2 rounded-xl text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1))',
              color: 'var(--color-primary-light)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}>
            {result.category}
          </span>
          {/* 긴급도 배지 */}
          <span className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            style={{
              backgroundColor: urgency.bg,
              color: urgency.color,
              border: `1px solid ${urgency.glow}`,
            }}>
            {urgency.icon} {result.urgency}
          </span>
        </div>
      </div>

      {/* 정보 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        {/* 요약 — 전체 너비 */}
        <div className="sm:col-span-2 p-5 rounded-2xl"
          style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.06)' }}>
          <div className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wider">문의 요약</div>
          <p className="text-text-primary text-sm leading-relaxed">{result.summary}</p>
        </div>

        {/* 담당 부서 */}
        <div className="p-5 rounded-2xl"
          style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.06)' }}>
          <div className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wider">담당 부서</div>
          <p className="text-text-primary text-base font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
            {result.department}
          </p>
        </div>

        {/* 긴급도 상세 */}
        <div className="p-5 rounded-2xl"
          style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.06)' }}>
          <div className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wider">카테고리</div>
          <p className="text-text-primary text-base font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
            {result.category}
          </p>
        </div>
      </div>

      {/* 응대 스크립트 */}
      <div className="p-5 rounded-2xl mb-7 border-l-4"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(99, 102, 241, 0.04))',
          borderLeftColor: 'var(--color-primary)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderLeft: '4px solid var(--color-primary)',
        }}>
        <div className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wider">💬 고객 응대 스크립트</div>
        <p className="text-text-primary text-sm leading-relaxed">"{result.script}"</p>
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

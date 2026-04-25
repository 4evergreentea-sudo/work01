import { useState, useEffect } from 'react';
import type { ConsultationRecord } from '../types/inquiry';
import { BUSINESS_TYPES, LOAN_TYPES, BUSINESS_TYPE_ICONS, LOAN_TYPE_ICONS } from '../types/inquiry';
import { fetchConsultations } from '../lib/supabase';

/** 대시보드 — 통계 & 분포 차트 */
export default function Dashboard() {
  const [records, setRecords] = useState<ConsultationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const response = await fetchConsultations();
      setRecords(response.data);
      setIsLoading(false);
    })();
  }, []);

  // 통계 계산
  const total = records.length;
  const today = records.filter((r) =>
    new Date(r.created_at).toDateString() === new Date().toDateString(),
  ).length;
  const individualCount = records.filter((r) => r.business_entity_type === '개인사업자').length;
  const corporateCount = records.filter((r) => r.business_entity_type === '법인사업자').length;

  // 우선순위별
  const highCount = records.filter((r) => r.priority === '높음').length;
  const mediumCount = records.filter((r) => r.priority === '보통').length;
  const lowCount = records.filter((r) => r.priority === '낮음').length;

  // 업종별 분포
  const bizDistribution = BUSINESS_TYPES.map((bt) => ({
    type: bt,
    icon: BUSINESS_TYPE_ICONS[bt],
    count: records.filter((r) => r.business_type === bt).length,
  })).filter((d) => d.count > 0).sort((a, b) => b.count - a.count);
  const maxBizCount = Math.max(...bizDistribution.map((d) => d.count), 1);

  // 대출유형별 분포
  const loanDistribution = LOAN_TYPES.map((lt) => ({
    type: lt,
    icon: LOAN_TYPE_ICONS[lt],
    count: records.filter((r) => r.loan_type === lt).length,
  })).filter((d) => d.count > 0).sort((a, b) => b.count - a.count);
  const maxLoanCount = Math.max(...loanDistribution.map((d) => d.count), 1);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center py-16 text-text-muted text-sm">
          <div className="w-8 h-8 mx-auto mb-4 rounded-full"
            style={{ border: '3px solid rgba(148, 163, 184, 0.08)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
          대시보드 데이터를 불러오고 있습니다...
        </div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4">
        <div className="glass-card p-16 text-center animate-fade-in-up">
          <div className="text-6xl mb-5" style={{ animation: 'float 3s ease-in-out infinite' }}>📊</div>
          <h3 className="text-lg font-bold text-text-primary mb-2">아직 데이터가 없습니다</h3>
          <p className="text-text-muted text-sm">"상담 입력" 탭에서 상담을 분석하고 저장하면 통계가 표시됩니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-6">
      {/* 상단 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
        {/* 총 상담 */}
        <div className="glass-card p-6">
          <div className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-3">총 상담</div>
          <div className="text-3xl font-bold text-text-primary mb-1">{total}</div>
          <div className="text-xs text-text-muted">오늘 {today}건</div>
        </div>

        {/* 개인사업자 */}
        <div className="glass-card p-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#60A5FA' }}>👤 개인사업자</div>
          <div className="text-3xl font-bold text-text-primary mb-1">{individualCount}</div>
          <div className="text-xs text-text-muted">{total ? Math.round((individualCount / total) * 100) : 0}%</div>
        </div>

        {/* 법인사업자 */}
        <div className="glass-card p-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#A78BFA' }}>🏢 법인사업자</div>
          <div className="text-3xl font-bold text-text-primary mb-1">{corporateCount}</div>
          <div className="text-xs text-text-muted">{total ? Math.round((corporateCount / total) * 100) : 0}%</div>
        </div>

        {/* 긴급 건수 */}
        <div className="glass-card p-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-urgency-high)' }}>🔴 긴급(높음)</div>
          <div className="text-3xl font-bold text-text-primary mb-1">{highCount}</div>
          <div className="text-xs text-text-muted">보통 {mediumCount} / 낮음 {lowCount}</div>
        </div>
      </div>

      {/* 사업자 유형 비율 바 */}
      <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-4">사업자 유형 비율</div>
        <div className="flex rounded-xl overflow-hidden h-8">
          {individualCount > 0 && (
            <div className="flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
              style={{
                width: `${(individualCount / total) * 100}%`,
                background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                minWidth: '40px',
              }}>
              👤 {Math.round((individualCount / total) * 100)}%
            </div>
          )}
          {corporateCount > 0 && (
            <div className="flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
              style={{
                width: `${(corporateCount / total) * 100}%`,
                background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                minWidth: '40px',
              }}>
              🏢 {Math.round((corporateCount / total) * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* 업종별 + 대출유형별 차트 (2열) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 업종별 분포 */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-5">업종별 분포</div>
          <div className="space-y-3">
            {bizDistribution.map((d) => (
              <div key={d.type}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-text-primary font-medium">{d.icon} {d.type}</span>
                  <span className="text-xs text-text-muted font-bold">{d.count}건</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(d.count / maxBizCount) * 100}%`,
                      background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                      minWidth: '8px',
                    }} />
                </div>
              </div>
            ))}
            {bizDistribution.length === 0 && (
              <p className="text-text-muted text-sm text-center py-4">데이터 없음</p>
            )}
          </div>
        </div>

        {/* 대출유형별 분포 */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-5">대출유형별 분포</div>
          <div className="space-y-3">
            {loanDistribution.map((d) => (
              <div key={d.type}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-text-primary font-medium">{d.icon} {d.type}</span>
                  <span className="text-xs text-text-muted font-bold">{d.count}건</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(d.count / maxLoanCount) * 100}%`,
                      background: 'linear-gradient(90deg, #14B8A6, #2DD4BF)',
                      minWidth: '8px',
                    }} />
                </div>
              </div>
            ))}
            {loanDistribution.length === 0 && (
              <p className="text-text-muted text-sm text-center py-4">데이터 없음</p>
            )}
          </div>
        </div>
      </div>

      {/* 우선순위별 현황 */}
      <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-5">우선순위별 현황</div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: '높음', count: highCount, color: 'var(--color-urgency-high)', bg: 'var(--color-urgency-high-bg)', icon: '🔴' },
            { label: '보통', count: mediumCount, color: 'var(--color-urgency-medium)', bg: 'var(--color-urgency-medium-bg)', icon: '🟡' },
            { label: '낮음', count: lowCount, color: 'var(--color-urgency-low)', bg: 'var(--color-urgency-low-bg)', icon: '🟢' },
          ].map((p) => (
            <div key={p.label} className="p-4 rounded-xl text-center"
              style={{ background: p.bg, border: `1px solid ${p.color}22` }}>
              <div className="text-2xl mb-1">{p.icon}</div>
              <div className="text-2xl font-bold mb-1" style={{ color: p.color }}>{p.count}</div>
              <div className="text-xs font-semibold" style={{ color: p.color }}>{p.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

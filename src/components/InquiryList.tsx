import { useState, useEffect } from 'react';
import type { InquiryRecord } from '../types/inquiry';
import { fetchInquiries } from '../lib/supabase';
import ErrorMessage from './ErrorMessage';

/** 문의 내역 테이블 — 프리미엄 */
export default function InquiryList() {
  const [records, setRecords] = useState<InquiryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    const response = await fetchInquiries();
    setIsLoading(false);
    if (response.error) setError(response.error);
    setRecords(response.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleCsvDownload = () => {
    if (records.length === 0) return;
    const BOM = '\uFEFF';
    const headers = ['시간', '고객명', '문의요약', '카테고리', '긴급도', '담당부서', '문의내용', '응대스크립트'];
    const rows = records.map((r) => [
      new Date(r.created_at).toLocaleString('ko-KR'),
      r.customer_name, r.summary, r.category, r.urgency, r.department,
      r.inquiry.replace(/"/g, '""'), r.script.replace(/"/g, '""'),
    ]);
    const csvContent = BOM + [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KB문의내역_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getUrgencyBadge = (urgency: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      높음: { bg: 'var(--color-urgency-high-bg)', color: 'var(--color-urgency-high)' },
      보통: { bg: 'var(--color-urgency-medium-bg)', color: 'var(--color-urgency-medium)' },
      낮음: { bg: 'var(--color-urgency-low-bg)', color: 'var(--color-urgency-low)' },
    };
    const s = styles[urgency] || styles['보통'];
    return (
      <span className="px-3 py-1.5 rounded-lg text-xs font-bold"
        style={{ backgroundColor: s.bg, color: s.color }}>
        {urgency}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8">
      {/* 헤더 카드 */}
      <div className="glass-card p-8 animate-fade-in-up">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="h-1 w-16 rounded-full mb-5"
              style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
            <h2 className="text-xl font-bold text-text-primary mb-1">문의 내역</h2>
            <p className="text-text-muted text-sm">
              총 <span className="font-bold" style={{ color: 'var(--color-primary-light)' }}>{records.length}</span>건의 문의가 저장되어 있습니다
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadData} disabled={isLoading} className="btn-secondary text-sm">
              🔄 새로고침
            </button>
            <button id="btn-csv-download" onClick={handleCsvDownload} disabled={records.length === 0}
              className="btn-primary text-sm">
              📥 CSV 다운로드
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {isLoading && (
        <div className="text-center py-16 text-text-muted text-sm">
          <div className="w-8 h-8 mx-auto mb-4 rounded-full"
            style={{ border: '3px solid rgba(148, 163, 184, 0.08)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
          데이터를 불러오고 있습니다...
        </div>
      )}

      {!isLoading && records.length === 0 && !error && (
        <div className="glass-card p-16 text-center animate-fade-in-up">
          <div className="text-6xl mb-5" style={{ animation: 'float 3s ease-in-out infinite' }}>📭</div>
          <h3 className="text-lg font-bold text-text-primary mb-2">저장된 문의가 없습니다</h3>
          <p className="text-text-muted text-sm">
            "문의 입력" 탭에서 문의를 분류하고 저장해보세요
          </p>
        </div>
      )}

      {!isLoading && records.length > 0 && (
        <div className="glass-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                  {['시간', '고객명', '문의 요약', '카테고리', '긴급도', '담당부서'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 text-text-muted font-semibold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="transition-all duration-300 cursor-default"
                    style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td className="px-5 py-4 text-text-muted text-xs whitespace-nowrap">
                      {new Date(record.created_at).toLocaleString('ko-KR', {
                        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4 text-text-primary font-semibold whitespace-nowrap">
                      {record.customer_name}
                    </td>
                    <td className="px-5 py-4 text-text-secondary max-w-[280px] truncate">
                      {record.summary}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.08))',
                          color: 'var(--color-primary-light)',
                          border: '1px solid rgba(59, 130, 246, 0.12)',
                        }}>
                        {record.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">{getUrgencyBadge(record.urgency)}</td>
                    <td className="px-5 py-4 text-text-secondary whitespace-nowrap">{record.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

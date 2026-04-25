import { useState, useEffect } from 'react';
import type { ConsultationRecord, BusinessType, LoanType } from '../types/inquiry';
import { BUSINESS_TYPES, LOAN_TYPES, BUSINESS_TYPE_ICONS, LOAN_TYPE_ICONS } from '../types/inquiry';
import { fetchConsultations } from '../lib/supabase';
import ErrorMessage from './ErrorMessage';

/** 상담 내역 테이블 — 프리미엄 */
export default function InquiryList() {
  const [records, setRecords] = useState<ConsultationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterEntity, setFilterEntity] = useState('');
  const [filterBiz, setFilterBiz] = useState('');
  const [filterLoan, setFilterLoan] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ConsultationRecord | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    const response = await fetchConsultations({
      entityType: filterEntity || undefined,
      businessType: filterBiz || undefined,
      loanType: filterLoan || undefined,
    });
    setIsLoading(false);
    if (response.error) setError(response.error);
    setRecords(response.data);
  };

  useEffect(() => { loadData(); }, [filterEntity, filterBiz, filterLoan]);

  const handleCsvDownload = () => {
    if (records.length === 0) return;
    const BOM = '\uFEFF';
    const headers = ['시간', '기업명', '사업자구분', '업종', '대출유형', '대출용도', '담보', '우선순위', '요약', '서류수', '문의내용'];
    const rows = records.map((r) => [
      new Date(r.created_at).toLocaleString('ko-KR'),
      r.customer_name, r.business_entity_type, r.business_type, r.loan_type,
      r.loan_purpose || '', r.collateral_type || '', r.priority, r.summary,
      String(r.required_docs?.length ?? 0),
      r.inquiry_text.replace(/"/g, '""'),
    ]);
    const csvContent = BOM + [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `기업여신상담내역_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPriorityBadge = (p: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      높음: { bg: 'var(--color-urgency-high-bg)', color: 'var(--color-urgency-high)' },
      보통: { bg: 'var(--color-urgency-medium-bg)', color: 'var(--color-urgency-medium)' },
      낮음: { bg: 'var(--color-urgency-low-bg)', color: 'var(--color-urgency-low)' },
    };
    const s = styles[p] || styles['보통'];
    return (
      <span className="px-3 py-1.5 rounded-lg text-xs font-bold"
        style={{ backgroundColor: s.bg, color: s.color }}>
        {p}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-6">
      {/* 헤더 */}
      <div className="glass-card p-8 animate-fade-in-up">
        <div className="flex flex-wrap items-center justify-between gap-5 mb-6">
          <div>
            <div className="h-1 w-16 rounded-full mb-5"
              style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
            <h2 className="text-xl font-bold text-text-primary mb-1">상담 내역</h2>
            <p className="text-text-muted text-sm">
              총 <span className="font-bold" style={{ color: 'var(--color-primary-light)' }}>{records.length}</span>건의 상담이 저장되어 있습니다
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

        {/* 필터 영역 */}
        <div className="grid gap-3 sm:grid-cols-3">
          <select className="input-field select-field text-sm" value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}>
            <option value="">전체 사업자</option>
            <option value="개인사업자">👤 개인사업자</option>
            <option value="법인사업자">🏢 법인사업자</option>
          </select>
          <select className="input-field select-field text-sm" value={filterBiz}
            onChange={(e) => setFilterBiz(e.target.value)}>
            <option value="">전체 업종</option>
            {BUSINESS_TYPES.map((bt) => (
              <option key={bt} value={bt}>{BUSINESS_TYPE_ICONS[bt]} {bt}</option>
            ))}
          </select>
          <select className="input-field select-field text-sm" value={filterLoan}
            onChange={(e) => setFilterLoan(e.target.value)}>
            <option value="">전체 대출유형</option>
            {LOAN_TYPES.map((lt) => (
              <option key={lt} value={lt}>{LOAN_TYPE_ICONS[lt]} {lt}</option>
            ))}
          </select>
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
          <h3 className="text-lg font-bold text-text-primary mb-2">저장된 상담이 없습니다</h3>
          <p className="text-text-muted text-sm">
            "상담 입력" 탭에서 기업대출 문의를 분석하고 저장해보세요
          </p>
        </div>
      )}

      {!isLoading && records.length > 0 && (
        <div className="glass-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-secondary border-b border-black/[0.04]">
                  {['시간', '기업명', '사업자', '업종', '대출유형', '우선순위', '서류'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-text-muted font-black text-[10px] uppercase tracking-widest opacity-60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const bizIcon = BUSINESS_TYPE_ICONS[record.business_type as BusinessType] || '❓';
                  const loanIcon = LOAN_TYPE_ICONS[record.loan_type as LoanType] || '📋';
                  return (
                    <tr
                      key={record.id}
                      className="transition-all duration-300 cursor-pointer hover:bg-primary/[0.03] group border-b border-black/[0.02]"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <td className="px-4 py-4 text-text-muted text-xs whitespace-nowrap">
                        {new Date(record.created_at).toLocaleString('ko-KR', {
                          month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-4 text-text-primary font-semibold whitespace-nowrap">
                        {record.customer_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-lg text-xs font-bold"
                          style={{
                            background: record.business_entity_type === '법인사업자'
                              ? 'rgba(139, 92, 246, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                            color: record.business_entity_type === '법인사업자' ? '#A78BFA' : '#60A5FA',
                          }}>
                          {record.business_entity_type === '법인사업자' ? '🏢' : '👤'} {record.business_entity_type.replace('사업자', '')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-text-secondary whitespace-nowrap text-xs">
                        {bizIcon} {record.business_type}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{
                            background: 'rgba(20, 184, 166, 0.1)',
                            color: '#2DD4BF',
                            border: '1px solid rgba(20, 184, 166, 0.12)',
                          }}>
                          {loanIcon} {record.loan_type}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{getPriorityBadge(record.priority)}</td>
                      <td className="px-4 py-4 text-text-muted text-xs whitespace-nowrap">
                        {record.required_docs?.length || 0}건
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content glass-card p-8 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary">상담 상세 정보</h3>
              <button onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200"
                style={{ background: 'rgba(148, 163, 184, 0.1)', color: 'var(--color-text-muted)', border: 'none' }}>
                ✕
              </button>
            </div>

            {/* 뱃지 영역 */}
            <div className="flex gap-2 flex-wrap mb-5">
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{
                  background: selectedRecord.business_entity_type === '법인사업자'
                    ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  color: selectedRecord.business_entity_type === '법인사업자' ? '#A78BFA' : '#60A5FA',
                }}>
                {selectedRecord.business_entity_type}
              </span>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60A5FA' }}>
                {BUSINESS_TYPE_ICONS[selectedRecord.business_type as BusinessType]} {selectedRecord.business_type}
              </span>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(20, 184, 166, 0.12)', color: '#2DD4BF' }}>
                {selectedRecord.loan_type}
              </span>
              {getPriorityBadge(selectedRecord.priority)}
            </div>

            {/* 정보 그리드 */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <div className="p-5 rounded-2xl bg-bg-secondary border border-black/[0.02]">
                <div className="text-[10px] text-text-muted mb-2 font-black uppercase tracking-widest opacity-60">기업명</div>
                <p className="text-text-primary text-[15px] font-bold">{selectedRecord.customer_name}</p>
              </div>
              <div className="p-5 rounded-2xl bg-bg-secondary border border-black/[0.02]">
                <div className="text-[10px] text-text-muted mb-2 font-black uppercase tracking-widest opacity-60">분석 요약</div>
                <p className="text-text-primary text-[14px] font-medium leading-snug">{selectedRecord.summary}</p>
              </div>
            </div>

            {/* 문의 내용 */}
            <div className="p-5 rounded-2xl mb-6 bg-bg-secondary border border-black/[0.02]">
              <div className="text-[10px] text-text-muted mb-3 font-black uppercase tracking-widest opacity-60">전체 문의 내용</div>
              <p className="text-text-primary text-[14px] leading-relaxed font-medium">{selectedRecord.inquiry_text}</p>
            </div>

            {/* 서류 목록 */}
            {selectedRecord.required_docs && selectedRecord.required_docs.length > 0 && (
              <div className="p-6 rounded-2xl mb-6 bg-white border border-black/[0.04] shadow-sm">
                <div className="text-[10px] text-text-muted mb-4 font-black uppercase tracking-widest opacity-60">📋 필요 서류 ({selectedRecord.required_docs.length}건)</div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {selectedRecord.required_docs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 text-[13.5px] text-text-primary font-bold">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0"
                        style={{ background: 'var(--color-primary)', color: '#111827' }}>{i + 1}</span>
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI 응답 */}
            {selectedRecord.ai_response && (
              <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-black/[0.03] border-l-[6px] border-l-primary">
                <div className="text-[10px] text-text-muted mb-3 font-black uppercase tracking-widest opacity-60">💬 AI 가이드 메시지</div>
                <p className="text-text-primary text-[14px] leading-relaxed font-medium whitespace-pre-line">{selectedRecord.ai_response}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

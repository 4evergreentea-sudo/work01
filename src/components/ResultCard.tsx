import { useState } from 'react';
import type { ConsultationResult } from '../types/inquiry';
import { BUSINESS_TYPE_ICONS, LOAN_TYPE_ICONS } from '../types/inquiry';

interface ResultCardProps {
  result: ConsultationResult;
  customerName: string;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
  savedId: string | null;
}

/** 우선순위별 스타일 */
function getPriorityStyle(priority: string) {
  switch (priority) {
    case '높음':
      return { bg: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', icon: '🔴', border: 'rgba(239, 68, 68, 0.15)' };
    case '보통':
      return { bg: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B', icon: '🟡', border: 'rgba(245, 158, 11, 0.15)' };
    case '낮음':
      return { bg: 'rgba(16, 185, 129, 0.08)', color: '#10B981', icon: '🟢', border: 'rgba(16, 185, 129, 0.15)' };
    default:
      return { bg: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', icon: '⚪', border: 'var(--color-border)' };
  }
}

/** 기업여신 분석 결과 카드 — 프리미엄 */
export default function ResultCard({ result, customerName, onSave, isSaving, isSaved, savedId }: ResultCardProps) {
  const priority = getPriorityStyle(result.priority);
  const [copied, setCopied] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(result.ai_response).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      setUploadComplete(false);
    }
  };

  const handleUpload = async () => {
    if (!savedId || selectedFiles.length === 0) return;
    setIsUploading(true);
    const { success, urls, error } = await import('../lib/supabase').then(m => 
      m.uploadConsultationFiles(savedId, selectedFiles)
    );
    setIsUploading(false);
    if (success) {
      setUploadComplete(true);
      setUploadedUrls(urls || []);
      setSelectedFiles([]);
    } else {
      alert(`업로드 실패: ${error}`);
    }
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
          <span className="px-3.5 py-2 rounded-xl text-[13px] font-bold flex items-center gap-1.5"
            style={{
              background: result.business_entity_type === '법인사업자'
                ? 'rgba(139, 92, 246, 0.06)'
                : 'rgba(59, 130, 246, 0.06)',
              color: result.business_entity_type === '법인사업자' ? '#8B5CF6' : '#3B82F6',
              border: result.business_entity_type === '법인사업자'
                ? '1px solid rgba(139, 92, 246, 0.12)'
                : '1px solid rgba(59, 130, 246, 0.12)',
            }}>
            {result.business_entity_type === '법인사업자' ? '🏢' : '👤'} {result.business_entity_type}
          </span>
          {/* 업종 뱃지 */}
          <span className="px-3.5 py-2 rounded-xl text-[13px] font-bold flex items-center gap-1.5"
            style={{
              background: 'rgba(79, 70, 229, 0.06)',
              color: '#4F46E5',
              border: '1px solid rgba(79, 70, 229, 0.12)',
            }}>
            {bizIcon} {result.business_type}
          </span>
          {/* 대출 유형 뱃지 */}
          <span className="px-3.5 py-2 rounded-xl text-[13px] font-bold flex items-center gap-1.5"
            style={{
              background: 'rgba(20, 184, 166, 0.06)',
              color: '#14B8A6',
              border: '1px solid rgba(20, 184, 166, 0.12)',
            }}>
            {loanIcon} {result.loan_type}
          </span>
          {/* 우선순위 뱃지 */}
          <span className="px-3.5 py-2 rounded-xl text-[13px] font-bold flex items-center gap-1.5"
            style={{
              backgroundColor: priority.bg,
              color: priority.color,
              border: `1px solid ${priority.border}`,
            }}>
            {priority.icon} {result.priority}
          </span>
        </div>
      </div>

      {/* 분석 요약 그리드 */}
      <div className="grid gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-bg-secondary p-5 rounded-2xl border border-black/[0.03]">
          <div className="text-[11px] text-text-muted mb-2 font-black uppercase tracking-widest opacity-60">대출 용도</div>
          <p className="text-text-primary text-[15px] font-bold">{result.loan_purpose || '-'}</p>
        </div>
        <div className="bg-bg-secondary p-5 rounded-2xl border border-black/[0.03]">
          <div className="text-[11px] text-text-muted mb-2 font-black uppercase tracking-widest opacity-60">담보 형태</div>
          <p className="text-text-primary text-[15px] font-bold">{result.collateral_type || '-'}</p>
        </div>
        <div className="bg-bg-secondary p-5 rounded-2xl border border-black/[0.03]">
          <div className="text-[11px] text-text-muted mb-2 font-black uppercase tracking-widest opacity-60">요약</div>
          <p className="text-text-primary text-[15px] font-bold leading-snug">{result.summary}</p>
        </div>
      </div>

      {/* 규제 검토 알림 */}
      {result.regulatory_flags && result.regulatory_flags.length > 0 && (
        <div className="p-6 rounded-2xl mb-8 border-l-[6px]"
          style={{
            background: 'rgba(239, 68, 68, 0.04)',
            borderLeftColor: '#EF4444',
            borderTop: '1px solid rgba(239, 68, 68, 0.08)',
            borderRight: '1px solid rgba(239, 68, 68, 0.08)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.08)',
          }}>
          <div className="text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"
            style={{ color: '#EF4444' }}>
            ⚠️ 규제 및 심사 주의사항
          </div>
          <ul className="space-y-3">
            {result.regulatory_flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-text-primary font-medium">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] mt-0.5"
                  style={{ background: '#EF4444', color: 'white' }}>
                  !
                </span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 필요 서류 체크리스트 */}
      <div className="p-7 rounded-[28px] mb-8 bg-white border border-black/[0.04] shadow-sm">
        <div className="text-[11px] text-text-muted mb-5 font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
          📋 준비 서류 체크리스트 <span className="font-medium">({result.required_docs.length}건)</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {result.required_docs.map((doc, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-bg-secondary border border-transparent hover:border-black/[0.03]">
              <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[13px] font-black"
                style={{ background: 'var(--color-primary)', color: '#111827' }}>
                {i + 1}
              </span>
              <span className="text-text-primary text-[14.5px] font-semibold">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 고객 안내 메시지 */}
      <div className="p-7 rounded-[28px] mb-10 relative overflow-hidden bg-[#F9FAFB] border border-black/[0.03]">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
        <div className="flex items-center justify-between mb-4">
          <div className="text-[11px] text-text-muted font-black uppercase tracking-widest opacity-60">💬 상담 요약 및 안내</div>
          <button
            onClick={handleCopyResponse}
            className={`text-xs px-4 py-2 rounded-xl font-bold transition-all duration-300 cursor-pointer ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-text-primary shadow-sm hover:shadow-md border border-black/[0.05]'
            }`}
          >
            {copied ? '✅ 복사완료' : '📋 메시지 복사'}
          </button>
        </div>
        <p className="text-text-primary text-[15px] leading-relaxed font-medium">"{result.ai_response}"</p>
      </div>

      {/* 하단 액션 섹션 (저장 및 파일 업로드) */}
      <div className="space-y-10 pt-10 border-t border-black/[0.04]">
        {/* Step 1: 저장하기 */}
        <div>
          <div className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4 opacity-60 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">1</span>
            분석 결과 저장
          </div>
          {!isSaved ? (
            <button id="btn-save" onClick={onSave} disabled={isSaving} className="btn-primary w-full sm:w-auto px-12 shadow-xl shadow-primary/20">
              {isSaving ? '상담 내역 저장 중...' : '💾 분석 결과 저장하기'}
            </button>
          ) : (
            <div className="flex items-center gap-2.5 text-green-600 font-bold text-[15px] bg-green-50 p-5 rounded-2xl border border-green-100 animate-fade-in">
              ✅ 상담 내역이 안전하게 저장되었습니다. (ID: {savedId?.substring(0, 8)})
            </div>
          )}
        </div>

        {/* Step 2: 서류 업로드 */}
        <div className={`transition-all duration-500 ${!isSaved ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
          <div className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4 opacity-60 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">2</span>
            필요 서류 제출 (선택 사항)
          </div>
          
          <div className={`p-8 rounded-[32px] bg-bg-secondary border-2 border-dashed transition-all duration-300 ${isSaved ? 'border-primary/30 hover:border-primary bg-white' : 'border-black/[0.08]'}`}>
            {!isSaved && (
              <div className="mb-4 text-xs font-bold text-text-muted text-center">
                ⚠️ 서류 업로드를 위해 먼저 분석 결과를 저장해주세요.
              </div>
            )}
            
            <div className="text-center">
              <div className="text-4xl mb-4">📁</div>
              <h4 className="text-[16px] font-bold text-text-primary mb-2">서류 업로드</h4>
              <p className="text-text-muted text-sm mb-6">안내받은 필요 서류를 선택하거나 드래그하여 올려주세요</p>
              
              <input
                type="file"
                multiple
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                disabled={!isSaved}
              />
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <label 
                  htmlFor="file-upload" 
                  className={`btn-secondary py-3 px-8 cursor-pointer transition-all duration-300 ${isSaved ? 'hover:bg-bg-secondary border-black/10' : 'opacity-50 cursor-not-allowed'}`}
                >
                  파일 선택하기
                </label>
                
                {selectedFiles.length > 0 && isSaved && (
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="btn-primary py-3 px-10 shadow-xl shadow-primary/30 animate-bounce-subtle"
                  >
                    {isUploading ? '제출 중...' : `${selectedFiles.length}개 서류 제출 완료하기`}
                  </button>
                )}
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-8 text-left max-w-md mx-auto animate-fade-in">
                  <div className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-3 opacity-60">제출 대기 파일</div>
                  <div className="space-y-2">
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-black/[0.05] shadow-sm text-sm">
                        <span className="font-semibold truncate pr-4 text-text-primary">📄 {f.name}</span>
                        <span className="text-[11px] text-text-muted font-bold">{(f.size / 1024).toFixed(1)}KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadComplete && (
                <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-100 animate-fade-in-up">
                  <div className="text-[16px] font-bold text-green-700 mb-1">✨ 서류 제출 완료!</div>
                  <p className="text-[13px] text-green-600 font-medium">제출하신 {uploadedUrls.length}개의 서류가 상담 내역에 성공적으로 연결되었습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

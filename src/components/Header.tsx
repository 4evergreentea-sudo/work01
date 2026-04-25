/** 기업여신 상담 AI 브랜딩 헤더 — 프리미엄 디자인 */
export default function Header() {
  return (
    <header className="w-full pt-8 pb-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 메인 헤더 */}
        <div className="flex items-center gap-5">
          {/* KB 로고 */}
          <div className="relative">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                color: '#fff',
                boxShadow: '0 8px 30px -5px rgba(59, 130, 246, 0.35)',
              }}
            >
              KB
            </div>
            {/* 온라인 표시 */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2"
              style={{
                backgroundColor: 'var(--color-success)',
                borderColor: 'var(--color-bg-primary)',
                boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)',
              }}
            />
          </div>

          {/* 타이틀 영역 */}
          <div>
            <h1 className="text-2xl font-bold text-text-primary leading-tight tracking-tight">
              기업여신 상담 AI
            </h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-text-muted">기업대출 서류 안내 & 상담 자동화</span>
              <span className="text-text-muted">·</span>
              <span
                className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.12))',
                  color: 'var(--color-primary-light)',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                }}
              >
                Gemini 3 Flash · 기업여신 전문
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

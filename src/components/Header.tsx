/** KB금융그룹 CI 기반 프리미엄 헤더 */
export default function Header() {
  return (
    <header className="w-full pt-12 pb-6 px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center gap-5">
          {/* 세련된 로고 디자인 */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center font-black text-2xl animate-fade-in"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#111827',
              boxShadow: '0 12px 32px -8px var(--color-primary-glow)',
            }}
          >
            KB
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">
              기업여신 상담 <span className="text-primary">AI</span>
            </h1>
            <p className="text-text-secondary text-base font-medium opacity-80">
              국민의 평생 금융파트너 — KB국민은행
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

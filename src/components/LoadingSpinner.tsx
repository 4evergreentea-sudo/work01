/** 프리미엄 로딩 스피너 */
export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
      {/* 스피너 */}
      <div className="relative w-20 h-20">
        {/* 외부 링 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '3px solid rgba(148, 163, 184, 0.08)',
            borderTopColor: 'var(--color-primary)',
            animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }}
        />
        {/* 내부 링 */}
        <div
          className="absolute inset-3 rounded-full"
          style={{
            border: '3px solid transparent',
            borderBottomColor: 'var(--color-accent)',
            animation: 'spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse',
          }}
        />
        {/* 중심 도트 */}
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: 'var(--color-primary)',
              animation: 'pulse-glow 2s ease-in-out infinite',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
            }}
          />
        </div>
      </div>

      {/* 텍스트 */}
      <p className="mt-8 text-text-secondary text-sm font-medium">
        AI가 문의를 분석하고 있습니다
      </p>
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-primary-light)',
              animation: `pulse-glow 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

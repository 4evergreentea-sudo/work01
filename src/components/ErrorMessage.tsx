interface ErrorMessageProps {
  message: string;
  rawResponse?: string;
  onRetry?: () => void;
}

/** 프리미엄 에러 메시지 */
export default function ErrorMessage({ message, rawResponse, onRetry }: ErrorMessageProps) {
  return (
    <div className="glass-card p-7 animate-fade-in-up border-l-4" style={{ borderLeftColor: 'var(--color-error)' }}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.15)' }}>
          <span className="text-lg">⚠️</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--color-error)' }}>오류 발생</h4>
          <p className="text-text-secondary text-sm leading-relaxed">{message}</p>
        </div>
      </div>

      {rawResponse && (
        <div className="mt-5 p-4 rounded-xl text-xs font-mono break-all leading-relaxed"
          style={{ background: 'rgba(248, 113, 113, 0.05)', border: '1px solid rgba(248, 113, 113, 0.1)', color: 'var(--color-text-muted)' }}>
          <span className="font-bold" style={{ color: 'var(--color-error)' }}>Raw 응답 (200자):</span>
          <br />{rawResponse}
        </div>
      )}

      {onRetry && (
        <div className="mt-5">
          <button onClick={onRetry} className="btn-secondary text-sm">🔄 다시 시도</button>
        </div>
      )}
    </div>
  );
}

interface TabBarProps {
  activeTab: 'input' | 'list' | 'dashboard';
  onTabChange: (tab: 'input' | 'list' | 'dashboard') => void;
}

/** 3탭 전환 UI — 프리미엄 */
export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs = [
    { id: 'input' as const, label: '상담 입력', icon: '✏️' },
    { id: 'list' as const, label: '상담 내역', icon: '📊' },
    { id: 'dashboard' as const, label: '대시보드', icon: '📈' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 mb-10">
      <div
        className="flex rounded-2xl p-1.5 gap-1"
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-400 cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.15))'
                  : 'transparent',
                color: isActive ? '#fff' : 'var(--color-text-muted)',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid transparent',
                boxShadow: isActive
                  ? '0 0 20px -5px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
                  : 'none',
              }}
            >
              <span style={{ fontSize: '15px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

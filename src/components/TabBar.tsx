interface TabBarProps {
  activeTab: 'input' | 'list' | 'dashboard';
  onTabChange: (tab: 'input' | 'list' | 'dashboard') => void;
}

/** KB 스타일 탭 바 — 고품격 화이트 & 스타 옐로우 */
export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs = [
    { id: 'input' as const, label: '상담 입력', icon: '✏️' },
    { id: 'list' as const, label: '상담 내역', icon: '📊' },
    { id: 'dashboard' as const, label: '대시보드', icon: '📈' },
  ];

  return (
    <div className="max-w-md mx-auto px-4 mb-12">
      <div className="flex bg-white rounded-[24px] p-2 border border-black/[0.04] shadow-lg shadow-black/[0.02]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-3.5 px-4 rounded-[18px] font-bold text-[15px] transition-all duration-500 cursor-pointer flex items-center justify-center gap-2.5 ${
                isActive 
                  ? 'bg-primary text-[#111827] shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from 'react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import InquiryForm from './components/InquiryForm';
import InquiryList from './components/InquiryList';

/** KB금융 고객 문의 자동 분류 시스템 메인 앱 */
export default function App() {
  const [activeTab, setActiveTab] = useState<'input' | 'list'>('input');

  return (
    <div className="min-h-screen relative">
      {/* 배경 효과 레이어 */}
      <div className="mesh-bg" />
      <div className="noise-overlay" />

      {/* 콘텐츠 */}
      <div className="relative z-10">
        <Header />
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="pb-16">
          {activeTab === 'input' ? <InquiryForm /> : <InquiryList />}
        </main>

        {/* 푸터 */}
        <footer className="text-center py-8 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-text-muted text-xs">
            © 2026 KB금융그룹 AI 문의 분류 시스템 — 실습용 프로젝트
          </p>
        </footer>
      </div>
    </div>
  );
}

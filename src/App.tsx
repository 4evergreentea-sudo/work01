import { useState } from 'react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import InquiryForm from './components/InquiryForm';
import InquiryList from './components/InquiryList';
import Dashboard from './components/Dashboard';

/** KB 기업여신 상담 AI — 화이트 프리미엄 레이아웃 */
export default function App() {
  const [activeTab, setActiveTab] = useState<'input' | 'list' | 'dashboard'>('input');

  return (
    <div className="relative min-h-screen">
      {/* 배경 메시 그라데이션 */}
      <div className="mesh-bg" />

      {/* 컨텐츠 레이어 */}
      <div className="relative z-10">
        <Header />
        
        <main className="main-container py-8">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {activeTab === 'input' && <InquiryForm />}
            {activeTab === 'list' && <InquiryList />}
            {activeTab === 'dashboard' && <Dashboard />}
          </div>
        </main>

        <footer className="w-full py-16 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <div className="h-[1px] w-full bg-black/[0.03] mb-10" />
            <p className="text-text-muted text-[12px] font-bold tracking-widest uppercase opacity-40">
              © 2026 KB Corporate Loan AI Agent · Premium Digital Banking
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Coach from './pages/Coach';
import Simulator from './pages/Simulator';
import KnowledgeHub from './pages/KnowledgeHub';
import { 
  Leaf, LayoutDashboard, Calculator as CalcIcon, MessageSquare, 
  Sparkles, BookOpen, LogOut, Sun, Moon, Contrast 
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading, isGuest, theme, setTheme, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator' | 'coach' | 'simulator' | 'hub'>('dashboard');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-16 h-16 rounded-full animate-pulse-green flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <Leaf size={28} className="text-white animate-float" />
        </div>
        <p className="font-bold text-sm tracking-wide" style={{ color: 'var(--text-secondary)' }}>Launching EcoTrack AI Platform...</p>
        <div className="mt-3 w-48 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
          <div className="progress-bar-eco h-full" style={{ width: '60%' }}></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'calculator':
        return <Calculator onSuccess={() => setActiveTab('dashboard')} />;
      case 'coach':
        return <Coach />;
      case 'simulator':
        return <Simulator />;
      case 'hub':
        return <KnowledgeHub />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'calculator', label: 'Calculator', icon: <CalcIcon size={16} /> },
    { id: 'coach', label: 'AI Coach', icon: <MessageSquare size={16} /> },
    { id: 'simulator', label: 'Simulator', icon: <Sparkles size={16} /> },
    { id: 'hub', label: 'Knowledge Hub', icon: <BookOpen size={16} /> }
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* ── Guest Demo Banner ── */}
      {isGuest && (
        <div
          className="text-center py-1.5 text-xs font-semibold tracking-wide"
          style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6)', color: 'white' }}
        >
          ⚡ Demo Mode — Session data will be lost on refresh or close
        </div>
      )}

      {/* ── Premium Glassmorphism Navbar ── */}
      <header className="sticky top-0 z-40 glass-header" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" 
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <Leaf size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Eco<span className="text-gradient-green">Track</span>{' '}
              <span className="text-gradient-blue">AI</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main Navigation">
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-white shadow-md'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                style={activeTab === tab.id ? { 
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                } : {
                  color: 'var(--text-secondary)'
                }}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Toolbar */}
          <div className="flex items-center gap-2">
            {/* Theme selector */}
            <div 
              className="flex items-center gap-0.5 rounded-xl p-1" 
              style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
            >
              {[
                { id: 'light' as const, icon: <Sun size={13} />, color: '#f59e0b' },
                { id: 'dark' as const, icon: <Moon size={13} />, color: '#10b981' },
                { id: 'high-contrast' as const, icon: <Contrast size={13} />, color: '#3b82f6' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className="p-1.5 rounded-lg text-xs transition-all duration-200"
                  style={theme === t.id ? {
                    background: 'var(--bg-primary)',
                    color: t.color,
                    boxShadow: '0 1px 3px var(--shadow-color)'
                  } : {
                    color: 'var(--text-muted)'
                  }}
                  aria-label={`${t.id} mode`}
                >
                  {t.icon}
                </button>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-xl transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/30 group"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
              aria-label="Sign Out of Platform"
            >
              <LogOut size={15} className="group-hover:text-red-500 transition-colors" />
            </button>
          </div>

        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 w-full" role="main">
        <div className="animate-fade-in">
          {renderActivePage()}
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 py-2 flex justify-around z-50"
        style={{ 
          background: 'var(--bg-secondary)', 
          borderTop: '1px solid var(--border-color)',
          boxShadow: '0 -4px 20px var(--shadow-color)'
        }}
        role="navigation" 
        aria-label="Mobile Navigation"
      >
        {[
          { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={18} /> },
          { id: 'calculator', label: 'Calc', icon: <CalcIcon size={18} /> },
          { id: 'coach', label: 'Coach', icon: <MessageSquare size={18} /> },
          { id: 'simulator', label: 'Sim', icon: <Sparkles size={18} /> },
          { id: 'hub', label: 'Hub', icon: <BookOpen size={18} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all duration-200"
            style={{ color: activeTab === tab.id ? '#10b981' : 'var(--text-muted)' }}
          >
            {activeTab === tab.id && (
              <div className="absolute -top-0.5 w-8 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}></div>
            )}
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="h-16 md:hidden"></div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Navbar } from './components';
import { getSessionUser, logoutUser } from './store';
import { LanguageProvider, useLanguage } from './i18n';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import WaitingRoom from './pages/WaitingRoom';
import Login from './pages/Login';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [targetSlug, setTargetSlug] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // 1. Recupera sessão
    const session = getSessionUser();
    setUser(session);
    
    // 2. Checa URL Params para Waiting Room (Redirecionado pelo Backend)
    // O Backend manda Free Users para: http://frontend/?waiting=slug
    const params = new URLSearchParams(window.location.search);
    const waitingSlug = params.get('waiting');

    if (waitingSlug) {
      setTargetSlug(waitingSlug);
      setCurrentPage('redirect');
      // Limpa URL visualmente para ficar mais limpo (opcional)
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home user={user} onShorten={(slug) => {
           // Fluxo visual: Apenas mostra o link criado, não redireciona
           // O usuário copia o link.
        }} />;
      case 'dashboard':
        return <Dashboard user={user} setUser={setUser} />;
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'redirect':
        return <WaitingRoom slug={targetSlug || ''} onComplete={() => setCurrentPage('home')} />;
      case 'privacy':
        return <Privacy />;
      case 'cookies':
        return <Cookies />;
      default:
        return <Home user={user} onShorten={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onNavigate={setCurrentPage} 
        user={user} 
        onLogout={handleLogout} 
      />
      <main className="flex-1 flex flex-col">
        {renderPage()}
      </main>
      
      <footer className="py-12 px-8 border-t border-slate-900 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
          <div>© 2024 nuturl. All rights reserved.</div>
          <div className="flex gap-8">
            <button onClick={() => setCurrentPage('privacy')} className="hover:text-emerald-400 transition-colors">
              {t('legal.privacy_title')}
            </button>
            <button onClick={() => setCurrentPage('cookies')} className="hover:text-emerald-400 transition-colors">
              {t('legal.cookies_title')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;

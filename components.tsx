
import React, { useEffect } from 'react';
import { useLanguage } from './i18n';

// Logo SVG Inline (Geometric/Infinite Link Concept)
export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20" 
      stroke="url(#gold-gradient)" 
      strokeWidth="4" 
      strokeLinecap="round"
    />
    <path 
      d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20" 
      stroke="url(#gold-gradient)" 
      strokeWidth="4" 
      strokeLinecap="round"
      className="opacity-60"
    />
    <path d="M20 10V30" stroke="url(#gold-gradient)" strokeWidth="4" strokeLinecap="round"/>
    <defs>
      <linearGradient id="gold-gradient" x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" /> {/* Amber 400 */}
        <stop offset="1" stopColor="#D97706" /> {/* Amber 600 */}
      </linearGradient>
    </defs>
  </svg>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }> = ({ 
  children, 
  variant = 'primary', 
  className, 
  ...props 
}) => {
  const variants = {
    // Gradiente Metálico Dourado
    primary: 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-amber-300/50',
    // Dark Petrol com borda sutil
    secondary: 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500/30',
    ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-amber-400',
  };

  return (
    <button 
      className={`px-6 py-3 rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <input 
      className={`w-full bg-[#0b1221] border border-slate-800/60 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-inner ${className}`}
      {...props}
    />
  );
};

export const Navbar: React.FC<{ 
  onNavigate: (page: string) => void; 
  user: any; 
  onLogout: () => void 
}> = ({ onNavigate, user, onLogout }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => onNavigate('home')}
      >
        <Logo className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
        <span className="text-2xl font-bold tracking-tighter text-slate-100">
          nut<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 group-hover:to-amber-400 transition-all">url</span>
        </span>
      </div>
      <div className="flex gap-4 items-center">
        {/* Language Switcher */}
        <div className="flex bg-[#0b1221] rounded-lg border border-slate-800 p-1 mr-2">
          <button 
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-slate-700 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('pt')}
            className={`px-2 py-1 text-xs font-bold rounded ${language === 'pt' ? 'bg-slate-700 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            PT
          </button>
        </div>

        {user ? (
          <>
            <button onClick={() => onNavigate('dashboard')} className="text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors">
              {t('nav.dashboard')}
            </button>
            <Button variant="ghost" onClick={onLogout} className="text-sm py-2 px-4">
              {t('nav.logout')}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => onNavigate('login')} className="text-sm py-2 px-4">
            {t('nav.login')}
          </Button>
        )}
      </div>
    </nav>
  );
};

// Componente Híbrido: Mostra Placeholder OU Ad Real se configurado
export const GoogleAdPlaceholder: React.FC<{ size?: 'banner' | 'square'; slot?: string }> = ({ size = 'banner', slot }) => {
  const { t } = useLanguage();
  const dimensions = size === 'banner' ? 'h-32 w-full' : 'h-64 w-64';
  
  // Usa a variável de ambiente do Vite (frontend) de forma segura
  const env = (import.meta as any).env;
  const CLIENT_ID = env?.VITE_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (slot && window.adsbygoogle && CLIENT_ID) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error", e);
      }
    }
  }, [slot, CLIENT_ID]);

  if (!slot || !CLIENT_ID) {
    return (
      <div className={`${dimensions} bg-[#0b1221] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-600`}>
        <span className="text-xs uppercase tracking-widest font-bold text-amber-500/40">{t('ads.space')}</span>
        <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-[10px]">Ad</div>
        {!CLIENT_ID && <span className="text-[9px] text-red-500/50">Missing ID</span>}
      </div>
    );
  }

  return (
    <div className={`${dimensions} overflow-hidden rounded-2xl bg-[#0b1221] flex items-center justify-center`}>
      <ins className="adsbygoogle"
         style={{ display: 'block', width: '100%', height: '100%' }}
         data-ad-client={CLIENT_ID}
         data-ad-slot={slot}
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  // Fundo Vidro Petróleo + Borda sutil
  <div className={`bg-[#0f172a]/60 border border-slate-800/50 shadow-xl rounded-2xl p-6 backdrop-blur-md ${className}`}>
    {children}
  </div>
);

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}


import React, { useState, useEffect } from 'react';
import { Button, Input, GoogleAdPlaceholder, Card } from '../components';
import { AccountType, User } from '../types';
import { createLink, getSystemStats } from '../store';
import { useLanguage } from '../i18n';

interface HomeProps {
  user: User | null;
  onShorten: (slug: string) => void;
}

const Home: React.FC<HomeProps> = ({ user, onShorten }) => {
  const { t, language } = useLanguage();
  const [url, setUrl] = useState('');
  const [shortened, setShortened] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Stats Reais do DB
  const [stats, setStats] = useState({ users: 0, links: 0, clicks: 0, uptime: '...' });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Busca estatísticas reais ao carregar
    getSystemStats()
      .then(data => {
        setStats(data);
        setLoadingStats(false);
      })
      .catch(() => {
        // Silently fail for stats (likely server not running in dev)
        setLoadingStats(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    
    try {
      const link = await createLink(url, user?.id);
      setShortened(link.slug);
      // Atualiza stats localmente para feedback instantâneo (opcional)
      setStats(prev => ({ ...prev, links: prev.links + 1 }));
    } catch (error) {
      alert("Erro ao criar link. Tente novamente ou verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (loadingStats) return '...';
    const locale = language === 'pt' ? 'pt-BR' : 'en-US';
    return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(num);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-8 pt-20 pb-12 flex flex-col items-center">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-100 drop-shadow-lg">
          {t('home.hero_title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-400 italic">{t('home.hero_title_2')}</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
          {t('home.hero_desc')}
        </p>
      </div>

      {/* Main Input Form */}
      <Card className="w-full max-w-3xl shadow-[0_0_40px_rgba(0,0,0,0.3)] relative overflow-hidden group border-amber-500/10">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input 
                placeholder={t('home.input_placeholder')}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pr-12 text-lg py-4 bg-[#020617] border-slate-800"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading || !url} 
              className="md:w-48 text-lg shadow-lg"
            >
              {loading ? t('home.processing') : t('home.shorten_btn')}
            </Button>
          </div>
        </form>

        {shortened && (
          <div className="mt-8 pt-8 border-t border-slate-800 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between p-4 bg-[#0b1221] rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">{t('home.link_ready')}</span>
                <span className="text-xl font-mono text-amber-400 tracking-wide">nuturl.com/{shortened}</span>
              </div>
              <div className="flex gap-2">
                 <Button 
                  variant="secondary" 
                  className="py-2 px-4 text-sm"
                  onClick={() => navigator.clipboard.writeText(`nuturl.com/${shortened}`)}
                >
                  {t('home.copy')}
                </Button>
                <Button 
                  variant="ghost" 
                  className="py-2 px-4 text-sm text-amber-500 hover:text-amber-400"
                  onClick={() => window.location.hash = shortened}
                >
                  {t('home.visit')}
                </Button>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 text-center">
              {/* Complex interpolation simplified for demo */}
              Validity: {user?.accountType === AccountType.PREMIUM ? t('home.validity_premium') : user ? t('home.validity_free') : t('home.validity_guest')}. 
              {!user && <span className="text-amber-500 cursor-pointer ml-1 hover:underline underline-offset-4 font-medium">{t('home.create_account_hint')}</span>}
            </p>
          </div>
        )}
      </Card>

      {/* Ad Section */}
      {!user || user.accountType !== AccountType.PREMIUM ? (
        <div className="w-full max-w-3xl mt-12 space-y-4">
          <GoogleAdPlaceholder />
        </div>
      ) : (
        <div className="mt-12 text-slate-500 text-sm flex items-center gap-2">
          <svg className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.333 16.676 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
          {t('home.premium_ad_remove')}
        </div>
      )}

      {/* Social Proof / Stats - Reais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 w-full text-center">
        {[
          { label: t('home.stats_clicks'), value: formatNumber(stats.clicks) },
          { label: t('home.stats_links'), value: formatNumber(stats.links) },
          { label: t('home.stats_users'), value: formatNumber(stats.users) },
          { label: t('home.stats_uptime'), value: stats.uptime },
        ].map((stat, i) => (
          <div key={i} className="space-y-1">
            <div className="text-3xl font-bold text-slate-100 font-mono animate-in fade-in duration-700">{stat.value}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-500/80 font-bold">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;


import React, { useState, useEffect } from 'react';
import { Button, Card, GoogleAdPlaceholder } from '../components';
import { getLinkDetails } from '../store';
import { AccountType } from '../types';
import { useLanguage } from '../i18n';

interface WaitingRoomProps {
  slug: string;
  onComplete: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ slug, onComplete }) => {
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(15);
  const [link, setLink] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Busca dados reais no servidor
    getLinkDetails(slug)
      .then((data) => {
        setLink(data);
        if (data.user?.accountType === AccountType.PREMIUM) {
          setIsPremium(true);
          window.location.href = data.originalUrl;
        }
      })
      .catch(() => {
        setError(t('waiting.error_title'));
      });
  }, [slug]);

  useEffect(() => {
    if (isPremium || error || !link) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPremium, error, link]);

  const handleGo = () => {
    if (link) {
      window.location.href = link.originalUrl;
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-6xl mb-6">🛰️</div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">{error}</h2>
        <Button variant="secondary" onClick={onComplete}>{t('waiting.btn_home')}</Button>
      </div>
    );
  }

  if (isPremium || !link) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
        <p className="text-slate-400 animate-pulse font-medium">{isPremium ? t('waiting.redirecting') : t('waiting.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-8 py-12 flex flex-col md:flex-row gap-12 items-start">
      <div className="flex-1 space-y-8 order-2 md:order-1">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-100">{t('waiting.title')}</h2>
          <p className="text-slate-400">
            {t('waiting.desc_1')} <span className="text-amber-500 font-bold">nuturl</span>. 
            {t('waiting.desc_2')}
          </p>
        </div>

        <Card className="flex flex-col items-center justify-center py-12 border-amber-500/10 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
          <div className="relative mb-8">
             <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-slate-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * (15 - countdown)) / 15}
                  className="text-amber-500 transition-all duration-1000 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-slate-100 font-mono">
                {countdown}s
              </div>
          </div>
          
          <Button 
            onClick={handleGo} 
            disabled={countdown > 0} 
            className="w-full max-w-xs text-xl py-4"
          >
            {countdown > 0 ? t('waiting.btn_verifying') : t('waiting.btn_go')}
          </Button>
          
          {countdown > 0 && (
             <p className="mt-4 text-xs text-slate-600 uppercase tracking-widest font-bold animate-pulse">
               {t('waiting.validating')}
             </p>
          )}
        </Card>

        <div className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
          <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500">
             <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-200 uppercase tracking-tight">{t('waiting.vip_title')}</div>
            <div className="text-xs text-slate-500">{t('waiting.vip_desc')}</div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-80 flex flex-col gap-6 order-1 md:order-2">
        <div className="text-xs text-slate-700 uppercase tracking-widest font-black mb-[-12px] ml-1">{t('waiting.sponsors')}</div>
        <GoogleAdPlaceholder size="square" />
        <GoogleAdPlaceholder size="square" />
        <div className="hidden md:block">
           <GoogleAdPlaceholder size="square" />
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;

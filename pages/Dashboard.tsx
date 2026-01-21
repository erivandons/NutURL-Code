
import React, { useState, useEffect } from 'react';
import { AccountType, User, ShortLink } from '../types';
import { Button, Card, Input } from '../components';
import { getLinks, deleteLink, createCheckoutSession } from '../store';
import { useLanguage } from '../i18n';

interface DashboardProps {
  user: User | null;
  setUser: (u: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, setUser }) => {
  const { t } = useLanguage();
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [growth, setGrowth] = useState<number>(0);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getLinks(user.id)
        .then(data => {
          setLinks(data);
          calculateGrowth(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
      
      const params = new URLSearchParams(window.location.search);
      if (params.get('status') === 'success') {
         // Opcional: Feedback visual de sucesso
      }
    }
  }, [user]);

  const calculateGrowth = (allLinks: ShortLink[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthLinks = allLinks.filter(l => {
      const d = new Date(l.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const lastMonthLinks = allLinks.filter(l => {
      const d = new Date(l.createdAt);
      let targetMonth = currentMonth - 1;
      let targetYear = currentYear;
      if (targetMonth < 0) {
        targetMonth = 11;
        targetYear = currentYear - 1;
      }
      return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    }).length;

    if (lastMonthLinks === 0) {
      setGrowth(currentMonthLinks > 0 ? 100 : 0);
    } else {
      const percent = Math.round(((currentMonthLinks - lastMonthLinks) / lastMonthLinks) * 100);
      setGrowth(percent);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('dashboard.delete_confirm'))) {
      try {
        await deleteLink(id);
        const updatedLinks = links.filter(l => l.id !== id);
        setLinks(updatedLinks);
        calculateGrowth(updatedLinks);
      } catch (e) {
        alert(t('dashboard.delete_error'));
      }
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setProcessingPayment(true);
    try {
      const checkoutUrl = await createCheckoutSession();
      window.location.href = checkoutUrl;
    } catch (e) {
      alert(t('dashboard.payment_error'));
      setProcessingPayment(false);
    }
  };

  const handleDowngrade = async () => {
    alert(t('dashboard.downgrade_alert'));
  };

  const filteredLinks = links.filter(l => 
    l.originalUrl.toLowerCase().includes(filter.toLowerCase()) || 
    l.slug.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto w-full px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-100">{t('dashboard.welcome')} {user?.name}</h1>
          <p className="text-slate-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#0b1221] border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">{t('dashboard.plan_label')}</span>
            <span className={`text-sm font-bold ${user?.accountType === AccountType.PREMIUM ? 'text-amber-400 drop-shadow-sm' : 'text-slate-300'}`}>
              {user?.accountType === AccountType.PREMIUM ? t('dashboard.plan_premium') : t('dashboard.plan_free')}
            </span>
          </div>
          {user?.accountType !== AccountType.PREMIUM ? (
            <Button 
              variant="primary" 
              onClick={handleUpgrade} 
              disabled={processingPayment}
              className="py-2 px-4 text-xs shadow-none border-0"
            >
              {processingPayment ? '...' : t('dashboard.upgrade_btn')}
            </Button>
          ) : (
             <Button variant="ghost" onClick={handleDowngrade} className="py-2 px-4 text-xs text-slate-400">{t('dashboard.manage_btn')}</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="flex items-center gap-4 border-l-4 border-l-amber-500/50">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
             <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{loading ? '...' : links.length}</div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">{t('dashboard.card_links')}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border-l-4 border-l-cyan-500/50">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-500">
             <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">{loading ? '...' : links.reduce((acc, curr) => acc + curr.clicks, 0)}</div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">{t('dashboard.card_clicks')}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4 border-l-4 border-l-purple-500/50">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
             <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </div>
          <div>
            <div className={`text-2xl font-bold ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {growth > 0 ? '+' : ''}{growth}%
            </div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">{t('dashboard.card_growth')}</div>
          </div>
        </Card>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">{t('dashboard.filter_title')}</h2>
        <Input 
          placeholder={t('dashboard.filter_placeholder')}
          className="max-w-xs text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left">
          <thead className="bg-[#0b1221]/80 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.table_orig')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.table_short')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">{t('dashboard.table_clicks')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.table_exp')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">{t('dashboard.table_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
               <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-600 animate-pulse">Loading...</td></tr>
            ) : filteredLinks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-600">{t('dashboard.no_links')}</td>
              </tr>
            ) : (
              filteredLinks.map((link) => (
                <tr key={link.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate text-sm text-slate-300" title={link.originalUrl}>
                      {link.originalUrl}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono text-amber-500 font-medium">nuturl.com/{link.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-[#0b1221] border border-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-300 shadow-sm">{link.clicks}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-500">
                      {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" className="p-2 h-8 w-8 flex items-center justify-center rounded-lg hover:text-amber-400" onClick={() => navigator.clipboard.writeText(`nuturl.com/${link.slug}`)}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                      </Button>
                      <Button variant="ghost" className="p-2 h-8 w-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-900/20" onClick={() => handleDelete(link.id)}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;

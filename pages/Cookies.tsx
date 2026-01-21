
import React from 'react';
import { useLanguage } from '../i18n';

const Cookies: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-8 py-16">
      <div className="space-y-8">
        <div className="border-b border-slate-800 pb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">{t('legal.cookies_title')}</h1>
          <p className="text-slate-500">{t('legal.updated')}</p>
        </div>

        <div className="prose prose-invert prose-amber max-w-none text-slate-300">
          <p className="text-lg leading-relaxed mb-8">{t('legal.cookies_intro')}</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#0b1221] border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-3">{t('legal.c_section_1_title')}</h2>
              <p className="text-sm leading-relaxed text-slate-400">{t('legal.c_section_1_text')}</p>
            </div>
            <div className="bg-[#0b1221] border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-3">{t('legal.c_section_2_title')}</h2>
              <p className="text-sm leading-relaxed text-slate-400">{t('legal.c_section_2_text')}</p>
            </div>
          </div>

          {/* Critical for AdSense */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold text-amber-500 mb-4">{t('legal.c_section_3_title')}</h2>
            <p className="leading-relaxed text-slate-300">{t('legal.c_section_3_text')}</p>
          </div>

          <div className="bg-[#0b1221] border border-slate-800 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-100 mb-4">{t('legal.c_section_4_title')}</h2>
            <p className="leading-relaxed text-slate-400">{t('legal.c_section_4_text')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cookies;

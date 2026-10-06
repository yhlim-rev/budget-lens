import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Smartphone, Code, PenSquare } from 'lucide-react';
import { Card, Button, Input, Select, Modal } from './components/common';
import { DonutChart } from './components/DonutChart';
import { VelocityChart } from './components/VelocityChart';
import { CategoryManager } from './components/CategoryManager';
import { KHR_RATE, DEFAULT_CATEGORIES, BANK_CHANNELS, I18N } from './constants';

export default function App() {
  const [currentLang, setCurrentLang] = useState('en');
  const [primaryCurrency, setPrimaryCurrency] = useState('USD');
  const [entryCurrency, setEntryCurrency] = useState('USD');

  const [categories, setCategories] = useState(() => {
    try {
      const s = localStorage.getItem('budget_lens_categories');
      return s ? JSON.parse(s) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const s = localStorage.getItem('budget_lens_expenses');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const t = useMemo(() => I18N[currentLang] || I18N.en, [currentLang]);

  useEffect(() => {
    localStorage.setItem('budget_lens_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('budget_lens_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const toUSD = useCallback((amt, curr) => curr === 'KHR' ? amt / KHR_RATE : amt, []);

  const formatCurrency = useCallback((amtUSD) => {
    const val = isNaN(amtUSD) ? 0 : amtUSD;
    if (primaryCurrency === 'KHR') {
      return `${Math.round(val * KHR_RATE).toLocaleString('en-US')} ៛`;
    }
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [primaryCurrency]);

  const totalCapUSD = useMemo(() => Object.values(categories).reduce((s, c) => s + (c.limit || 0), 0), [categories]);
  const totalSpendUSD = useMemo(() => expenses.reduce((s, e) => s + toUSD(e.rawAmount || 0, e.currency), 0), [expenses, toUSD]);
  const cushionUSD = Math.max(0, totalCapUSD - totalSpendUSD);
  const burnPct = totalCapUSD > 0 ? (totalSpendUSD / totalCapUSD) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] p-4 sm:p-8 font-sans selection:bg-[#e8834a]/30">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#e8834a] font-mono text-xl font-bold">&lt;/&gt;</span>
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-white">Budget Lens</h1>
              <span className="text-xs font-mono bg-[#e8834a]/10 text-[#e8834a] border border-[#e8834a]/25 px-2.5 py-0.5 rounded-full">
                {t.badge_privacy}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">{t.header_sub}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 font-mono text-xs">
              <button onClick={() => setCurrentLang('en')} className={`px-2.5 py-1 rounded ${currentLang === 'en' ? 'bg-[#e8834a] text-zinc-950 font-bold' : 'text-zinc-400'}`}>EN</button>
              <button onClick={() => setCurrentLang('zh')} className={`px-2.5 py-1 rounded ${currentLang === 'zh' ? 'bg-[#e8834a] text-zinc-950 font-bold' : 'text-zinc-400'}`}>中文</button>
            </div>
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 font-mono text-xs">
              <button onClick={() => setPrimaryCurrency('USD')} className={`px-2.5 py-1 rounded ${primaryCurrency === 'USD' ? 'bg-[#e8834a] text-zinc-950 font-bold' : 'text-zinc-400'}`}>$ USD</button>
              <button onClick={() => setPrimaryCurrency('KHR')} className={`px-2.5 py-1 rounded ${primaryCurrency === 'KHR' ? 'bg-[#e8834a] text-zinc-950 font-bold' : 'text-zinc-400'}`}>៛ KHR</button>
            </div>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          <Card className="p-5">
            <span className="text-xs text-zinc-400 block mb-1">{t.kpi_total_spend}</span>
            <div className="text-3xl font-bold text-white">{formatCurrency(totalSpendUSD)}</div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-[#e8834a] h-full transition-all" style={{ width: `${Math.min(100, burnPct)}%` }} />
            </div>
          </Card>
          <Card className="p-5">
            <span className="text-xs text-zinc-400 block mb-1">{t.kpi_envelope_cap}</span>
            <div className="text-3xl font-bold text-zinc-100">{formatCurrency(totalCapUSD)}</div>
            <span className="text-xs text-zinc-500 mt-3 block">{t.kpi_cap_sub}</span>
          </Card>
          <Card className="p-5">
            <span className="text-xs text-zinc-400 block mb-1">{t.kpi_cushion}</span>
            <div className="text-3xl font-bold text-[#e8834a]">{formatCurrency(cushionUSD)}</div>
            <span className="text-xs text-zinc-500 mt-3 block">{burnPct > 100 ? t.kpi_status_warn : t.kpi_status_ok}</span>
          </Card>
        </section>

        {/* Category Manager */}
        <CategoryManager
          categories={categories}
          expenses={expenses}
          currentLang={currentLang}
          formatCurrency={formatCurrency}
          onSaveCategory={(c) => setCategories(p => ({ ...p, [c.nameEn || c.nameZh]: c }))}
          onDeleteCategory={(k) => setCategories(p => { const cp = { ...p }; delete cp[k]; return cp; })}
          onEditLimit={(k) => {}}
          toUSD={toUSD}
          t={t}
        />

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonutChart
            categories={categories}
            expenses={expenses}
            currentLang={currentLang}
            primaryCurrency={primaryCurrency}
            formatCurrency={formatCurrency}
            totalSpendUSD={totalSpendUSD}
            toUSD={toUSD}
            t={t}
          />
          <VelocityChart
            expenses={expenses}
            primaryCurrency={primaryCurrency}
            toUSD={toUSD}
            t={t}
          />
        </section>
      </div>
    </div>
  );
}
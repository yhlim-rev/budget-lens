import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Smartphone, Code, PenSquare } from 'lucide-react';
import { Card, Button } from './components/common';
import { DonutChart } from './components/DonutChart';
import { VelocityChart } from './components/VelocityChart';
import { CategoryManager } from './components/CategoryManager';
import { QuickLogger } from './components/QuickLogger';
import { LedgerTable } from './components/LedgerTable';
import { PhoneSyncModal } from './components/PhoneSyncModal';
import { CapModal, EditLimitModal } from './components/CapModals';
import { KHR_RATE, DEFAULT_CATEGORIES, I18N } from './constants';

export default function App() {
  const [currentLang, setCurrentLang] = useState('en');
  const [primaryCurrency, setPrimaryCurrency] = useState('USD');
  const [entryCurrency, setEntryCurrency] = useState('USD');

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isCapModalOpen, setIsCapModalOpen] = useState(false);
  const [editingCategoryKey, setEditingCategoryKey] = useState(null);

  const t = useMemo(() => I18N[currentLang] || I18N.en, [currentLang]);

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

  useEffect(() => {
    localStorage.setItem('budget_lens_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('budget_lens_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const toUSD = useCallback((amt, curr) => (curr === 'KHR' ? amt / KHR_RATE : amt), []);

  const formatCurrency = useCallback(
    (amtUSD) => {
      const val = isNaN(amtUSD) ? 0 : amtUSD;
      if (primaryCurrency === 'KHR') {
        return `${Math.round(val * KHR_RATE).toLocaleString('en-US')} ៛`;
      }
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    [primaryCurrency]
  );

  const totalCapUSD = useMemo(
    () => Object.values(categories).reduce((s, c) => s + (c.limit || 0), 0),
    [categories]
  );

  const totalSpendUSD = useMemo(
    () => expenses.reduce((s, e) => s + toUSD(e.rawAmount || 0, e.currency), 0),
    [expenses, toUSD]
  );

  const cushionUSD = Math.max(0, totalCapUSD - totalSpendUSD);
  const burnPct = totalCapUSD > 0 ? (totalSpendUSD / totalCapUSD) * 100 : 0;

  const handleLogExpense = (newExp) => {
    setExpenses((prev) => [...prev, { ...newExp, id: Date.now() }]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaveCategory = ({ nameEn, nameZh, limit, color }) => {
    const key = nameEn || nameZh;
    setCategories((prev) => ({
      ...prev,
      [key]: { limit, color, nameEn, nameZh }
    }));
  };

  const handleDeleteCategory = (catKey) => {
    if (Object.keys(categories).length <= 1) return;
    setCategories((prev) => {
      const cp = { ...prev };
      delete cp[catKey];
      return cp;
    });
  };

  const handleUpdateCap = (name, newLimit) => {
    setCategories((prev) => {
      if (!prev[name]) return prev;
      return { ...prev, [name]: { ...prev[name], limit: newLimit } };
    });
  };

  const handleExportAiPayload = () => {
    const payload = {
      version: '1.0.0',
      app: 'Budget Lens',
      language: currentLang,
      exportedAt: new Date().toISOString(),
      currencyContext: { display: primaryCurrency, pegUSD_KHR: KHR_RATE },
      monthlyCapUSD: totalCapUSD,
      totalSpendUSD: totalSpendUSD,
      categoryEnvelopes: categories,
      transactions: expenses.map((e) => ({
        id: e.id,
        date: e.date,
        amountUSD: toUSD(e.rawAmount, e.currency),
        originalCurrency: e.currency,
        originalAmount: e.rawAmount,
        category: e.category,
        note: e.note,
        recurring: e.recurring
      }))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-lens-ai-schema-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] p-3 sm:p-6 md:p-8 font-sans selection:bg-[#e8834a]/30">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#e8834a] font-mono text-xl font-bold">&lt;/&gt;</span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
                Budget Lens
              </h1>
              <span className="text-xs font-mono bg-[#e8834a]/10 text-[#e8834a] border border-[#e8834a]/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e8834a] animate-pulse" />
                <span>{t.badge_privacy}</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">{t.header_sub}</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 font-mono text-xs">
              <button
                onClick={() => setCurrentLang('en')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  currentLang === 'en' ? 'bg-[#e8834a] text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setCurrentLang('zh')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  currentLang === 'zh' ? 'bg-[#e8834a] text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                中文
              </button>
            </div>

            <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 font-mono text-xs">
              <button
                onClick={() => setPrimaryCurrency('USD')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  primaryCurrency === 'USD' ? 'bg-[#e8834a] text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
              <button
                onClick={() => setPrimaryCurrency('KHR')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  primaryCurrency === 'KHR' ? 'bg-[#e8834a] text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ៛ KHR
              </button>
            </div>

            <Button variant="secondary" size="md" icon={Smartphone} onClick={() => setIsSyncModalOpen(true)}>
              {t.btn_sync}
            </Button>

            <Button variant="secondary" size="md" icon={Code} onClick={handleExportAiPayload}>
              {t.btn_ai_schema}
            </Button>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 font-mono">
            <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
              <span>{t.kpi_total_spend}</span>
              <span className="text-[11px] text-[#e8834a] font-semibold">{burnPct.toFixed(1)}% {t.of_cap}</span>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">{formatCurrency(totalSpendUSD)}</div>
            <div className="w-full bg-zinc-800/80 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${burnPct > 100 ? 'bg-rose-500' : 'bg-[#e8834a]'}`}
                style={{ width: `${Math.min(100, burnPct)}%` }}
              />
            </div>
          </Card>

          <Card className="p-5 font-mono">
            <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
              <span>{t.kpi_envelope_cap}</span>
              <Button variant="ghost" size="xs" icon={PenSquare} onClick={() => setIsCapModalOpen(true)} className="text-[#e8834a] hover:bg-[#e8834a]/10">
                {t.btn_set_edit}
              </Button>
            </div>
            <div className="text-3xl font-bold text-zinc-100 tracking-tight">{formatCurrency(totalCapUSD)}</div>
            <span className="text-xs text-zinc-500 mt-3 block">{t.kpi_cap_sub}</span>
          </Card>

          <Card className="p-5 font-mono">
            <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
              <span>{t.kpi_cushion}</span>
              <span className="text-[10px] text-zinc-500">{t.kpi_eom}</span>
            </div>
            <div className="text-3xl font-bold text-[#e8834a] tracking-tight">{formatCurrency(cushionUSD)}</div>
            <p className={`text-xs mt-3 ${burnPct > 100 ? 'text-rose-400 font-semibold' : 'text-zinc-500'}`}>
              {burnPct > 100 ? t.kpi_status_warn : t.kpi_status_ok}
            </p>
          </Card>
        </section>

        {/* Category Manager */}
        <CategoryManager
          categories={categories}
          expenses={expenses}
          currentLang={currentLang}
          formatCurrency={formatCurrency}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          onEditLimit={(catName) => setEditingCategoryKey(catName)}
          toUSD={toUSD}
          t={t}
        />

        {/* Quick Transaction Entry Bar */}
        <QuickLogger
          categories={categories}
          entryCurrency={entryCurrency}
          setEntryCurrency={setEntryCurrency}
          onLogExpense={handleLogExpense}
          currentLang={currentLang}
          t={t}
        />

        {/* Visualizations: Donut & Burn Velocity */}
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

        {/* Local Ledger Table */}
        <LedgerTable
          expenses={expenses}
          categories={categories}
          currentLang={currentLang}
          primaryCurrency={primaryCurrency}
          formatCurrency={formatCurrency}
          onDeleteExpense={handleDeleteExpense}
          toUSD={toUSD}
          t={t}
        />
      </div>

      {/* Modals */}
      <PhoneSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        t={t}
      />

      <CapModal
        isOpen={isCapModalOpen}
        onClose={() => setIsCapModalOpen(false)}
        categories={categories}
        onUpdateCap={handleUpdateCap}
        formatCurrency={formatCurrency}
        totalCapUSD={totalCapUSD}
        currentLang={currentLang}
        t={t}
      />

      <EditLimitModal
        isOpen={!!editingCategoryKey}
        onClose={() => setEditingCategoryKey(null)}
        categoryKey={editingCategoryKey}
        categories={categories}
        onSaveLimit={handleUpdateCap}
        currentLang={currentLang}
        t={t}
      />
    </div>
  );
}
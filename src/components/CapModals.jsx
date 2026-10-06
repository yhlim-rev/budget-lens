import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from './common';

export const CapModal = ({
  isOpen,
  onClose,
  categories,
  onUpdateCap,
  formatCurrency,
  totalCapUSD,
  currentLang,
  t
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.modal_cap_title} subtitle={t.modal_cap_sub}>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {Object.entries(categories).map(([name, cfg]) => {
          const title = currentLang === 'zh' ? cfg.nameZh || cfg.nameEn || name : cfg.nameEn || cfg.nameZh || name;
          return (
            <div
              key={name}
              className="flex items-center justify-between gap-3 p-2 rounded-lg bg-[#09090b] border border-zinc-800/80"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                <span className="text-xs font-mono text-zinc-200 truncate">{title}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-mono text-zinc-500">$</span>
                <input
                  type="number"
                  step="10"
                  min="0"
                  defaultValue={cfg.limit}
                  onBlur={(e) => onUpdateCap(name, parseFloat(e.target.value) || 0)}
                  className="w-20 bg-[#0f1117] border border-zinc-700 focus:border-[#e8834a] rounded px-2 py-1 text-xs text-right font-mono text-white focus:outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between font-mono text-xs">
        <span className="text-zinc-400">{t.lbl_total_monthly_cap}</span>
        <span className="text-sm font-bold text-white">{formatCurrency(totalCapUSD)}</span>
      </div>

      <Button variant="primary" size="lg" onClick={onClose} className="w-full">
        {t.btn_save_apply}
      </Button>
    </Modal>
  );
};

export const EditLimitModal = ({
  isOpen,
  onClose,
  categoryKey,
  categories,
  onSaveLimit,
  currentLang,
  t
}) => {
  const [val, setVal] = useState('');

  useEffect(() => {
    if (categoryKey && categories[categoryKey]) {
      setVal(categories[categoryKey].limit);
    }
  }, [categoryKey, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      onSaveLimit(categoryKey, parsed);
      onClose();
    }
  };

  const catName = categoryKey && categories[categoryKey]
    ? currentLang === 'zh'
      ? categories[categoryKey].nameZh || categories[categoryKey].nameEn || categoryKey
      : categories[categoryKey].nameEn || categories[categoryKey].nameZh || categoryKey
    : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.modal_single_title} subtitle={catName} maxWidth="max-w-xs">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="number"
          min="0"
          step="10"
          label={t.lbl_new_monthly_limit}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" size="lg" className="w-full">
          {t.btn_update_limit}
        </Button>
      </form>
    </Modal>
  );
};
import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Card, Button, Input } from './common';
import { THEME_PALETTE } from '../constants';

export const CategoryManager = ({
  categories,
  expenses,
  currentLang,
  formatCurrency,
  onSaveCategory,
  onDeleteCategory,
  onEditLimit,
  toUSD,
  t
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameZh, setNameZh] = useState('');
  const [capVal, setCapVal] = useState('');
  const [selectedColor, setSelectedColor] = useState(THEME_PALETTE[0]);
  const [errorMsg, setErrorMsg] = useState('');

  const nextAutoColor = useMemo(() => {
    const used = Object.values(categories).map((c) => c.color.toLowerCase());
    const available = THEME_PALETTE.find((c) => !used.includes(c.toLowerCase()));
    return available || THEME_PALETTE[Object.keys(categories).length % THEME_PALETTE.length];
  }, [categories]);

  const handleOpenDrawer = () => {
    setSelectedColor(nextAutoColor);
    setErrorMsg('');
    setIsDrawerOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameZh.trim()) {
      setErrorMsg(t.err_cat_name_req);
      return;
    }
    const parsedCap = parseFloat(capVal);
    if (isNaN(parsedCap) || parsedCap < 0) {
      setErrorMsg('Please enter a valid monthly cap');
      return;
    }

    onSaveCategory({
      nameEn: nameEn.trim(),
      nameZh: nameZh.trim(),
      limit: parsedCap,
      color: selectedColor
    });

    setNameEn('');
    setNameZh('');
    setCapVal('');
    setIsDrawerOpen(false);
    setErrorMsg('');
  };

  const getCategoryTitle = (name, config) => {
    if (currentLang === 'zh') return config.nameZh || config.nameEn || name;
    return config.nameEn || config.nameZh || name;
  };

  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-200">
              {t.cat_section_title}
            </h2>
            <span className="text-[11px] font-mono text-[#e8834a] px-2 py-0.5 rounded bg-[#e8834a]/10 border border-[#e8834a]/20">
              {Object.keys(categories).length}{' '}
              {Object.keys(categories).length !== 1 ? t.envelopes_label : t.envelope_single}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-mono">{t.cat_section_sub}</p>
        </div>

        <Button variant="secondary" size="sm" icon={Plus} onClick={handleOpenDrawer}>
          {t.btn_new_envelope}
        </Button>
      </div>

      {isDrawerOpen && (
        <form onSubmit={handleSave} className="p-4 rounded-lg bg-zinc-950/80 border border-zinc-800 mb-4 transition-all">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <Input
              label={t.lbl_cat_name_en}
              placeholder={t.placeholder_cat_name_en}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
            <Input
              label={t.lbl_cat_name_zh}
              placeholder={t.placeholder_cat_name_zh}
              value={nameZh}
              onChange={(e) => setNameZh(e.target.value)}
            />
            <Input
              type="number"
              min="0"
              step="10"
              label={t.lbl_cat_cap}
              placeholder="100"
              value={capVal}
              onChange={(e) => setCapVal(e.target.value)}
              required
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono text-zinc-400">{t.lbl_cat_color}</label>
                <button
                  type="button"
                  onClick={() => setSelectedColor(nextAutoColor)}
                  className="text-[9px] font-mono text-[#e8834a] hover:underline"
                >
                  {t.btn_next_auto_color}
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-10 h-8 bg-[#0f1117] border border-zinc-800 rounded cursor-pointer p-0.5 shrink-0"
                  title="Color picker"
                />
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  {THEME_PALETTE.slice(0, 6).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-5 h-5 rounded-full shrink-0 transition-transform ${
                        selectedColor.toLowerCase() === color.toLowerCase()
                          ? 'ring-2 ring-white scale-110'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md" className="w-full">
                {t.btn_save_envelope}
              </Button>
              <Button type="button" variant="outline" size="md" onClick={() => setIsDrawerOpen(false)}>
                {t.btn_cancel}
              </Button>
            </div>
          </div>
          {errorMsg && (
            <p className="text-[10px] font-mono text-rose-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errorMsg}
            </p>
          )}
        </form>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(categories).map(([name, config]) => {
          const catSpendUSD = expenses
            .filter((e) => e.category === name)
            .reduce((sum, e) => sum + toUSD(e.rawAmount || 0, e.currency), 0);
          const catCapUSD = config.limit || 0;
          const catPct = catCapUSD > 0 ? Math.min(100, (catSpendUSD / catCapUSD) * 100) : 0;
          const displayName = getCategoryTitle(name, config);

          return (
            <div
              key={name}
              className="bg-[#09090b] border border-zinc-800 p-3 rounded-lg flex flex-col justify-between hover:border-zinc-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-200 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: config.color }} />
                    <span className="truncate">{displayName}</span>
                  </span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => onEditLimit(name)}
                      className="text-zinc-500 hover:text-[#e8834a] p-1 text-[10px]"
                      title="Edit limit"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(name)}
                      className="text-zinc-600 hover:text-rose-400 p-1 text-[10px]"
                      title="Delete category"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
                <div className="text-sm font-mono font-bold text-white mt-1">
                  {formatCurrency(catSpendUSD)}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                  {t.cap_prefix} {formatCurrency(catCapUSD)}
                </div>
              </div>

              <div className="w-full bg-zinc-800 h-1 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${catPct}%`, backgroundColor: config.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
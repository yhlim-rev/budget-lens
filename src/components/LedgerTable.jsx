import React from 'react';
import { Receipt, Trash2 } from 'lucide-react';
import { Card } from './common';

export const LedgerTable = ({
  expenses,
  categories,
  currentLang,
  primaryCurrency,
  formatCurrency,
  onDeleteExpense,
  toUSD,
  t
}) => {
  const getCatTitle = (catName) => {
    const cfg = categories[catName];
    if (!cfg) return catName;
    return currentLang === 'zh' ? cfg.nameZh || cfg.nameEn || catName : cfg.nameEn || cfg.nameZh || catName;
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-200">
            {t.ledger_title}
          </h3>
          <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
            {expenses.length} {t.records_label}
          </span>
        </div>
        <span className="text-xs font-mono text-zinc-500">{t.ledger_sub}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-zinc-950/60 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
            <tr>
              <th className="p-3">{t.th_date}</th>
              <th className="p-3">{t.th_category}</th>
              <th className="p-3">{t.th_note}</th>
              <th className="p-3">{t.th_channel}</th>
              <th className="p-3 text-right">{t.th_amount}</th>
              <th className="p-3 text-center">{t.th_action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono text-xs">
                  <Receipt className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  {t.ledger_empty}
                </td>
              </tr>
            ) : (
              [...expenses].reverse().map((item) => {
                const originalText =
                  item.currency === 'KHR'
                    ? `${item.rawAmount.toLocaleString()} ៛`
                    : `$${item.rawAmount.toFixed(2)}`;

                const convertedText =
                  primaryCurrency === 'KHR'
                    ? formatCurrency(toUSD(item.rawAmount, item.currency))
                    : item.currency === 'KHR'
                    ? `(${formatCurrency(toUSD(item.rawAmount, item.currency))})`
                    : '';

                return (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 text-zinc-400">{item.date}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-200">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: categories[item.category]?.color || '#e8834a' }}
                        />
                        {getCatTitle(item.category)}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-300 font-sans">{item.note || t.general_spend}</td>
                    <td className="p-3 text-zinc-400 text-[11px]">{item.channel}</td>
                    <td className="p-3 text-right font-bold text-white">
                      -{originalText}{' '}
                      <span className="text-[10px] font-normal text-zinc-500">{convertedText}</span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onDeleteExpense(item.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
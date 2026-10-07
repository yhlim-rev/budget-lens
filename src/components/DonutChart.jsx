import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RotateCcw } from 'lucide-react';
import { Card, Button } from './common';
import { DEFAULT_KHR_RATE } from '../constants';

export const DonutChart = ({
  categories,
  expenses,
  currentLang,
  primaryCurrency,
  formatCurrency,
  totalSpendUSD,
  toUSD,
  khrRate,
  t
}) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const donutData = useMemo(() => {
    return Object.entries(categories).map(([name, cfg]) => {
      const catSpendUSD = expenses
        .filter((e) => e.category === name)
        .reduce((sum, e) => sum + toUSD(e.rawAmount || 0, e.currency), 0);
      const rate = khrRate || DEFAULT_KHR_RATE;
      const val = primaryCurrency === 'KHR' ? Math.round(catSpendUSD * rate) : parseFloat(catSpendUSD.toFixed(2));
      const displayName = currentLang === 'zh' ? cfg.nameZh || cfg.nameEn || name : cfg.nameEn || cfg.nameZh || name;
      return {
        name: displayName,
        value: val,
        color: cfg.color
      };
    }).filter((item) => item.value > 0);
  }, [categories, expenses, currentLang, primaryCurrency, toUSD, khrRate]);

  const isEmpty = donutData.length === 0;

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-200">
            {t.chart_donut_title}
          </h3>
          <p className="text-[11px] text-zinc-400 font-mono">{t.chart_donut_sub}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={RotateCcw}
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          {t.btn_refresh}
        </Button>
      </div>

      <div className="relative h-64 w-full flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart key={refreshKey}>
            <Pie
              data={isEmpty ? [{ name: 'Empty', value: 1 }] : donutData}
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={96}
              cornerRadius={isEmpty ? 0 : 8}
              paddingAngle={isEmpty ? 0 : 5}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              stroke="#09090b"
              strokeWidth={2}
            >
              {isEmpty ? (
                <Cell fill="#1e222d" />
              ) : (
                donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))
              )}
            </Pie>
            {!isEmpty && (
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-xs font-mono text-white shadow-xl">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.color }} />
                          <span className="font-semibold">{data.name}</span>
                        </div>
                        <div className="text-zinc-400">
                          {primaryCurrency === 'KHR'
                            ? `${data.value.toLocaleString()} ៛`
                            : `$${Number(data.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            {t.lbl_total_spend}
          </span>
          <span className="text-lg font-bold font-mono text-zinc-100">
            {formatCurrency(totalSpendUSD)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-zinc-800/80 text-xs font-mono">
        {isEmpty ? (
          <div className="col-span-full text-center text-[11px] text-zinc-500 py-1">
            {t.donut_empty_legend}
          </div>
        ) : (
          donutData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-zinc-400 truncate">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
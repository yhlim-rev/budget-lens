import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from './common';
import { KHR_RATE } from '../constants';

export const VelocityChart = ({
  expenses,
  primaryCurrency,
  toUSD,
  t
}) => {
  const trendData = useMemo(() => {
    const dateMap = {};
    expenses.forEach((e) => {
      const day = e.date ? e.date.slice(5) : '00-00';
      dateMap[day] = (dateMap[day] || 0) + toUSD(e.rawAmount || 0, e.currency);
    });

    const dates = Object.keys(dateMap).sort();
    if (dates.length === 0) {
      const today = new Date().toISOString().slice(5, 10);
      return [{ date: today, amount: 0 }];
    }

    return dates.map((d) => ({
      date: d,
      amount: primaryCurrency === 'KHR' ? Math.round(dateMap[d] * KHR_RATE) : parseFloat(dateMap[d].toFixed(2))
    }));
  }, [expenses, primaryCurrency, toUSD]);

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-200">
            {t.chart_velocity_title}
          </h3>
          <p className="text-[11px] text-zinc-400 font-mono">{t.chart_velocity_sub}</p>
        </div>
        <span className="text-[10px] font-mono text-[#e8834a] bg-[#e8834a]/10 px-2 py-0.5 rounded border border-[#e8834a]/20">
          {t.badge_realtime_curve}
        </span>
      </div>

      <div className="relative h-64 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e8834a" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#e8834a" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
            <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-xs font-mono text-white shadow-xl">
                      <div className="text-zinc-400 mb-1">{label}</div>
                      <div className="text-[#e8834a] font-bold">
                        {primaryCurrency === 'KHR'
                          ? `${payload[0].value.toLocaleString()} ៛`
                          : `$${Number(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#e8834a"
              strokeWidth={2}
              fill="url(#velocityGrad)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-zinc-800/80 text-xs font-mono text-zinc-500">
        <span>{t.lbl_baseline_30d}</span>
        <span className="text-zinc-400">{expenses.length > 0 ? t.velocity_monitoring : t.velocity_empty}</span>
      </div>
    </Card>
  );
};
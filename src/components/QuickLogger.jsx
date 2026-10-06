import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Card, Button, Input, Select } from './common';
import { BANK_CHANNELS } from '../constants';

export const QuickLogger = ({
  categories,
  entryCurrency,
  setEntryCurrency,
  onLogExpense,
  currentLang,
  t
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [channel, setChannel] = useState('ABA Bank');
  const [note, setNote] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    const keys = Object.keys(categories);
    if (keys.length > 0 && (!category || !categories[category])) {
      setCategory(keys[0]);
    }
  }, [categories, category]);

  const validate = useCallback((valStr, curr) => {
    if (!valStr.trim()) {
      setAmountError('');
      return false;
    }
    const val = parseFloat(valStr);
    if (curr === 'KHR') {
      if (isNaN(val) || val < 100) {
        setAmountError(t.err_min_khr);
        return false;
      }
    } else {
      if (isNaN(val) || val < 0.01) {
        setAmountError(t.err_min_usd);
        return false;
      }
    }
    setAmountError('');
    return true;
  }, [t]);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    validate(val, entryCurrency);
  };

  const handleCurrencyToggle = (curr) => {
    setEntryCurrency(curr);
    validate(amount, curr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate(amount, entryCurrency)) return;

    const val = parseFloat(amount);
    onLogExpense({
      rawAmount: val,
      currency: entryCurrency,
      category,
      channel,
      note: note.trim() || t.general_spend,
      recurring,
      date: new Date().toISOString().slice(0, 10)
    });

    setAmount('');
    setNote('');
    setRecurring(false);
    setAmountError('');
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-mono text-zinc-400">{t.lbl_amount}</label>
            <div className="flex gap-1 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => handleCurrencyToggle('USD')}
                className={`transition-colors ${
                  entryCurrency === 'USD' ? 'text-[#e8834a] font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                $ USD
              </button>
              <span className="text-zinc-600">|</span>
              <button
                type="button"
                onClick={() => handleCurrencyToggle('KHR')}
                className={`transition-colors ${
                  entryCurrency === 'KHR' ? 'text-[#e8834a] font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                ៛ KHR
              </button>
            </div>
          </div>
          <Input
            type="number"
            step="any"
            placeholder={entryCurrency === 'KHR' ? '100' : '0.00'}
            value={amount}
            onChange={handleAmountChange}
            leftSymbol={entryCurrency === 'USD' ? '$' : '៛'}
            error={amountError}
            required
          />
        </div>

        <Select
          label={t.lbl_category}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {Object.entries(categories).map(([k, cfg]) => (
            <option key={k} value={k}>
              {currentLang === 'zh' ? cfg.nameZh || cfg.nameEn || k : cfg.nameEn || cfg.nameZh || k}
            </option>
          ))}
        </Select>

        <Select
          label={t.lbl_channel}
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          <option value="Cash">Cash</option>
          <optgroup label="Banks &amp; KHQR (Cambodia)">
            {BANK_CHANNELS.filter((b) => b !== 'Cash').map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </optgroup>
        </Select>

        <Input
          label={t.lbl_note}
          placeholder={t.placeholder_note}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex items-center h-10 px-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-400 hover:text-zinc-200 select-none">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-800 text-[#e8834a] focus:ring-[#e8834a]"
            />
            <span>{t.lbl_recurring}</span>
          </label>
        </div>

        <Button type="submit" variant="primary" size="lg" icon={Plus} className="w-full">
          {t.btn_log_spend}
        </Button>
      </form>
    </Card>
  );
};
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';
import { currencies } from '../utils/currencies';

interface CurrencySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: string;
  onSelect: (code: string) => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  isOpen,
  onClose,
  currentCurrency,
  onSelect
}) => {
  const [tempCurrency, setTempCurrency] = useState(currentCurrency);

  React.useEffect(() => {
    if (isOpen) {
      setTempCurrency(currentCurrency);
    }
  }, [isOpen, currentCurrency]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[60] bg-slate-50"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-bold text-slate-900">Select Currency</h2>
              <button
                type="button"
                disabled={tempCurrency === currentCurrency}
                onClick={() => {
                  onSelect(tempCurrency);
                  onClose();
                }}
                className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-amber-100 transition hover:bg-amber-600 disabled:opacity-50 disabled:shadow-none"
              >
                Set
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="grid gap-2.5">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setTempCurrency(c.code)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition-all ${
                      tempCurrency === c.code
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold shadow-sm transition-colors ${
                        tempCurrency === c.code ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {c.symbol}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900 text-sm leading-tight">{c.code}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{c.name}</p>
                      </div>
                    </div>
                    {tempCurrency === c.code && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

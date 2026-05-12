import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface MonthSelectorProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  totalIncome: number;
  totalExpenses: number;
  currency: string;
  showBalance?: boolean;
}

const toLocalMonthKey = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
};

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  setSelectedMonth,
  totalIncome,
  totalExpenses,
  currency,
  showBalance = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate last 12 months
  const months = Array.from({ length: 24 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    return {
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase(),
      value: toLocalMonthKey(d)
    };
  }).reverse();

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const activeElement = container.querySelector(`[data-active="true"]`) as HTMLElement;
    if (activeElement) {
      const containerWidth = container.offsetWidth;
      const elementOffset = activeElement.offsetLeft;
      const elementWidth = activeElement.offsetWidth;

      // Calculate scroll position to center the element
      const scrollPos = elementOffset - (containerWidth / 2) + (elementWidth / 2);

      container.scrollTo({
        left: scrollPos,
        behavior: 'smooth'
      });
    }
  }, [selectedMonth]);

  return (
    <div className="space-y-4">
      {/* Month Pills Container */}
      <div className="relative overflow-hidden">
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-4 -mx-4 snap-x"
        >
          {months.map((m) => (
            <button
              key={m.value}
              data-active={selectedMonth === m.value}
              onClick={() => setSelectedMonth(m.value)}
              className={`snap-center px-4 py-2 rounded-full text-[10px] font-bold transition-all whitespace-nowrap flex-shrink-0 ${selectedMonth === m.value
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
                }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className={`grid gap-2 sm:gap-4 ${showBalance ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {showBalance && (
          <div className="bg-indigo-600 p-2 sm:p-4 min-h-[60px] sm:min-h-[80px] rounded-xl sm:rounded-2xl text-white shadow-sm flex flex-col justify-center gap-0.5 sm:gap-1 overflow-hidden">
            <p className="text-[7px] sm:text-[9px] font-bold text-indigo-100 uppercase tracking-wider truncate">Balance</p>
            <p className="text-[10px] sm:text-base font-bold truncate leading-tight">
              {formatCurrency(totalIncome - totalExpenses, currency)}
            </p>
          </div>
        )}

        <div className="bg-white p-2 sm:p-4 min-h-[60px] sm:min-h-[80px] rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center gap-0.5 sm:gap-1 overflow-hidden">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Income</p>
          </div>
          <p className="text-[10px] sm:text-base font-bold text-emerald-600 truncate leading-tight">
            {formatCurrency(totalIncome, currency)}
          </p>
        </div>

        <div className="bg-white p-2 sm:p-4 min-h-[60px] sm:min-h-[80px] rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center gap-0.5 sm:gap-1 overflow-hidden">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 shrink-0" />
            <p className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">Expenses</p>
          </div>
          <p className="text-[10px] sm:text-base font-bold text-rose-600 truncate leading-tight">
            -{formatCurrency(totalExpenses, currency)}
          </p>
        </div>
      </div>
    </div>
  );
};

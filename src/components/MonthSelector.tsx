import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface MonthSelectorProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  totalIncome: number;
  totalExpenses: number;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  setSelectedMonth,
  totalIncome,
  totalExpenses
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase(),
      value: d.toISOString().slice(0, 7)
    };
  }).reverse();

  useEffect(() => {
    // Scroll to active month on load
    const activeElement = scrollRef.current?.querySelector(`[data-active="true"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedMonth]);

  return (
    <div className="space-y-4">
      {/* Month Pills Container */}
      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 snap-x"
        >
          {months.map((m) => (
            <button
              key={m.value}
              data-active={selectedMonth === m.value}
              onClick={() => setSelectedMonth(m.value)}
              className={`snap-center px-4 py-2 rounded-full text-[10px] font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                selectedMonth === m.value 
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
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="bg-white p-2.5 sm:p-5 rounded-[1rem] sm:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-2 sm:gap-4 overflow-hidden">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-50 rounded-lg sm:rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
            <ArrowUpRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[7px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Income</p>
            <p className="text-[10px] sm:text-base font-bold text-emerald-600 truncate">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-5 rounded-[1rem] sm:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-2 sm:gap-4 overflow-hidden">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-rose-50 rounded-lg sm:rounded-2xl flex items-center justify-center text-rose-600 flex-shrink-0">
            <ArrowDownRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[7px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Expenses</p>
            <p className="text-[10px] sm:text-base font-bold text-rose-600 truncate">
              -{formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Month Pills Container */}
      <div className="relative group">
        <div 
          ref={scrollRef}
          className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-1 px-1 snap-x"
        >
          {months.map((m) => (
            <button
              key={m.value}
              data-active={selectedMonth === m.value}
              onClick={() => setSelectedMonth(m.value)}
              className={`snap-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                selectedMonth === m.value 
                  ? 'bg-slate-900 text-white shadow-md scale-105' 
                  : 'bg-white/50 text-slate-400 hover:text-slate-600 border border-slate-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-2.5 sm:gap-4 group transition-all">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:scale-105 transition-transform">
            <ArrowUpRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Income</p>
            <p className="text-xs sm:text-base font-bold text-emerald-600 truncate">
              +{formatCurrency(totalIncome)}
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-2.5 sm:gap-4 group transition-all">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-rose-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-rose-600 flex-shrink-0 group-hover:scale-105 transition-transform">
            <ArrowDownRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Expenses</p>
            <p className="text-xs sm:text-base font-bold text-rose-600 truncate">
              -{formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Month Pills Container */}
      <div className="relative group">
        <div 
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-1 snap-x"
        >
          {months.map((m) => (
            <button
              key={m.value}
              data-active={selectedMonth === m.value}
              onClick={() => setSelectedMonth(m.value)}
              className={`snap-center px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                selectedMonth === m.value 
                  ? 'bg-white text-slate-900 shadow-md scale-105 ring-1 ring-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/60 backdrop-blur-md p-4 sm:p-5 rounded-[1.5rem] border border-white/50 shadow-sm flex items-center gap-3 sm:gap-4 group hover:bg-white/80 transition-all">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Income</p>
            <p className="text-sm sm:text-base font-bold text-emerald-600 truncate">
              +{formatCurrency(totalIncome)}
            </p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md p-4 sm:p-5 rounded-[1.5rem] border border-white/50 shadow-sm flex items-center gap-3 sm:gap-4 group hover:bg-white/80 transition-all">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 flex-shrink-0 group-hover:scale-110 transition-transform">
            <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expenses</p>
            <p className="text-sm sm:text-base font-bold text-rose-600 truncate">
              -{formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

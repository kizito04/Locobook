import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  X, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';

interface HistoryProps {
  transactions: Transaction[];
  categories: Category[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  filter: 'all' | 'income' | 'expense';
  setFilter: (filter: 'all' | 'income' | 'expense') => void;
  handleDeleteTransaction: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({
  transactions,
  categories,
  selectedDate,
  setSelectedDate,
  filter,
  setFilter,
  handleDeleteTransaction
}) => {
  const filteredTransactions = transactions.filter(t => {
    const txDate = t.date.toDate().toISOString().split('T')[0];
    const matchesDate = selectedDate ? txDate === selectedDate : true;
    const matchesType = filter === 'all' ? true : t.type === filter;
    return matchesDate && matchesType;
  });

  // Group by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  filteredTransactions.forEach(tx => {
    const date = tx.date.toDate();
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (date.toDateString() === today.toDateString()) dateKey = 'TODAY, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    else if (date.toDateString() === yesterday.toDateString()) dateKey = 'YESTERDAY, ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    else dateKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();

    if (!groupedTransactions[dateKey]) groupedTransactions[dateKey] = [];
    groupedTransactions[dateKey].push(tx);
  });

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Top Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-full border border-slate-100 flex-1">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all ${filter === type ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <button 
            className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-slate-900 transition-all"
            onClick={() => (document.getElementById('date-picker') as HTMLInputElement)?.showPicker()}
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
          <input 
            id="date-picker"
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
          />
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate('')} 
              className="absolute -top-1 -right-1 bg-slate-900 text-white rounded-full p-0.5 border border-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-[1.5rem] p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">AI INSIGHT</p>
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            Your spending on "Dining Out" is 15% lower than last month. Keep it up!
          </p>
        </div>
      </div>

      {/* Transactions Grouped by Date */}
      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {Object.keys(groupedTransactions).length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No transactions found</p>
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date} className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2">{date}</h3>
                <div className="space-y-3">
                  {txs.map((tx) => (
                    <motion.div 
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500">
                          {(() => {
                            const cat = categories.find(c => c.name.toLowerCase() === tx.category?.toLowerCase());
                            return cat ? <CategoryIcon iconName={cat.icon} className="w-6 h-6" /> : (tx.type === 'income' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />);
                          })()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-base truncate">{tx.description}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-0.5">
                            <span>{tx.date.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span>{tx.category || 'General'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-base font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                        {tx.category && (
                          <div className="bg-blue-50 text-blue-600 text-[8px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-tighter">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            AI CATEGORIZED
                          </div>
                        )}
                        <button 
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

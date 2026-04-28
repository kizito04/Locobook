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
  // Group by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  transactions.forEach(tx => {
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
      className="space-y-5 sm:space-y-6"
    >
      {/* Top Filters */}
      <div className="flex items-center gap-3 w-full">
        <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-100 flex-1 min-w-0">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex-1 py-1.5 sm:py-2 px-2 sm:px-4 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${filter === type ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative flex-shrink-0">
          <button 
            className="p-2.5 sm:p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center"
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
          {selectedDate && selectedDate !== new Date().toISOString().split('T')[0] && (
            <button 
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} 
              className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white rounded-full p-1 border-2 border-white shadow-sm flex items-center justify-center"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>


      {/* AI Insight Card */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-[1.25rem] sm:rounded-[1.5rem] p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-500 shadow-sm flex-shrink-0">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1">
          <p className="text-[8px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5 sm:mb-1">AI INSIGHT</p>
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            Your spending on "Dining Out" is 15% lower than last month. Keep it up!
          </p>
        </div>
      </div>

      {/* Transactions Grouped by Date */}
      <div className="space-y-6 sm:space-y-8">
        <AnimatePresence mode="popLayout">
          {Object.keys(groupedTransactions).length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-dashed border-slate-200">
              <CalendarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mx-auto mb-3 sm:mb-4" />
              <p className="text-xs sm:text-sm text-slate-400 font-medium">No transactions found</p>
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date} className="space-y-3 sm:space-y-4">
                <h3 className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2">{date}</h3>
                <div className="space-y-2.5 sm:space-y-3">
                  {txs.map((tx) => (
                    <motion.div 
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-white p-3 sm:p-4 rounded-[1.25rem] sm:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all overflow-hidden"

                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-500 flex-shrink-0">
                          {(() => {
                            const cat = categories.find(c => c.name.toLowerCase() === tx.category?.toLowerCase());
                            return cat ? <CategoryIcon iconName={cat.icon} className="w-5 h-5 sm:w-6 sm:h-6" /> : (tx.type === 'income' ? <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />);
                          })()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">{tx.description}</h4>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">
                            <span>{tx.date.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="truncate">{tx.category || 'General'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-sm sm:text-base font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                        {tx.category && (
                          <div className="bg-blue-50 text-blue-600 text-[7px] sm:text-[8px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-tighter">
                            <CheckCircle2 className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                            AI CATEGORIZED
                          </div>
                        )}
                        <button 
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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

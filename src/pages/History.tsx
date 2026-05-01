import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  X,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Edit2
} from 'lucide-react';
import { Transaction, Category, ViewType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';
import { MonthSelector } from '../components/MonthSelector';

interface HistoryProps {
  transactions: Transaction[];
  categories: Category[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  filter: 'all' | 'income' | 'expense';
  setFilter: (filter: 'all' | 'income' | 'expense') => void;
  handleDeleteTransaction: (id: string) => void;
  handleEditTransaction: (tx: Transaction) => void;
  setCurrentView: (view: ViewType) => void;
  totalIncome: number;
  totalExpenses: number;
}

export const History: React.FC<HistoryProps> = ({
  transactions,
  categories,
  selectedDate,
  setSelectedDate,
  selectedMonth,
  setSelectedMonth,
  filter,
  setFilter,
  handleDeleteTransaction,
  handleEditTransaction,
  setCurrentView,
  totalIncome,
  totalExpenses
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
      {/* Month & Summary Section */}
      <MonthSelector
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
      />

      {/* Action Filters (Type & Date) */}
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-100 flex-1 min-w-0">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex-1 py-1.5 sm:py-2 px-1.5 sm:px-4 rounded-full text-[9px] sm:text-xs font-bold transition-all whitespace-nowrap ${filter === type ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative flex-shrink-0">
          <button
            className="p-2 sm:p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-slate-900 transition-all flex items-center justify-center"
            onClick={() => (document.getElementById('date-picker') as HTMLInputElement)?.showPicker()}
          >
            <CalendarIcon className="w-4.5 h-4.5 sm:w-5 h-5" />
          </button>
          <input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              const newDate = e.target.value;
              setSelectedDate(newDate);
              if (newDate) {
                setSelectedMonth(newDate.slice(0, 7));
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
          />

          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white rounded-full p-1 border-2 border-white shadow-sm flex items-center justify-center"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Transactions Grouped by Date */}
      <div className="space-y-6 sm:space-y-8">
        <AnimatePresence mode="popLayout">
          {Object.keys(groupedTransactions).length === 0 ? (
            <div className="text-center py-12 sm:py-20 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-dashed border-slate-200">
              <CalendarIcon className="w-8 h-8 sm:w-12 sm:h-12 text-slate-200 mx-auto mb-2 sm:mb-4" />
              <p className="text-[10px] sm:text-sm text-slate-400 font-medium">No transactions found</p>
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date} className="space-y-2.5 sm:space-y-4">
                <h3 className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2">{date}</h3>
                <div className="space-y-2 sm:space-y-3">
                  {txs.map((tx) => (
                    <motion.div
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-white p-2 sm:p-4 rounded-[1rem] sm:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all overflow-hidden"
                    >
                      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                        <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {(() => {
                            const cat = categories.find(c => c.name.toLowerCase() === tx.category?.toLowerCase());
                            return cat ? <CategoryIcon iconName={cat.icon} className="w-4 h-4 sm:w-7 sm:h-7" /> : (tx.type === 'income' ? <TrendingUp className="w-4 h-4 sm:w-7 sm:h-7" /> : <TrendingDown className="w-4 h-4 sm:w-7 sm:h-7" />);
                          })()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 text-[11px] sm:text-base truncate leading-tight">{tx.description}</h4>
                          <div className="flex items-center gap-1.5 text-[8px] sm:text-xs text-slate-400 font-medium mt-0.5">
                            <span>{tx.date.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                            {tx.category && (
                              <>
                                <span>•</span>
                                <span className="truncate">{tx.category}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0 ml-2">
                        <span className={`text-[11px] sm:text-lg font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                        {tx.category && (
                          <div className="text-emerald-500">
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                        )}
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleEditTransaction(tx)}
                            className="p-1 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-3 sm:w-4 h-3 sm:h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this transaction?')) {
                                handleDeleteTransaction(tx.id);
                              }
                            }}
                            className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => setCurrentView('dashboard')}
        className="fixed bottom-28 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-white text-sm font-semibold shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add transaction
      </button>
    </motion.div>
  );
};

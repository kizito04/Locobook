import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Mic, 
  MicOff, 
  Loader2, 
  AlertCircle,
  Calendar as CalendarIcon,
  X,
  Trash2,
  Sparkles,
  Send,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';

interface DashboardProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  input: string;
  setInput: (input: string) => void;
  isInputFocused: boolean;
  setIsInputFocused: (focused: boolean) => void;
  isProcessing: boolean;
  isListening: boolean;
  toggleListening: () => void;
  handleAddTransaction: (e?: React.FormEvent) => void;
  error: string | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  filter: 'all' | 'income' | 'expense';
  setFilter: (filter: 'all' | 'income' | 'expense') => void;
  filteredTransactions: Transaction[];
  categories: Category[];
  handleDeleteTransaction: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  totalIncome,
  totalExpenses,
  input,
  setInput,
  isInputFocused,
  setIsInputFocused,
  isProcessing,
  isListening,
  toggleListening,
  handleAddTransaction,
  error,
  selectedDate,
  setSelectedDate,
  filter,
  setFilter,
  filteredTransactions,
  categories,
  handleDeleteTransaction
}) => {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10"
    >
      {/* Income & Expenses Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-600">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Income</span>
          </div>
          <h2 className="text-2xl font-bold text-emerald-600">
            {formatCurrency(totalIncome)}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-rose-600">
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Expenses</span>
          </div>
          <h2 className="text-2xl font-bold text-rose-600">
            {formatCurrency(totalExpenses)}
          </h2>
        </div>
      </div>

      {/* Add Transaction Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900">Add Transaction</h3>
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        
        <form onSubmit={handleAddTransaction} className="flex gap-3">
          <div className="relative flex-1">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder='Describe transaction...'
              className={`w-full bg-white border border-slate-200 rounded-2xl py-4 pl-6 pr-12 text-base focus:outline-none focus:border-indigo-500 transition-all shadow-sm ${isInputFocused ? 'ring-4 ring-indigo-50' : ''}`}
              disabled={isProcessing}
            />
            <button 
              type="button"
              onClick={toggleListening}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isListening ? 'text-rose-500 animate-pulse' : 'text-indigo-600 hover:bg-slate-50'}`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100 flex items-center justify-center min-w-[64px]"
          >
            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: '+ Recieved $200 from clinic', color: 'bg-emerald-50 text-emerald-700' },
            { label: '- Groceries $50', color: 'bg-rose-50 text-rose-700' }
          ].map((chip, i) => (
            <button 
              key={i}
              onClick={() => setInput(chip.label)}
              className={`px-4 py-2 rounded-full text-xs font-medium border border-slate-100 transition-all hover:border-slate-200 ${chip.color}`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900">Recent Activity</h3>
          <button className="text-blue-600 text-xs font-bold uppercase tracking-wider hover:underline">
            VIEW ALL
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No transactions found</p>
              </div>
            ) : (
              filteredTransactions.slice(0, 5).map((tx) => (
                <motion.div 
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {(() => {
                        const cat = categories.find(c => c.name.toLowerCase() === tx.category?.toLowerCase());
                        return cat ? <CategoryIcon iconName={cat.icon} className="w-7 h-7" /> : (tx.type === 'income' ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />);
                      })()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-lg truncate">{tx.description}</h4>
                      <p className="text-sm text-slate-400 font-medium">
                        {tx.date.toDate().toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    <button 
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

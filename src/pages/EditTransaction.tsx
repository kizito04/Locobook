import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Transaction, Category, ViewType } from '../types';
import { formatCurrency } from '../utils/formatters';

interface EditTransactionProps {
  editingTransaction: Transaction | null;
  categories: Category[];
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>;
  handleUpdateTransaction: (updatedTransaction: Transaction) => void;
}

export const EditTransaction: React.FC<EditTransactionProps> = ({
  editingTransaction,
  categories,
  setCurrentView,
  handleUpdateTransaction,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category || '');
    }
  }, [editingTransaction]);

  if (!editingTransaction) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 text-center">
        <p className="text-sm text-slate-500">No transaction selected for editing.</p>
        <button
          onClick={() => setCurrentView('history')}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to history
        </button>
      </div>
    );
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

    handleUpdateTransaction({
      ...editingTransaction,
      description: description.trim() || editingTransaction.description,
      amount: parsedAmount,
      type,
      category: category.trim() || undefined,
    });
  };

  return (
    <motion.div
      key="editTransaction"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('history')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Back</span>
        </button>
        <div>
          
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Edit Transaction</h1>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="Enter transaction description"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Amount</label>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">{type === 'income' ? '+' : '-'}</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="0.00"
              inputMode="decimal"
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">Current: {formatCurrency(editingTransaction.amount)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`rounded-3xl py-3 text-sm font-semibold transition ${type === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`rounded-3xl py-3 text-sm font-semibold transition ${type === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Expense
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
         
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            <Save className="w-4 h-4" />
            Save changes
          </button>
           <button
            type="button"
            onClick={() => setCurrentView('history')}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

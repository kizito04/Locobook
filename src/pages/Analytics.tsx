import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AnalyticsProps {
  transactions: Transaction[];
}

export const Analytics: React.FC<AnalyticsProps> = ({
  transactions,
}) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Group by category for charts
  const categories = Array.from(new Set(transactions.map(t => t.category || 'Uncategorized')));
  
  const expenseData = categories.map((cat, index) => ({
    name: cat,
    amount: transactions
      .filter(t => t.category === cat && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    color: ['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]
  })).filter(d => d.amount > 0).sort((a, b) => b.amount - a.amount);

  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Analytics</h2>
        <div className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Income</span>
          </div>
          <p className="text-sm sm:text-xl font-bold text-slate-900">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Spent</span>
          </div>
          <p className="text-sm sm:text-xl font-bold text-slate-900">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Income vs Expenses Donut */}
        <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold mb-6 sm:mb-8 text-slate-900">Distribution</h3>
          <div className="h-[200px] sm:h-[250px] relative">
            {totalIncome + totalExpenses > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Income', value: totalIncome },
                      { name: 'Expenses', value: totalExpenses }
                    ]}
                    innerRadius="65%"
                    outerRadius="90%"
                    paddingAngle={8}
                    dataKey="value"
                    cornerRadius={12}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f43f5e" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs sm:text-sm">
                No data available
              </div>
            )}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Savings</p>
              <p className="text-lg font-bold text-indigo-600">{Math.max(0, Math.round(savingsRate))}%</p>
            </div>
          </div>
        </div>

        {/* Top Spending Categories List */}
        <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-base sm:text-lg font-bold mb-6 text-slate-900">Top Categories</h3>
          <div className="flex-1 space-y-4">
            {expenseData.length > 0 ? (
              expenseData.slice(0, 5).map((item, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-700">{item.name}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.amount / totalExpenses) * 100}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                <TrendingDown className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs font-medium">No expense data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { MonthSelector } from '../components/MonthSelector';

interface AnalyticsProps {
  transactions: Transaction[];
}

const chartColors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e'];

const toLocalMonthKey = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
};

const parseLocalMonthKey = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return null;
  return new Date(year, month - 1, 1);
};

const addMonths = (date: Date, months: number) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

const buildCategoryData = (transactions: Transaction[], type: 'income' | 'expense') => {
  const totals = transactions
    .filter((tx) => tx.type === type)
    .reduce<Record<string, number>>((acc, tx) => {
      const category = tx.category || (type === 'income' ? 'Income' : 'Uncategorized');
      acc[category] = (acc[category] || 0) + tx.amount;
      return acc;
    }, {});

  return Object.entries(totals)
    .map(([name, amount], index) => ({
      name,
      amount,
      color: chartColors[index % chartColors.length]
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
};

export const Analytics: React.FC<AnalyticsProps> = ({
  transactions,
}) => {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(() => toLocalMonthKey(new Date()));
  const [topCategoryType, setTopCategoryType] = React.useState<'income' | 'expense'>('expense');

  const selectedMonthStart = parseLocalMonthKey(selectedMonth);
  const selectedMonthEnd = selectedMonthStart ? addMonths(selectedMonthStart, 1) : null;

  const monthlyTransactions = transactions.filter((tx) => {
    if (!selectedMonthStart || !selectedMonthEnd) return true;
    const txDate = tx.date.toDate();
    return txDate >= selectedMonthStart && txDate < selectedMonthEnd;
  });

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeData = buildCategoryData(monthlyTransactions, 'income');
  const expenseData = buildCategoryData(monthlyTransactions, 'expense');
  const topCategoryData = topCategoryType === 'income' ? incomeData : expenseData;
  const topCategoryTotal = topCategoryType === 'income' ? totalIncome : totalExpenses;

  const renderCategoryPie = (
    title: string,
    data: ReturnType<typeof buildCategoryData>,
    total: number,
    emptyIcon: React.ElementType,
    emptyText: string
  ) => {
    const EmptyIcon = emptyIcon;

    return (
      <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs font-bold text-slate-400">{formatCurrency(total)}</p>
        </div>

        <div className="h-[220px] sm:h-[260px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="88%"
                  paddingAngle={5}
                  cornerRadius={10}
                >
                  {data.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => formatCurrency(Number(value) || 0)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <EmptyIcon className="mb-2 h-8 w-8 opacity-20" />
              <p className="text-xs font-medium">{emptyText}</p>
            </div>
          )}
        </div>

        {data.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {data.slice(0, 4).map((item) => (
              <div key={item.name} className="flex min-w-0 items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate font-semibold text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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

      <MonthSelector
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {renderCategoryPie('Income', incomeData, totalIncome, TrendingUp, 'No income data yet')}
        {renderCategoryPie('Expenses', expenseData, totalExpenses, TrendingDown, 'No expense data yet')}
      </div>

      <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Top Categories</h3>
          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
            {(['income', 'expense'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTopCategoryType(type)}
                className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                  topCategoryType === type
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type === 'income' ? 'Income' : 'Expenses'}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {topCategoryData.length > 0 ? (
            topCategoryData.slice(0, 5).map((item) => (
              <div key={item.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <span className="font-bold text-slate-700 truncate">{item.name}</span>
                  <span className="font-bold text-slate-900 whitespace-nowrap">{formatCurrency(item.amount)}</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${topCategoryTotal > 0 ? (item.amount / topCategoryTotal) * 100 : 0}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 py-10">
              {topCategoryType === 'income' ? (
                <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
              ) : (
                <TrendingDown className="w-8 h-8 mb-2 opacity-20" />
              )}
              <p className="text-xs font-medium">No {topCategoryType} data yet</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

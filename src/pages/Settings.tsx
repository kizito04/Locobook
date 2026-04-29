import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, UserCircle, LogOut, Tags, Trash2, ChevronRight } from 'lucide-react';
import { User } from 'firebase/auth';
import { Category, ViewType } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';

interface SettingsProps {
  user: User;
  onLogout: () => void;
  categories: Category[];
  handleDeleteCategory: (id: string) => void;
  setCurrentView: (view: ViewType) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  user,
  onLogout,
  categories,
  handleDeleteCategory,
  setCurrentView
}) => {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Settings</h2>
        <div className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        </div>
      </div>



      {/* Category Management Link */}
      <div 
        onClick={() => setCurrentView('categories')}
        className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-100 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Tags className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Categories</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Manage your spending categories</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Appearance & Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3 sm:space-y-4">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Currency</p>
          <select className="w-full bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100" defaultValue="UGX">
            <option value="UGX">UGX (Shs)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3 sm:space-y-4">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Appearance</p>
          <div className="flex gap-2 p-1 bg-slate-50 rounded-xl sm:rounded-2xl">
            <button className="flex-1 bg-white border border-slate-100 text-indigo-600 rounded-lg sm:rounded-xl py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold shadow-sm">Light</button>
            <button className="flex-1 text-slate-400 rounded-lg sm:rounded-xl py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold opacity-50 cursor-not-allowed">Dark</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

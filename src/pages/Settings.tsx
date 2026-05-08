import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronRight,
  ShieldAlert,
  Moon,
  ArrowLeft
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ViewType } from '../types';
import { ThemeSelector } from '../components/ThemeSelector';

interface SettingsProps {
  user: User;
  onLogout: () => void;
  handleDeleteAccountData: () => Promise<void>;
  setCurrentView: (view: ViewType) => void;
  theme: string;
  setTheme: (theme: string) => void;
}

const renderRow = (
  title: string,
  Icon: React.ElementType,
  value?: string
) => (
  <div className="flex w-full items-center justify-between gap-3 px-4 py-3">
    <div className="flex min-w-0 items-center gap-4">
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm shadow-amber-50">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">{title}</h3>
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-3">
      {value && <span className="text-xs font-bold text-slate-400">{value}</span>}
      <ChevronRight className="h-4 w-4 text-slate-300" />
    </div>
  </div>
);

export const Settings: React.FC<SettingsProps> = ({
  user,
  onLogout,
  handleDeleteAccountData,
  setCurrentView,
  theme,
  setTheme
}) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const deleteAccountData = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account data? This action cannot be undone.');
    if (!confirmed) return;

    await handleDeleteAccountData();
  };

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="min-h-screen bg-slate-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">Settings</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-2xl space-y-8">
          
          <section className="space-y-4">
            <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Preferences</p>

            <button
              type="button"
              onClick={() => setIsThemeOpen(true)}
              className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 active:scale-[0.99]"
            >
              {renderRow('App Theme', Moon, theme)}
            </button>
          </section>

          <section className="space-y-4">
            <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Security & Privacy</p>

            <button
              type="button"
              onClick={deleteAccountData}
              className="flex w-full items-center justify-between rounded-2xl border border-rose-100 bg-white p-4 shadow-sm transition hover:bg-rose-50/30 group"
            >
              <div className="flex items-center gap-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition-colors group-hover:bg-rose-100">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-rose-600 text-sm sm:text-base">Delete account data</p>
                  <p className="text-[10px] text-rose-400 font-medium">Permanently clear all records</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-rose-200 transition-transform group-hover:translate-x-0.5" />
            </button>
          </section>

          <div className="pt-8 text-center space-y-2">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Locobook v1.0.0</p>
            <p className="text-[10px] text-slate-400 font-medium max-w-[200px] mx-auto opacity-60 leading-relaxed">
              Designed to help you manage your finances with ease and clarity.
            </p>
          </div>
        </div>
      </div>

      <ThemeSelector 
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentTheme={theme}
        onSelect={(newTheme) => setTheme(newTheme)}
      />
    </motion.div>
  );
};


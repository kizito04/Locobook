import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronRight,
  Languages,
  LogOut,
  Moon,
  Palette,
  Settings as SettingsIcon,
  ShieldAlert,
  Tags,
  TextCursorInput,
  UserCircle,
  X
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Category, ViewType } from '../types';

interface SettingsProps {
  user: User;
  onLogout: () => void;
  categories: Category[];
  handleDeleteAccountData: () => Promise<void>;
  setCurrentView: (view: ViewType) => void;
}

const renderRow = (
  title: string,
  open: boolean,
  Icon: React.ElementType,
  value?: string
) => (
  <div className="flex w-full items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3">
      <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
        <Icon className="h-3 w-3" />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {value && <span className="hidden text-xs font-semibold text-slate-400 sm:inline">{value}</span>}
      <ChevronRight className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
    </div>
  </div>
);

export const Settings: React.FC<SettingsProps> = ({
  user,
  onLogout,
  categories,
  handleDeleteAccountData,
  setCurrentView
}) => {
  const [openSection, setOpenSection] = useState<'theme' | 'textSize' | 'language' | null>(null);
  const [theme, setTheme] = useState('System default');
  const [textSize, setTextSize] = useState('Default');
  const [language, setLanguage] = useState('System default');

  const toggleSection = (section: 'theme' | 'textSize' | 'language') => {
    setOpenSection(openSection === section ? null : section);
  };

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
      className="min-h-screen bg-slate-100 px-5 py-3"
    >
      <div className="mx-auto max-w-2xl">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="absolute left-0 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
            aria-label="Close settings"
          >
            <X className="h-3 w-3" />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          {/* <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-amber-600 shadow-sm">
            <SettingsIcon className="h-3 w-3" />
          </div> */}
        </div>

        {/* <div className="mt-4 flex flex-col items-center gap-2 text-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-slate-500 shadow-sm">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserCircle className="h-10 w-10" />
            )}
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">{user.displayName || 'Locobook User'}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div> */}

        <div className="mt-8 space-y-3">
          <section className="space-y-2">
            <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Preferences</p>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => toggleSection('theme')}
                className="flex w-full items-center justify-between px-4 py-2 text-left transition hover:bg-slate-50"
              >
                {renderRow('Theme', openSection === 'theme', Moon, theme)}
              </button>
              {openSection === 'theme' && (
                <div className="space-y-2 border-t border-slate-100 px-4 pb-4 pt-3">
                  {['System default', 'Light', 'Dark'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTheme(option)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${theme === option ? 'bg-amber-100 font-semibold text-amber-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => toggleSection('textSize')}
                className="flex w-full items-center justify-between px-4 py-2 text-left transition hover:bg-slate-50"
              >
                {renderRow('Text size', openSection === 'textSize', TextCursorInput, textSize)}
              </button>
              {openSection === 'textSize' && (
                <div className="space-y-2 border-t border-slate-100 px-4 pb-4 pt-3">
                  {['Small', 'Default', 'Large'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTextSize(option)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${textSize === option ? 'bg-amber-100 font-semibold text-amber-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => toggleSection('language')}
                className="flex w-full items-center justify-between px-4 py-2 text-left transition hover:bg-slate-50"
              >
                {renderRow('Language', openSection === 'language', Languages, language)}
              </button>
              {openSection === 'language' && (
                <div className="space-y-2 border-t border-slate-100 px-4 pb-4 pt-3">
                  {['System default', 'English', 'French', 'Spanish'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLanguage(option)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${language === option ? 'bg-amber-100 font-semibold text-amber-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

        

          <section className="space-y-2">
            <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Account</p>

            <button
              type="button"
              onClick={deleteAccountData}
              className="flex w-full items-center justify-between rounded-xl border border-rose-200 bg-white px-4 py-2 text-left shadow-sm transition hover:bg-rose-50"
            >
              <div className="flex items-center gap-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <ShieldAlert className="h-3 w-3" />
                </div>
                <div>
                  <p className="font-semibold text-rose-600">Delete account data</p>
                  {/* <p className="text-[11px] text-rose-400">Permanently remove your saved data</p> */}
                </div>
              </div>
              <ChevronRight className="h-3 w-3 text-rose-300" />
            </button>

            {/* <button
              type="button"
              onClick={onLogout}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-100"
            >
              <LogOut className="h-2.5 w-2.5" />
              Log out
            </button> */}
          </section>
        </div>
      </div>
    </motion.div>
  );
};

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronRight,
  Languages,
  LogOut,
  Moon,
  Settings as SettingsIcon,
  ShieldAlert,
  TextCursorInput,
  UserCircle,
  X
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ViewType } from '../types';

interface SettingsProps {
  user: User;
  onLogout: () => void;
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

const themeOptions = ['System default', 'Light', 'Dark'] as const;
const textSizeOptions = ['Small', 'Default', 'Large'] as const;
const languageOptions = ['System default', 'English', 'French', 'Spanish'] as const;

type ThemeOption = typeof themeOptions[number];
type TextSizeOption = typeof textSizeOptions[number];
type LanguageOption = typeof languageOptions[number];

const getStoredPreference = <T extends string>(key: string, fallback: T) => {
  if (typeof window === 'undefined') return fallback;
  return (window.localStorage.getItem(key) as T | null) || fallback;
};

const applyThemePreference = (preference: ThemeOption) => {
  if (typeof window === 'undefined') return;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldUseDark = preference === 'Dark' || (preference === 'System default' && prefersDark);
  document.documentElement.classList.toggle('locobook-dark', shouldUseDark);
  window.localStorage.setItem('locobook-theme', preference);
};

const applyTextSizePreference = (preference: TextSizeOption) => {
  if (typeof window === 'undefined') return;

  document.documentElement.classList.remove('locobook-text-small', 'locobook-text-large');
  if (preference === 'Small') document.documentElement.classList.add('locobook-text-small');
  if (preference === 'Large') document.documentElement.classList.add('locobook-text-large');
  window.localStorage.setItem('locobook-text-size', preference);
};

export const Settings: React.FC<SettingsProps> = ({
  user,
  onLogout,
  handleDeleteAccountData,
  setCurrentView
}) => {
  const [openSection, setOpenSection] = useState<'theme' | 'textSize' | 'language' | null>(null);
  const [theme, setTheme] = useState<ThemeOption>(() => getStoredPreference('locobook-theme', 'System default'));
  const [textSize, setTextSize] = useState<TextSizeOption>(() => getStoredPreference('locobook-text-size', 'Default'));
  const [language, setLanguage] = useState<LanguageOption>(() => getStoredPreference('locobook-language', 'System default'));

  useEffect(() => {
    applyThemePreference(theme);
    applyTextSizePreference(textSize);
  }, []);

  const toggleSection = (section: 'theme' | 'textSize' | 'language') => {
    setOpenSection(openSection === section ? null : section);
  };

  const deleteAccountData = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account data? This action cannot be undone.');
    if (!confirmed) return;

    await handleDeleteAccountData();
  };

  const selectTheme = (option: ThemeOption) => {
    setTheme(option);
    applyThemePreference(option);
    setOpenSection(null);
  };

  const selectTextSize = (option: TextSizeOption) => {
    setTextSize(option);
    applyTextSizePreference(option);
    setOpenSection(null);
  };

  const selectLanguage = (option: LanguageOption) => {
    setLanguage(option);
    window.localStorage.setItem('locobook-language', option);
    setOpenSection(null);
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
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
            aria-label="Close settings"
          >
            <X className="h-3 w-3" />
          </button>
          <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-amber-600 shadow-sm">
            <SettingsIcon className="h-3 w-3" />
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2 text-center">
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
        </div>

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
                  {themeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectTheme(option)}
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
                  {textSizeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectTextSize(option)}
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
                  {languageOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectLanguage(option)}
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
                </div>
              </div>
              <ChevronRight className="h-3 w-3 text-rose-300" />
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-100"
            >
              <LogOut className="h-2.5 w-2.5" />
              Log out
            </button>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, ChevronRight } from 'lucide-react';
import { User } from 'firebase/auth';
import { Category, ViewType } from '../types';

interface SettingsProps {
  user: User;
  onLogout: () => void;
  categories: Category[];
  handleDeleteCategory: (id: string) => void;
  handleDeleteAccountData: () => Promise<void>;
  setCurrentView: (view: ViewType) => void;
}

const renderRow = (title: string, subtitle: string, open: boolean) => (
  <div className="flex items-center justify-between gap-3 w-full">
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>
    </div>
    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`} />
  </div>
);

export const Settings: React.FC<SettingsProps> = ({
  user,
  onLogout,
  categories,
  handleDeleteCategory,
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
      className="space-y-6 sm:space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Settings</h2>
        <div className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        <div className="py-3">
          <button
            type="button"
            onClick={() => toggleSection('theme')}
            className="w-full text-left"
          >
            {renderRow(`Theme: ${theme}`, 'App appearance mode', openSection === 'theme')}
          </button>
          {openSection === 'theme' && (
            <div className="space-y-2 border-l border-slate-200 pl-4 pt-3 pb-4">
              {['System default', 'Light', 'Dark'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTheme(option)}
                  className={`w-full text-left text-sm ${theme === option ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="py-3">
          <button
            type="button"
            onClick={() => toggleSection('textSize')}
            className="w-full text-left"
          >
            {renderRow(`Text size: ${textSize}`, 'Font scaling preference', openSection === 'textSize')}
          </button>
          {openSection === 'textSize' && (
            <div className="space-y-2 border-l border-slate-200 pl-4 pt-3 pb-4">
              {['Small', 'Default', 'Large'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTextSize(option)}
                  className={`w-full text-left text-sm ${textSize === option ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="py-3">
          <button
            type="button"
            onClick={() => toggleSection('language')}
            className="w-full text-left"
          >
            {renderRow(`Language: ${language}`, 'Preferred app language', openSection === 'language')}
          </button>
          {openSection === 'language' && (
            <div className="space-y-2 border-l border-slate-200 pl-4 pt-3 pb-4">
              {['System default', 'English', 'French', 'Spanish'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguage(option)}
                  className={`w-full text-left text-sm ${language === option ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-6">
        <button
          type="button"
          onClick={deleteAccountData}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
        >
          Delete account data
        </button>
      </div>
    </motion.div>
  );
};

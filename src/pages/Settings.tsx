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
  setCurrentView
}) => {
  const [openSection, setOpenSection] = useState<'theme' | 'textSize' | 'language' | null>(null);
  const [theme, setTheme] = useState('System default');
  const [textSize, setTextSize] = useState('Default');
  const [language, setLanguage] = useState('System default');

  const toggleSection = (section: 'theme' | 'textSize' | 'language') => {
    setOpenSection(openSection === section ? null : section);
  };

  const deleteAccountData = () => {
    const confirmed = window.confirm('Are you sure you want to delete your account data? This action cannot be undone.');
    if (confirmed) {
      console.log('Account data deletion confirmed');
      // Add account data deletion logic here if needed
    }
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

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('theme')}
          className="w-full text-left text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
        >
          Theme: {theme}
        </button>
        {openSection === 'theme' && (
          <div className="space-y-1 px-2">
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

        <button
          type="button"
          onClick={() => toggleSection('textSize')}
          className="w-full text-left text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
        >
          Text size: {textSize}
        </button>
        {openSection === 'textSize' && (
          <div className="space-y-1 px-2">
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

        <button
          type="button"
          onClick={() => toggleSection('language')}
          className="w-full text-left text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
        >
          Language: {language}
        </button>
        {openSection === 'language' && (
          <div className="space-y-1 px-2">
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

      <div className="pt-4">
        <button
          type="button"
          onClick={deleteAccountData}
          className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
        >
          Delete account data
        </button>
      </div>
    </motion.div>
  );
};

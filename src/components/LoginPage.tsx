import React from 'react';
import { motion } from 'motion/react';
import { Wallet, UserCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 text-center border border-slate-100"
      >
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-200">
          <Wallet className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Locobook AI</h1>
        <p className="text-slate-500 mb-10 text-lg leading-relaxed">
          Your personal AI accounting assistant. Track income and expenses using natural language.
        </p>

        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          <UserCircle className="w-5 h-5" />
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
};

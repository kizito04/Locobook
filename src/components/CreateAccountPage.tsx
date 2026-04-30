import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, Eye, EyeOff } from 'lucide-react';

interface CreateAccountPageProps {
  onBackToLogin: () => void;
}

export const CreateAccountPage: React.FC<CreateAccountPageProps> = ({ onBackToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add sign-up logic here
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6" style={{ background: 'radial-gradient(circle at top, rgba(148, 163, 184, 0.16), transparent 35%), linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="max-w-lg w-full bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-lg border border-slate-200/80 p-6 sm:p-8"
      >
        <div className="mb-5 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">Create a free account to start using Locobook AI.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="confirm password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded-[1.75rem] bg-slate-900 py-4 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Create account
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button type="button" onClick={onBackToLogin} className="font-medium text-slate-900 hover:text-slate-700">
            Sign in
          </button>
        </div>
      </motion.div>
    </div>
  );
};

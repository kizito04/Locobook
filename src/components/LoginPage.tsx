import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        <p className="text-slate-500 mb-8 text-lg leading-relaxed">
          Your personal accounting assistant.
        </p>

        <form className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Sign in
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-slate-400">
          <span className="flex-1 h-px bg-slate-200" />
          <span className="text-xs uppercase tracking-[0.3em]">or</span>
          <span className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white py-4 px-6 text-sm font-semibold text-slate-900 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none">
              <path d="M21.35 11.1h-9.35v2.8h5.35c-.25 1.45-1.2 2.65-2.55 3.45v2.85h4.1c2.4-2.2 3.8-5.45 3.8-9.05 0-.6-.05-1.2-.15-1.8z" fill="#4285F4" />
              <path d="M12 22c2.7 0 4.95-.9 6.6-2.45l-4.1-2.85c-1.1.75-2.5 1.2-4.5 1.2-3.45 0-6.35-2.35-7.4-5.55H0v3.5C1.6 19.95 6.35 22 12 22z" fill="#34A853" />
              <path d="M4.6 13.15c-.25-.75-.4-1.55-.4-2.35 0-.8.15-1.6.4-2.35V4.95H0C-.5 6.55-1 8.45-1 10.8c0 2.35.5 4.25 1.5 5.85l3.1-3.5z" fill="#FBBC05" />
              <path d="M12 4.5c1.45 0 2.75.5 3.75 1.45l2.8-2.8C16.95 1.65 14.7 1 12 1 6.35 1 1.6 3.05 0 4.95l3.1 3.5C5.65 6.85 8.55 4.5 12 4.5z" fill="#EA4335" />
            </svg>
          </span>
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
};

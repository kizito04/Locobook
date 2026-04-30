import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import googleIcon from '../assets/images/googleicon.png';
import locologo from '../assets/images/Locologo.png';

interface LoginPageProps {
  onLogin: () => void;
  onCreateAccount: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onCreateAccount }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add email/password sign-in logic here
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6" style={{ background: 'radial-gradient(circle at top, rgba(148, 163, 184, 0.16), transparent 35%), linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="max-w-xl w-full bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-lg border border-slate-200/80 p-6 sm:p-8"
      >
        <div className="mb-5 text-center">
          <div className="mx-auto mb-2 flex flex-col items-center justify-center">
            <img src={locologo} alt="Locobook logo" className="h-32 w-32 object-contain" />
            
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
        </div>

        <button
          onClick={onLogin}
          className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2 px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
        >
          <img src={googleIcon} alt="Google icon" className="h-5 w-5" />
          Sign in with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-slate-400 text-xs">
          <span className="flex-1 h-px bg-slate-200" />
          <span>Or sign in with a registered account</span>
          <span className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-5 py-2.5 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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

          <div className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{'    '}
            <button type="button" onClick={onCreateAccount} className="font-medium text-slate-900 hover:text-slate-700">
              Create Account
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-sm"
          >
            Sign in
          </button>

          <div className="pt-3 text-center">
            <button type="button" className="text-sm font-medium text-slate-500 hover:text-slate-700">
              Forgot password?
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

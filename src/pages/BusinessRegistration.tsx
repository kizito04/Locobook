import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  ChevronLeft, 
  Plus, 
  X, 
  Save, 
  Info,
  Tag,
  Sparkles
} from 'lucide-react';
import { ViewType } from '../types';

interface BusinessRegistrationProps {
  setCurrentView: (view: ViewType) => void;
  handleAddBusiness: (name: string, description: string, categories: string[]) => Promise<void>;
}

export const BusinessRegistration: React.FC<BusinessRegistrationProps> = ({ 
  setCurrentView, 
  handleAddBusiness 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await handleAddBusiness(name.trim(), description.trim(), []);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentView('businessHub')}
          className="p-2 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Register Business</h2>
          <p className="text-xs text-slate-500 font-medium">Create a separate space for your business</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <Building2 className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Business Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Business Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kizito's General Store"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this business does..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!name.trim() || isSubmitting}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Register Business
            </>
          )}
        </button>
      </form>

      {/* Info Card */}
      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0" />
        <p className="text-[11px] text-blue-700 leading-relaxed">
          <strong>Tip:</strong> Once registered, you can switch between your personal finances and this business using the "Manage Business" button on your dashboard.
        </p>
      </div>
    </motion.div>
  );
};

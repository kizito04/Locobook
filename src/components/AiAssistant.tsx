import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface AiAssistantProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  messages: ChatMessage[];
  input: string;
  setInput: (input: string) => void;
  isTyping: boolean;
  onSubmit: (e: React.FormEvent) => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  isOpen,
  setIsOpen,
  messages,
  input,
  setInput,
  isTyping,
  onSubmit,
  chatEndRef
}) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center shadow-indigo-300 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Sparkles className="w-8 h-8 relative z-10" />
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/25"
            />
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="relative flex h-[58dvh] min-h-[420px] w-full flex-col overflow-hidden rounded-t-[2rem] border-t border-slate-200 bg-white shadow-[0_-18px_45px_-18px_rgba(15,23,42,0.45)]"
            >
              {/* Chat Header */}
              <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Locobook Assistant</h3>
                    <p className="text-xs text-indigo-100">AI Powered Financial Help</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-white text-slate-700 rounded-tl-none shadow-sm border border-slate-100'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={onSubmit} className="p-4 bg-white border-t border-slate-100 flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.currentTarget.style.height = 'auto';
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                  }}
                  placeholder="Ask a question..."
                  rows={1}
                  className="max-h-32 min-h-[48px] flex-1 resize-none overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-indigo-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="h-12 w-12 shrink-0 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 inline-flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

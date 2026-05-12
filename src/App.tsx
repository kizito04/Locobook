import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { EditTransaction } from './pages/EditTransaction';
import { BusinessRegistration } from './pages/BusinessRegistration';
import { BusinessHub } from './pages/BusinessHub';
import { LoginPage } from './components/LoginPage';
import { CreateAccountPage } from './components/CreateAccountPage';
import { useLocobook } from './hooks/useLocobook';
import { Loader2, X, Send, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
  const {
    user,
    loading,
    currentView,
    setCurrentView,
    totalIncome,
    totalExpenses,
    input,
    setInput,
    isInputFocused,
    setIsInputFocused,
    isProcessing,
    isListening,
    toggleListening,
    handleAddTransaction,
    error,
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
    filter,
    setFilter,
    transactions,
    filteredTransactions,
    handleDeleteTransaction,
    handleDeleteAccountData,
    searchTerm,
    setSearchTerm,
    isSearchVisible,
    toggleSearch,
    handleLogin,
    handleLogout,
    handleEditTransactionSelection,
    handleUpdateTransaction,
    editingTransaction,
    isAssistantOpen,
    setIsAssistantOpen,
    assistantInput,
    setAssistantInput,
    assistantMessages,
    isAssistantTyping,
    handleAssistantSubmit,
    currency,
    setCurrency,
    businesses,
    activeBusinessId,
    setActiveBusinessId,
    handleAddBusiness,
    handleUpdateBusiness,
    handleDeleteBusiness,
    activeBusiness
  } = useLocobook();

  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isSettingsView = currentView === 'settings';

  const [theme, setTheme] = useState(() => window.localStorage.getItem('locobook-theme') || 'System default');

  useEffect(() => {
    window.localStorage.setItem('locobook-theme', theme);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    document.documentElement.classList.toggle(
      'locobook-dark',
      theme === 'Dark' || (theme === 'System default' && prefersDark)
    );
  }, [theme]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    if (isAssistantOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isAssistantOpen]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assistantMessages]);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return authPage === 'login' ? (
      <LoginPage onLogin={handleLogin} onCreateAccount={() => setAuthPage('signup')} />
    ) : (
      <CreateAccountPage onBackToLogin={() => setAuthPage('login')} />
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans ${isSettingsView ? '' : 'pb-36 sm:pb-40'}`}>


      {!isSettingsView && (
        <Header
          user={user}
          transactions={transactions}
          onLogout={handleLogout}
          isSearchVisible={isSearchVisible}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          toggleSearch={toggleSearch}
          setIsAssistantOpen={setIsAssistantOpen}
          setCurrentView={setCurrentView}
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
          currency={currency}
          setCurrency={setCurrency}
          activeBusinessName={activeBusiness?.name || null}
        />
      )}


      <main className={isSettingsView ? 'min-h-screen' : 'max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8'}>


        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <Dashboard
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              input={input}
              setInput={setInput}
              isInputFocused={isInputFocused}
              setIsInputFocused={setIsInputFocused}
              isProcessing={isProcessing}
              isListening={isListening}
              toggleListening={toggleListening}
              handleAddTransaction={handleAddTransaction}
              error={error}
              filteredTransactions={filteredTransactions}
              setCurrentView={setCurrentView}
              currency={currency}
              activeBusinessName={activeBusiness?.name || null}
            />

          )}

          {currentView === 'businessHub' && (
            <BusinessHub 
              businesses={businesses}
              activeBusinessId={activeBusinessId}
              setActiveBusinessId={setActiveBusinessId}
              setCurrentView={setCurrentView}
              handleUpdateBusiness={handleUpdateBusiness}
              handleDeleteBusiness={handleDeleteBusiness}
            />
          )}

          {currentView === 'businessRegistration' && (
            <BusinessRegistration 
              setCurrentView={setCurrentView}
              handleAddBusiness={handleAddBusiness}
            />
          )}

          {currentView === 'history' && (
            <History
              transactions={filteredTransactions}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              filter={filter}
              setFilter={setFilter}
              handleDeleteTransaction={handleDeleteTransaction}
              handleEditTransaction={handleEditTransactionSelection}
              setCurrentView={setCurrentView}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              currency={currency}
            />
          )}

          {currentView === 'editTransaction' && (
            <EditTransaction
              editingTransaction={editingTransaction}
              setCurrentView={setCurrentView}
              handleUpdateTransaction={handleUpdateTransaction}
              currency={currency}
            />
          )}

          {currentView === 'analytics' && (
            <Analytics transactions={transactions} currency={currency} />
          )}

          {currentView === 'settings' && (
            <Settings
              user={user}
              onLogout={handleLogout}
              handleDeleteAccountData={handleDeleteAccountData}
              setCurrentView={setCurrentView}
              theme={theme}
              setTheme={setTheme}
            />
          )}
        </AnimatePresence>
      </main>

      {!isProfileOpen && !isSettingsView && <BottomNav currentView={currentView} setCurrentView={setCurrentView} />}

      <AnimatePresence>
        {isAssistantOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssistantOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-900/25"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-0 bottom-0 z-[70] flex h-auto max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[1.5rem] border-t border-slate-200 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]"
            >
              {/* Chat Header */}
              <div className="shrink-0 relative flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Sparkles className="w-4 h-4 fill-blue-600" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">Loco AI Assistant</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssistantOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-6 space-y-8">
                {assistantMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[90%] whitespace-pre-wrap break-words text-sm leading-relaxed ${message.role === 'assistant'
                        ? 'text-slate-700 font-medium'
                        : 'bg-blue-50 text-blue-800 px-4 py-2.5 rounded-lg rounded-tr-sm border border-blue-100 shadow-sm'
                        }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="flex gap-3">
                          <div className="shrink-0 mt-1">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            {message.content.replace(/\*\*/g, '').replace(/\*/g, '')}
                          </div>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                ))}
                {isAssistantTyping && assistantMessages[assistantMessages.length - 1]?.content === '' && (
                  <div className="flex gap-3 text-slate-400">
                    <Sparkles className="w-4 h-4 animate-pulse text-blue-300 mt-1" />
                    <span className="text-xs font-medium italic">Assistant is thinking...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleAssistantSubmit} className="shrink-0 border-t border-slate-100 bg-white p-4">
                <div className="flex items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                  <textarea
                    value={assistantInput}
                    onChange={(e) => {
                      setAssistantInput(e.target.value);
                      e.currentTarget.style.height = 'auto';
                      e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                    }}
                    placeholder="Ask Loco anything..."
                    rows={1}
                    className="max-h-32 min-h-[40px] flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2 text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!assistantInput.trim() || isAssistantTyping}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-40 disabled:shadow-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

import React from 'react';
import { AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { useLocobook } from './hooks/useLocobook';
import { Loader2, Wallet, UserCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const {
    user,
    loading,
    currentView,
    setCurrentView,
    totalIncome,
    totalExpenses,
    balance,
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
    filter,
    setFilter,
    filteredTransactions,
    searchTerm,
    setSearchTerm,
    isSearchVisible,
    toggleSearch,
    handleLogin,
    handleLogout
  } = useLocobook();


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <UserCircle className="w-5 h-5" />
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-28 sm:pb-32">
      <Header 
        user={user} 
        isSearchVisible={isSearchVisible}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        toggleSearch={toggleSearch}
      />


      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <Dashboard 
              balance={balance}
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
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              filter={filter}
              setFilter={setFilter}
              filteredTransactions={filteredTransactions}
              categories={categories}

              handleDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentView === 'history' && (
            <History 
              transactions={filteredTransactions}
              categories={categories}

              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              filter={filter}
              setFilter={setFilter}
              handleDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentView === 'analytics' && (
            <Analytics transactions={transactions} />
          )}

          {currentView === 'settings' && (
            <Settings 
              user={user} 
              onLogout={handleLogout}
              categories={categories}
              handleDeleteCategory={handleDeleteCategory}

            />
          )}
        </AnimatePresence>
      </main>

      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

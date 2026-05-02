import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { CategoriesView } from './pages/CategoriesView';
import { EditTransaction } from './pages/EditTransaction';
import { AddCategoryModal } from './components/AddCategoryModal';
import { EditCategoryModal } from './components/EditCategoryModal';
import { LoginPage } from './components/LoginPage';
import { CreateAccountPage } from './components/CreateAccountPage';
import { useLocobook } from './hooks/useLocobook';
import { Loader2, X, Send } from 'lucide-react';
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
    selectedMonth,
    setSelectedMonth,
    filter,
    setFilter,
    transactions,
    categories,
    filteredTransactions,
    handleDeleteTransaction,
    handleDeleteAccountData,
    searchTerm,
    setSearchTerm,
    isSearchVisible,
    toggleSearch,
    handleLogin,
    handleLogout,
    handleAddCategory,
    handleEditCategory,
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
    newCategoryName,
    setNewCategoryName,
    selectedIcon,
    setSelectedIcon,
    colorFill,
    setColorFill,
    iconColor,
    setIconColor,
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    isEditCategoryModalOpen,
    setIsEditCategoryModalOpen,
    editingCategory,
    setEditingCategory
  } = useLocobook();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isSettingsView = currentView === 'settings';

  useEffect(() => {
    const themePreference = window.localStorage.getItem('locobook-theme') || 'System default';
    const textSizePreference = window.localStorage.getItem('locobook-text-size') || 'Default';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    document.documentElement.classList.toggle(
      'locobook-dark',
      themePreference === 'Dark' || (themePreference === 'System default' && prefersDark)
    );

    document.documentElement.classList.remove('locobook-text-small', 'locobook-text-large');
    if (textSizePreference === 'Small') document.documentElement.classList.add('locobook-text-small');
    if (textSizePreference === 'Large') document.documentElement.classList.add('locobook-text-large');
  }, []);



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
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden ${isSettingsView ? '' : 'pb-36 sm:pb-40'}`}>


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
        />
      )}


      <main className={isSettingsView ? 'min-h-screen' : 'max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8'}>


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
              setCurrentView={setCurrentView}
            />

          )}

          {currentView === 'history' && (
            <History 
              transactions={filteredTransactions}
              categories={categories}
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
            />
          )}

          {currentView === 'editTransaction' && (
            <EditTransaction
              editingTransaction={editingTransaction}
              categories={categories}
              setCurrentView={setCurrentView}
              handleUpdateTransaction={handleUpdateTransaction}
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
              handleDeleteAccountData={handleDeleteAccountData}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'categories' && (
            <CategoriesView 
              categories={categories}
              setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
              setEditingCategory={setEditingCategory}
              setIsEditCategoryModalOpen={setIsEditCategoryModalOpen}
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
              className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 top-20 z-50 mx-auto flex max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
            >
              <div className="shrink-0 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400 font-bold">AI Chat</div>
                  <h2 className="text-lg font-semibold text-slate-900">Ask your Locobook assistant</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssistantOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-5 py-4 space-y-3">
                {assistantMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`max-w-[86%] whitespace-pre-wrap break-words rounded-3xl px-4 py-3 text-sm leading-relaxed ${message.role === 'assistant' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'ml-auto bg-indigo-600 text-white'}`}
                  >
                    {message.content}
                  </div>
                ))}
                {isAssistantTyping && (
                  <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-500">Typing...</div>
                )}
              </div>
              <form onSubmit={handleAssistantSubmit} className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-end gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                  <textarea
                    value={assistantInput}
                    onChange={(e) => {
                      setAssistantInput(e.target.value);
                      e.currentTarget.style.height = 'auto';
                      e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                    }}
                    placeholder="Ask about your transactions, balance, or categories..."
                    rows={1}
                    className="max-h-32 min-h-[44px] flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2 text-sm leading-relaxed text-slate-900 placeholder-slate-400 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!assistantInput.trim() || isAssistantTyping}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AddCategoryModal 
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSubmit={handleAddCategory}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        selectedIcon={selectedIcon}
        setSelectedIcon={setSelectedIcon}
        colorFill={colorFill}
        setColorFill={setColorFill}
        iconColor={iconColor}
        setIconColor={setIconColor}
      />

      <EditCategoryModal 
        isOpen={isEditCategoryModalOpen}
        onClose={() => {
          setIsEditCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleEditCategory}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        selectedIcon={selectedIcon}
        setSelectedIcon={setSelectedIcon}
        colorFill={colorFill}
        setColorFill={setColorFill}
        iconColor={iconColor}
        setIconColor={setIconColor}
      />
    </div>
  );
}

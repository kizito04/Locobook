import React, { useState } from 'react';
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
    handleDeleteCategory,
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-36 sm:pb-40 overflow-x-hidden">


      <Header 
        user={user} 
        transactions={transactions}
        onLogout={handleLogout}
        isSearchVisible={isSearchVisible}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        toggleSearch={toggleSearch}
        setIsAssistantOpen={setIsAssistantOpen}
      />


      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">


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
              handleDeleteCategory={handleDeleteCategory}
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

      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />

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
              className="fixed inset-x-4 bottom-4 top-20 z-50 mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
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
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto px-5 py-4 space-y-3">
                {assistantMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-3xl px-4 py-3 text-sm ${message.role === 'assistant' ? 'bg-slate-100 text-slate-900 self-start' : 'bg-indigo-600 text-white self-end'}`}
                  >
                    {message.content}
                  </div>
                ))}
                {isAssistantTyping && (
                  <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-500">Typing...</div>
                )}
              </div>
              <form onSubmit={handleAssistantSubmit} className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <input
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    placeholder="Ask about your transactions, balance, or categories..."
                    className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all"
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

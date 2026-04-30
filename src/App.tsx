import React from 'react';
import { AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { CategoriesView } from './pages/CategoriesView';
import { AddCategoryModal } from './components/AddCategoryModal';
import { EditCategoryModal } from './components/EditCategoryModal';
import { LoginPage } from './components/LoginPage';
import { useLocobook } from './hooks/useLocobook';
import { Loader2 } from 'lucide-react';
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
    setEditingCategory,
    setIsAssistantOpen
  } = useLocobook();




  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-36 sm:pb-40 overflow-x-hidden">


      <Header 
        user={user} 
        onLogout={handleLogout}
        isSearchVisible={isSearchVisible}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        toggleSearch={toggleSearch}
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
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
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

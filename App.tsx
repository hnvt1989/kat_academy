
import React, { useState, useCallback } from 'react';
import { View, Category } from './types';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import { CloseIcon } from './components/icons';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const handleSelectCategory = useCallback((category: Category) => {
    setActiveCategory(category);
    setCurrentView(View.DETAIL);
    window.scrollTo(0, 0); // Scroll to top on view change
  }, []);

  const handleCloseDetail = useCallback(() => {
    setCurrentView(View.HOME);
    setActiveCategory(null);
    window.scrollTo(0, 0);
  }, []);

  const handleNavigateHome = useCallback(() => {
    setCurrentView(View.HOME);
    setActiveCategory(null);
    window.scrollTo(0,0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-brand-charcoal font-sans antialiased">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <Header onNavigateHome={handleNavigateHome} />
        </div>
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl relative">
        {currentView === View.DETAIL && (
          <button
            onClick={handleCloseDetail}
            className="absolute top-4 right-4 md:top-0 md:right-0 z-20 bg-gray-700 hover:bg-gray-900 text-white rounded-full p-3 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            aria-label="Close detail view"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        )}

        {currentView === View.HOME && <HomePage onSelectCategory={handleSelectCategory} />}
        {currentView === View.DETAIL && activeCategory && (
          <DetailPage category={activeCategory} onSelectCategory={handleSelectCategory} />
        )}
      </main>
      <footer className="text-center py-8 text-gray-500 text-sm border-t border-gray-200 bg-white mt-12">
        <p>&copy; {new Date().getFullYear()} KidZone. All rights reserved.</p>
        <p>Illustrations and images are for demonstrative purposes.</p>
      </footer>
    </div>
  );
};

export default App;

import React, { useState, useCallback, useEffect } from 'react';
import { Category } from './types';
import { CATEGORIES_DATA } from './constants';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import ReadingPage from './pages/ReadingPage';
import { CloseIcon } from './components/icons';

type ViewType = 'home' | 'detail' | 'reading';

const App: React.FC = () => {
  const getViewFromPath = (path: string): ViewType => {
    if (path.startsWith('/category/')) {
      const categoryId = path.split('/')[2];
      return categoryId === 'reading' ? 'reading' : 'detail';
    }
    return 'home';
  };

  const getCategoryFromPath = (path: string): Category | null => {
    if (path.startsWith('/category/')) {
      const categoryId = path.split('/')[2];
      return CATEGORIES_DATA.find(cat => cat.id === categoryId) || null;
    }
    return null;
  };

  const [currentView, setCurrentView] = useState<ViewType>(() => getViewFromPath(window.location.pathname));
  const [activeCategory, setActiveCategory] = useState<Category | null>(() => getCategoryFromPath(window.location.pathname));

  // Effect to handle initial path and browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentView(getViewFromPath(path));
      setActiveCategory(getCategoryFromPath(path));
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleSelectCategory = useCallback((category: Category) => {
    if (category.id === 'reading') {
      setCurrentView('reading');
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
      setCurrentView('detail');
    }
    window.history.pushState({}, '', `/category/${category.id}`);
    window.scrollTo(0, 0);
  }, []);

  const handleNavigateHome = useCallback(() => {
    setCurrentView('home');
    setActiveCategory(null);
    window.history.pushState({}, '', '/');
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-brand-charcoal font-sans antialiased">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6 sm:px-8 lg:px-10 max-w-8xl">
          <Header onNavigateHome={handleNavigateHome} />
        </div>
      </div>
      
      <main className="container mx-auto px-6 sm:px-8 lg:px-10 py-12 max-w-7xl relative">
        {(currentView === 'detail' || currentView === 'reading') && (
          <button
            onClick={handleNavigateHome}
            className="absolute top-6 right-6 md:top-2 md:right-2 z-20 bg-gray-700 hover:bg-gray-900 text-white rounded-full p-4 shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-gray-400"
            aria-label="Close detail view"
          >
            <CloseIcon className="w-8 h-8" />
          </button>
        )}

        {currentView === 'home' && <HomePage onSelectCategory={handleSelectCategory} />}
        {currentView === 'detail' && activeCategory && (
          <DetailPage category={activeCategory} />
        )}
        {currentView === 'reading' && <ReadingPage />}
      </main>
      
      <footer className="text-center py-10 text-gray-500 text-base md:text-lg border-t border-gray-200 bg-white mt-16">
        <p>&copy; {new Date().getFullYear()} KidZone. All rights reserved.</p>
        <p>Illustrations and images are for demonstrative purposes.</p>
      </footer>
    </div>
  );
};

export default App;

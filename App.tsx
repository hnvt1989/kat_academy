import React, { useState, useCallback, useEffect } from 'react';
import { View, Category } from './types';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import LeilaPage from './pages/LeilaPage';
import { CloseIcon } from './components/icons';

const App: React.FC = () => {
  const getViewFromPath = (path: string): View => {
    if (path.startsWith('/category/')) return View.DETAIL;
    return View.HOME;
  };

  const [currentView, setCurrentView] = useState<View>(() => getViewFromPath(window.location.pathname));
  const [activeCategory, setActiveCategory] = useState<Category | null>(() => {
    const path = window.location.pathname;
    if (path === '/category/leila') {
      return {
        id: 'leila',
        title: 'Leila the E-Sheep',
        description: 'Chat with Leila the sheep',
        imageUrl: '/leila-icon.png',
        bgColorClass: 'bg-blue-500',
        detail: {
          pageTitle: 'Chat with Leila',
          subtitle: 'Your friendly e-learning companion',
          mainImage: '/leila-large.png',
          imageDescription: 'Image of Leila the sheep'
        }
      };
    }
    // Potentially restore other categories based on path if needed, or set to null
    return null;
  });

  // Effect to handle initial path and browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentView(getViewFromPath(path));
      if (path.startsWith('/category/')) {
        const categoryId = path.split('/')[2];
        if (categoryId === 'leila') {
          setActiveCategory({
            id: 'leila',
            title: 'Leila the E-Sheep',
            description: 'Chat with Leila the sheep',
            imageUrl: '/leila-icon.png',
            bgColorClass: 'bg-blue-500',
            detail: {
              pageTitle: 'Chat with Leila',
              subtitle: 'Your friendly e-learning companion',
              mainImage: '/leila-large.png',
              imageDescription: 'Image of Leila the sheep'
            }
          });
        } else {
          // setActiveCategory(null); // Or find the category by ID
        }
      } else {
        setActiveCategory(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleSelectCategory = useCallback((category: Category) => {
    setActiveCategory(category);
    setCurrentView(View.DETAIL);
    window.history.pushState({}, '', `/category/${category.id}`);
    window.scrollTo(0, 0);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setCurrentView(View.HOME);
    setActiveCategory(null);
    window.history.pushState({}, '', '/');
    window.scrollTo(0, 0);
  }, []);

  const handleNavigateHome = useCallback(() => {
    setCurrentView(View.HOME);
    setActiveCategory(null);
    window.history.pushState({}, '', '/');
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

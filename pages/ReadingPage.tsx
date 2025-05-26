import React, { useState, useEffect } from 'react';
import { ChildrenBook, BookPage } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const ReadingPage: React.FC = () => {
  const [books, setBooks] = useState<ChildrenBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<ChildrenBook | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Load books from JSON file
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await fetch('/assets/children_books.json');
        if (!response.ok) {
          throw new Error('Failed to load books');
        }
        const booksData: ChildrenBook[] = await response.json();
        setBooks(booksData);
        if (booksData.length > 0) {
          setSelectedBook(booksData[0]);
        }
      } catch (err) {
        setError('Failed to load books. Please try again.');
        console.error('Error loading books:', err);
      } finally {
        setIsLoadingBooks(false);
      }
    };

    loadBooks();
  }, []);

  // Generate image for current page
  const generateImageForPage = async (page: BookPage, bookTitle: string, pageIndex: number) => {
    const imageKey = `${bookTitle}-${pageIndex}`;
    
    if (generatedImages[imageKey]) {
      return generatedImages[imageKey];
    }

    setIsGeneratingImage(true);
    try {
      // Try the production API first
      const response = await fetch('/api/category/reading/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: page.illustration
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImages(prev => ({
          ...prev,
          [imageKey]: data.imageUrl
        }));
        return data.imageUrl;
      } else {
        // Fallback for development - use a placeholder image service
        throw new Error('API not available, using fallback');
      }
    } catch (err) {
      console.log('API not available, using placeholder image for development');
      
      // Development fallback: use a placeholder image service
      // This creates a unique placeholder based on the book and page
      const seed = encodeURIComponent(`${bookTitle}-${pageIndex}`);
      const placeholderUrl = `https://picsum.photos/seed/${seed}/400/300`;
      
      setGeneratedImages(prev => ({
        ...prev,
        [imageKey]: placeholderUrl
      }));
      
      return placeholderUrl;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Handle book selection
  const handleBookSelect = (book: ChildrenBook) => {
    setSelectedBook(book);
    setCurrentPageIndex(0);
    setError(null);
  };

  // Navigation functions
  const goToNextPage = () => {
    if (selectedBook && currentPageIndex < selectedBook.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  // Get current page
  const getCurrentPage = (): BookPage | null => {
    if (!selectedBook || !selectedBook.pages[currentPageIndex]) {
      return null;
    }
    return selectedBook.pages[currentPageIndex];
  };

  // Generate image when page changes
  useEffect(() => {
    const currentPage = getCurrentPage();
    if (currentPage && selectedBook) {
      generateImageForPage(currentPage, selectedBook.title, currentPageIndex);
    }
  }, [currentPageIndex, selectedBook]);

  if (isLoadingBooks) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
        <span className="ml-4 text-gray-600">Loading books...</span>
      </div>
    );
  }

  const currentPage = getCurrentPage();
  const currentImageKey = selectedBook ? `${selectedBook.title}-${currentPageIndex}` : '';
  const currentImage = generatedImages[currentImageKey];

  return (
    <div className="bg-white rounded-lg shadow-xl flex h-[calc(100vh-180px)] max-h-[700px] w-full overflow-hidden">
      {/* Left sidebar - Book list */}
      <div className="w-1/3 bg-slate-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-brand-charcoal">Choose a Book</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {books.map((book, index) => (
            <button
              key={index}
              onClick={() => handleBookSelect(book)}
              className={`w-full p-4 text-left border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                selectedBook?.title === book.title ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <h3 className="font-semibold text-brand-charcoal text-lg">{book.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{book.pages.length} pages</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right content - Book viewer */}
      <div className="flex-1 flex flex-col">
        {selectedBook ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-slate-50">
              <h1 className="text-2xl font-bold text-brand-charcoal">{selectedBook.title}</h1>
              <p className="text-sm text-gray-600">
                Page {currentPageIndex + 1} of {selectedBook.pages.length}
              </p>
            </div>

            {/* Book content */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
              {currentPage && (
                <>
                  {/* Illustration area */}
                  <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-6 relative">
                    {isGeneratingImage ? (
                      <div className="flex flex-col items-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600">Generating illustration...</p>
                      </div>
                    ) : currentImage ? (
                      <img
                        src={currentImage}
                        alt={currentPage.illustration}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-gray-600">{currentPage.illustration}</p>
                        <button
                          onClick={() => generateImageForPage(currentPage, selectedBook.title, currentPageIndex)}
                          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Generate Illustration
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Story text */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <p className="text-lg leading-relaxed text-brand-charcoal font-medium">
                      {currentPage.text}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Navigation controls */}
            <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-between items-center">
              <button
                onClick={goToPreviousPage}
                disabled={currentPageIndex === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentPageIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                ← Previous
              </button>

              <div className="flex space-x-1">
                {selectedBook.pages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentPageIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNextPage}
                disabled={!selectedBook || currentPageIndex >= selectedBook.pages.length - 1}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  !selectedBook || currentPageIndex >= selectedBook.pages.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Next →
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📖</div>
              <p className="text-xl text-gray-600">Select a book to start reading!</p>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute top-1 right-1 text-red-700 hover:text-red-900 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ReadingPage; 
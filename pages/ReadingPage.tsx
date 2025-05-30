import React, { useState, useEffect, useRef } from 'react';
import { ChildrenBook, BookPage } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const ReadingPage: React.FC = () => {
  const [books, setBooks] = useState<ChildrenBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<ChildrenBook | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // Text-to-speech function
  const speakText = async (text: string) => {
    if (isPlaying) return;

    setIsPlaying(true);
    
    // Stop current audio if playing
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    try {
      // Use the existing TTS API endpoint at 60% speed for younger readers
      const response = await fetch("/category/leila/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, speed: 0.6 })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        
        return new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(url);
            setIsPlaying(false);
            resolve();
          };
          
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            console.error('Audio playback error');
            setIsPlaying(false);
            reject(new Error('Audio playback failed'));
          };
          
          audio.play().catch(reject);
        });
      } else {
        throw new Error("Server TTS not available");
      }
    } catch (error) {
      console.log("Server TTS failed, falling back to Web Speech API:", error);
      
      // Fallback to Web Speech API at 60% speed
      if ('speechSynthesis' in window) {
        return new Promise<void>((resolve, reject) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.6; // Slower speech rate
          utterance.pitch = 1.1;
          utterance.volume = 1;
          
          utterance.onend = () => {
            setIsPlaying(false);
            resolve();
          };
          
          utterance.onerror = () => {
            console.error('Web Speech API error');
            setIsPlaying(false);
            reject(new Error('Speech synthesis failed'));
          };
          
          speechSynthesis.speak(utterance);
        });
      } else {
        console.error("Speech synthesis not supported");
        setIsPlaying(false);
        throw new Error("Speech synthesis not supported");
      }
    }
  };

  const handleSpeakClick = () => {
    const currentPage = getCurrentPage();
    if (!currentPage) return;

    if (isPlaying) {
      // Stop current playback
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      // Start reading the text
      speakText(currentPage.text);
    }
  };

  // Check if illustration exists locally
  const checkLocalIllustration = async (bookTitle: string, pageIndex: number): Promise<string | null> => {
    try {
      const safeBookTitle = bookTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const filename = `${safeBookTitle}-page-${pageIndex}.jpg`;
      const localUrl = `/illustrations/${filename}`;
      
      // Test if the image exists by trying to load it
      const response = await fetch(localUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log(`Found local illustration: ${localUrl}`);
        return localUrl;
      }
    } catch (err) {
      console.log('Local illustration not found, using placeholder');
    }
    return null;
  };

  // Generate placeholder image URL
  const generatePlaceholderImage = (bookTitle: string, pageIndex: number, illustrationDescription: string): string => {
    const seed = encodeURIComponent(`${bookTitle.replace(/\s+/g, '-')}-page-${pageIndex}-${illustrationDescription.substring(0, 20)}`);
    const placeholderUrl = `https://picsum.photos/seed/${seed}/600/400`;
    console.log(`Generated placeholder URL: ${placeholderUrl}`);
    return placeholderUrl;
  };

  // Get image for a specific page (local first, then placeholder)
  const getPageImage = async (page: BookPage, bookTitle: string, pageIndex: number): Promise<string> => {
    console.log(`Getting image for: ${bookTitle} - Page ${pageIndex + 1} - ${page.illustration}`);
    
    // First, check if we have a local illustration
    const localUrl = await checkLocalIllustration(bookTitle, pageIndex);
    if (localUrl) {
      console.log(`Using local illustration for ${bookTitle} - Page ${pageIndex + 1}`);
      return localUrl;
    }

    // If no local illustration exists, use placeholder
    console.log(`Using placeholder image for ${bookTitle} - Page ${pageIndex + 1}`);
    return generatePlaceholderImage(bookTitle, pageIndex, page.illustration);
  };

  // Load all images for the selected book
  const loadAllImagesForBook = async (book: ChildrenBook) => {
    console.log(`Loading all images for book: ${book.title}`);
    setIsGeneratingImages(true);
    setError(null);
    
    try {
      const newImages: Record<string, string> = {};
      
      for (let index = 0; index < book.pages.length; index++) {
        const page = book.pages[index];
        const imageKey = `${book.title}-${index}`;
        
        // Skip if we already have this image
        if (generatedImages[imageKey]) {
          console.log(`Image already loaded for ${imageKey}, skipping`);
          newImages[imageKey] = generatedImages[imageKey];
          continue;
        }
        
        try {
          const imageUrl = await getPageImage(page, book.title, index);
          newImages[imageKey] = imageUrl;
          console.log(`Successfully loaded image for ${imageKey}`);
          
          // Update state immediately so user can see progress
          setGeneratedImages(prev => ({
            ...prev,
            [imageKey]: imageUrl
          }));
          
          // Small delay to avoid overwhelming the browser
          if (index < book.pages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (err) {
          console.error(`Failed to load image for ${imageKey}:`, err);
          // Continue with other images even if one fails
        }
      }
      
      console.log(`Completed loading images for ${book.title}`);
    } catch (err) {
      console.error('Error loading images:', err);
      setError('Failed to load some illustrations.');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // Handle book selection
  const handleBookSelect = (book: ChildrenBook) => {
    console.log(`Selecting book: ${book.title}`);
    
    // Stop any current audio when switching books
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    
    setSelectedBook(book);
    setCurrentPageIndex(0);
    setError(null);
    
    // Always trigger image loading for newly selected book
    // This ensures images are loaded even if the check fails
    console.log(`Checking if images exist for ${book.title}`);
    const hasAllImages = book.pages.every((_, index) => {
      const imageKey = `${book.title}-${index}`;
      const hasImage = generatedImages[imageKey];
      console.log(`Image ${imageKey}: ${hasImage ? 'exists' : 'missing'}`);
      return hasImage;
    });

    console.log(`Book ${book.title} has all images: ${hasAllImages}`);
    if (!hasAllImages) {
      console.log(`Loading images for ${book.title}`);
      loadAllImagesForBook(book);
    }
  };

  // Navigation functions
  const goToNextPage = () => {
    // Stop any current audio when navigating
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    
    if (selectedBook && currentPageIndex < selectedBook.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const goToPreviousPage = () => {
    // Stop any current audio when navigating
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    
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

  // Load images for first book when loaded
  useEffect(() => {
    if (selectedBook && books.length > 0) {
      const hasAllImages = selectedBook.pages.every((_, index) => {
        const imageKey = `${selectedBook.title}-${index}`;
        return generatedImages[imageKey];
      });

      if (!hasAllImages) {
        loadAllImagesForBook(selectedBook);
      }
    }
  }, [selectedBook, books]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

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
                {isGeneratingImages && <span className="ml-2 text-blue-600">• Loading illustrations...</span>}
              </p>
            </div>

            {/* Book content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {currentPage && (
                <div className="flex flex-row h-full gap-6">
                  {/* Illustration area - Left side */}
                  <div className="w-1/2 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg relative h-full">
                    {isGeneratingImages && !currentImage ? (
                      <div className="flex flex-col items-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600">Loading illustration...</p>
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
                        <p className="text-gray-600 mb-4">{currentPage.illustration}</p>
                        <button
                          onClick={() => loadAllImagesForBook(selectedBook)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                          disabled={isGeneratingImages}
                        >
                          {isGeneratingImages ? 'Loading...' : 'Reload Illustrations'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Story text with speaker button - Right side */}
                  <div className="w-1/2 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="text-lg leading-relaxed text-brand-charcoal font-medium">
                          {currentPage.text}
                        </p>
                      </div>
                      <button
                        onClick={handleSpeakClick}
                        disabled={!currentPage.text}
                        className={`
                          flex-shrink-0 w-12 h-12 rounded-full shadow-lg transition-all duration-200 transform active:scale-95
                          ${isPlaying 
                            ? 'bg-gradient-to-r from-orange-400 to-red-500 animate-pulse' 
                            : 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 hover:scale-110'
                          }
                          flex items-center justify-center group
                        `}
                        aria-label={isPlaying ? "Stop reading" : "Read text aloud"}
                      >
                        <svg 
                          className="w-6 h-6 text-white transition-transform group-hover:scale-110" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation controls */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-slate-50 flex justify-between items-center">
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
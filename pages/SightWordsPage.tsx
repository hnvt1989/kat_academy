import React, { useState, useEffect, useRef } from 'react';

interface SightWord {
  sight_word: string;
  sentence: string;
}

const SightWordsPage: React.FC = () => {
  const [sightWords, setSightWords] = useState<SightWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadSightWords();
  }, []);

  // Fisher-Yates shuffle algorithm to randomize array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadSightWords = async () => {
    try {
      const response = await fetch('/assets/meaningful_sight_words.json');
      if (!response.ok) {
        throw new Error('Failed to load sight words');
      }
      const data: SightWord[] = await response.json();
      // Randomize the order of sight words for varied learning experience
      const shuffledData = shuffleArray(data);
      setSightWords(shuffledData);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load sight words. Please try again.');
      setIsLoading(false);
    }
  };

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
            resolve();
          };
          
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            console.error('Audio playback error');
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
            resolve();
          };
          
          utterance.onerror = () => {
            console.error('Web Speech API error');
            reject(new Error('Speech synthesis failed'));
          };
          
          speechSynthesis.speak(utterance);
        });
      } else {
        console.error("Speech synthesis not supported");
        throw new Error("Speech synthesis not supported");
      }
    }
  };

  const speakWordAndSentence = async () => {
    if (!sightWords[currentIndex] || isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      // First, speak the sight word
      await speakText(sightWords[currentIndex].sight_word);
      
      // Wait 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Then speak the sentence
      await speakText(sightWords[currentIndex].sentence);
      
    } catch (error) {
      console.error('TTS sequence error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    // Stop any current audio when navigating
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    
    if (currentIndex < sightWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    // Stop any current audio when navigating
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMicClick = () => {
    if (isPlaying) {
      // Stop current playback
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    } else {
      // Start the word and sentence sequence
      speakWordAndSentence();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <p className="text-lg text-gray-600">Loading sight words...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500 text-xl">⚠️</div>
        <p className="text-lg text-red-600">{error}</p>
        <button 
          onClick={loadSightWords}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (sightWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-lg text-gray-600">No sight words available.</p>
      </div>
    );
  }

  const currentWord = sightWords[currentIndex];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-purple-600">Progress</span>
          <span className="text-sm font-medium text-purple-600">
            {currentIndex + 1} of {sightWords.length}
          </span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / sightWords.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-4 border-purple-200 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-yellow-300 rounded-full opacity-20 -translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-pink-300 rounded-full opacity-20 translate-x-8 translate-y-8"></div>
        <div className="absolute top-1/2 right-0 w-12 h-12 bg-blue-300 rounded-full opacity-20 translate-x-6"></div>
        
        <div className="relative z-10 text-center space-y-6">
          {/* Sight Word */}
          <div className="space-y-4">
            <h2 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 tracking-tight">
              {currentWord.sight_word}
            </h2>
            
            {/* Sentence */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
              <p className="text-2xl md:text-3xl text-gray-700 font-medium leading-relaxed">
                {currentWord.sentence}
              </p>
            </div>
          </div>

          {/* Microphone Button */}
          <div className="flex justify-center">
            <button
              onClick={handleMicClick}
              disabled={isPlaying}
              className={`
                w-20 h-20 rounded-full shadow-lg transition-all duration-200 transform active:scale-95
                ${isPlaying 
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 animate-pulse' 
                  : 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 hover:scale-110'
                }
                flex items-center justify-center group
              `}
              aria-label="Listen to word and sentence"
            >
              <svg 
                className="w-10 h-10 text-white transition-transform group-hover:scale-110" 
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

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`
            flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 transform active:scale-95
            ${currentIndex === 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105 shadow-lg'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Word</div>
          <div className="text-2xl font-bold text-purple-600">
            {currentIndex + 1}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === sightWords.length - 1}
          className={`
            flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 transform active:scale-95
            ${currentIndex === sightWords.length - 1 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105 shadow-lg'
            }
          `}
        >
          <span>Next</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Fun encouragement message */}
      <div className="text-center mt-8">
        <div className="inline-block bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full px-6 py-2 border-2 border-yellow-300">
          <p className="text-lg font-medium text-orange-800">
            🌟 Great job learning! Keep going! 🌟
          </p>
        </div>
      </div>
    </div>
  );
};

export default SightWordsPage; 
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus } from '../types';
import WordDisplay from '../components/WordDisplay';
import ScoreDisplay from '../components/ScoreDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import FeedbackMessage from '../components/FeedbackMessage';
import PhrasesUI from '../components/PhrasesUI';

// Helper: Cute animal SVG mascot
const Mascot: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className || "w-24 h-24 text-yellow-500"}>
    <path fill="currentColor" d="M50,10 C27.9,10 10,27.9 10,50 C10,72.1 27.9,90 50,90 C72.1,90 90,72.1 90,50 C90,27.9 72.1,10 50,10 Z M50,15 C69.3,15 85,30.7 85,50 C85,69.3 69.3,85 50,85 C30.7,85 15,69.3 15,50 C15,30.7 30.7,15 50,15 Z"/>
    <circle fill="black" cx="38" cy="42" r="5"/>
    <circle fill="black" cx="62" cy="42" r="5"/>
    <path fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" d="M40,60 Q50,70 60,60" />
    <path fill="pink" d="M45,25 Q50,15 55,25 L60,35 Q50,30 40,35 Z" />
    <path fill="pink" d="M55,25 Q50,15 45,25 L40,35 Q50,30 60,35 Z" transform="scale(-1,1) translate(-100,0)"/>
  </svg>
);

const TypingPage: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [typedWord, setTypedWord] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedPhaseSentences, setSelectedPhaseSentences] = useState<string[] | null>(null);
  const [currentSelectedPhase, setCurrentSelectedPhase] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const loadWords = useCallback(async () => {
    setError(null);
    setGameStatus(GameStatus.LOADING_WORDS);

    let fetchedTargets: string[] = [];

    if (selectedPhaseSentences && selectedPhaseSentences.length > 0) {
      fetchedTargets = selectedPhaseSentences.map(sentence => sentence.toLowerCase());
    } else {
      setError("Please select a learning phase to start.");
      setGameStatus(GameStatus.IDLE);
      return;
    }

    if (fetchedTargets.length === 0) {
      setError("No sentences found in the selected phase. Please select another phase.");
      setGameStatus(GameStatus.ERROR);
      return;
    }
    
    // Shuffle the sentences
    for (let i = fetchedTargets.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fetchedTargets[i], fetchedTargets[j]] = [fetchedTargets[j], fetchedTargets[i]];
    }

    setWords(fetchedTargets);
    setCurrentWordIndex(0);
    setScore(0);
    setTypedWord('');
    setGameStatus(GameStatus.PLAYING);
    setFeedback(null);
  }, [selectedPhaseSentences]);

  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStatus, currentWordIndex]);

  const handlePhaseSelect = (sentences: string[], phaseNumber: number) => {
    setSelectedPhaseSentences(sentences);
    setCurrentSelectedPhase(phaseNumber);
    setGameStatus(GameStatus.IDLE); 
  };

  useEffect(() => {
    if (gameStatus === GameStatus.IDLE && selectedPhaseSentences && currentSelectedPhase !== null) {
      loadWords();
    }
  }, [gameStatus, selectedPhaseSentences, currentSelectedPhase, loadWords]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (gameStatus !== GameStatus.PLAYING) return;
    
    const currentTargetWord = words[currentWordIndex];
    const newTypedWord = event.target.value;
    setTypedWord(newTypedWord);

    if (newTypedWord.toLowerCase() === currentTargetWord) {
      setScore(prevScore => prevScore + 1);
      setFeedback("Correct!");
      setGameStatus(GameStatus.WORD_COMPLETED);
      
      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(prevIndex => prevIndex + 1);
          setTypedWord('');
          setFeedback(null);
          setGameStatus(GameStatus.PLAYING);
        } else {
          setGameStatus(GameStatus.GAME_OVER);
          setFeedback("Great Job! All sentences typed!");
        }
      }, 1000);
    }
  };  

  const startGame = () => {
    loadWords();
  };

  const restartGame = () => {
    setGameStatus(GameStatus.IDLE);
    if (!selectedPhaseSentences) {
        setError("Please select a learning phase to start a new game.");
        setGameStatus(GameStatus.IDLE);
    } else {
        loadWords();
    }
  };

  const currentTargetWord = words[currentWordIndex] || "";

  const renderContent = () => {
    switch (gameStatus) {
      case GameStatus.LOADING_WORDS:
        return <LoadingSpinner message="Getting sentences..." />;
      case GameStatus.ERROR:
        return <ErrorDisplay message={error || "An error occurred."} onRetry={startGame} retryMessage={currentSelectedPhase ? "Try Again" : "Select Phase"} />;
      case GameStatus.IDLE:
        return (
          <div className="text-center">
            <Mascot className="w-32 h-32 mx-auto mb-6 text-yellow-500 drop-shadow-lg" />
            <h2 className="text-5xl font-bold text-indigo-700 mb-8">
              {currentSelectedPhase ? `Phase ${currentSelectedPhase} Selected` : 'KidType Challenge!'}
            </h2>
            <p className="text-xl text-slate-600 mb-10">
              {currentSelectedPhase 
                ? 'Ready to type the selected sentences?' 
                : error ? error : 'Please select a phase to begin.'
              }
            </p>
            {currentSelectedPhase && (
              <button
                onClick={startGame}
                className="px-10 py-4 bg-green-500 text-white text-2xl font-semibold rounded-xl shadow-lg hover:bg-green-600 transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                Start Typing!
              </button>
            )}
            {!currentSelectedPhase && error && (
                 <p className="text-red-500 mt-4">{error}</p>
            )}
          </div>
        );
      case GameStatus.PLAYING:
      case GameStatus.WORD_COMPLETED:
        return (
          <>
            <ScoreDisplay score={score} />
            <WordDisplay targetWord={currentTargetWord} typedWord={typedWord} isCompleted={gameStatus === GameStatus.WORD_COMPLETED} />
            <input
              ref={inputRef}
              type="text"
              value={typedWord}
              onChange={handleInputChange}
              className="w-full max-w-md p-4 text-2xl border-2 border-purple-300 rounded-lg shadow-inner focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition caret-[transparent]"
              style={{ caretColor: 'transparent' }}
              placeholder="Type the sentence here..."
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              disabled={gameStatus === GameStatus.WORD_COMPLETED}
            />
            <p className="mt-4 text-sm text-slate-500">
              Sentences remaining: 
              {words.length - currentWordIndex - (gameStatus === GameStatus.WORD_COMPLETED ? 0 : 1)}
            </p>
          </>
        );
      case GameStatus.GAME_OVER:
        return (
          <div className="text-center">
             <Mascot className="w-32 h-32 mx-auto mb-6 text-green-500 drop-shadow-lg" />
            <h2 className="text-4xl font-bold text-indigo-700 mb-6">Awesome Typing!</h2>
            <p className="text-2xl text-slate-600 mb-4">Your final score is:</p>
            <p className="text-6xl font-bold text-pink-500 mb-10">{score}</p>
            <button
              onClick={restartGame}
              className="px-10 py-4 bg-blue-500 text-white text-2xl font-semibold rounded-xl shadow-lg hover:bg-blue-600 transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Play Again With Same Phase?
            </button>
            <button
              onClick={() => {
                setSelectedPhaseSentences(null);
                setCurrentSelectedPhase(null);
                setGameStatus(GameStatus.IDLE);
                setError("Please select a new learning phase.");
              }}
              className="mt-4 px-10 py-4 bg-orange-500 text-white text-2xl font-semibold rounded-xl shadow-lg hover:bg-orange-600 transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300"
            >
              Choose Different Phase
            </button>
          </div>
        );
      default:
        return <p>Unknown game state.</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <header className="mb-8">
        <h1 className="text-6xl font-extrabold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
            KidType Challenge
          </span>
        </h1>
      </header>
      <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto gap-6">
        <PhrasesUI onPhaseSelect={handlePhaseSelect} currentPhase={currentSelectedPhase} />
        <main className="w-full md:flex-grow p-6 sm:p-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl flex flex-col items-center justify-center min-h-[400px]">
          {renderContent()}
        </main>
      </div>
      <FeedbackMessage message={feedback} type={gameStatus === GameStatus.GAME_OVER || gameStatus === GameStatus.WORD_COMPLETED ? 'success' : 'info'} />
      <footer className="mt-12 text-sm text-slate-600">
        <p>&copy; {new Date().getFullYear()} KidType Games</p>
      </footer>
    </div>
  );
};

export default TypingPage; 
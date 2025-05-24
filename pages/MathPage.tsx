import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, MathProblem } from '../types';
import MathProblemDisplay from '../components/MathProblemDisplay';
import ScoreDisplay from '../components/ScoreDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import FeedbackMessage from '../components/FeedbackMessage';
import MathPhasesUI from '../components/MathPhasesUI';
import MathVisualization from '../components/MathVisualization';
import SmileyIcon from '../components/SmileyIcon';

const MathPage: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [allProblems, setAllProblems] = useState<MathProblem[]>([]);
  const [problemsInPhase, setProblemsInPhase] = useState<MathProblem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedProblemIds, setSelectedProblemIds] = useState<number[] | null>(null);
  const [currentSelectedPhase, setCurrentSelectedPhase] = useState<number | null>(null);
  const [showVisualization, setShowVisualization] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load all problems from JSON file
  useEffect(() => {
    const fetchProblems = async () => {
      setGameStatus(GameStatus.LOADING_WORDS);
      try {
        const response = await fetch('/mathProblems.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllProblems(data);
        setGameStatus(GameStatus.IDLE);
      } catch (e) {
        console.error("Failed to load math problems:", e);
        setError(`Couldn't load the math problems. Please try refreshing the page.`);
        setGameStatus(GameStatus.ERROR);
      }
    };
    fetchProblems();
  }, []);

  const loadProblems = useCallback(() => {
    setError(null);
    setGameStatus(GameStatus.LOADING_WORDS);

    if (!selectedProblemIds || selectedProblemIds.length === 0) {
      setError("Please select a learning phase to start.");
      setGameStatus(GameStatus.IDLE);
      return;
    }

    if (allProblems.length === 0) {
      setError("Math problems are still loading. Please wait.");
      setGameStatus(GameStatus.ERROR);
      return;
    }

    const phaseProblems = selectedProblemIds
      .map(id => allProblems.find(p => p.id === id))
      .filter(p => p !== undefined) as MathProblem[];

    if (phaseProblems.length === 0) {
      setError("No problems found for the selected phase. Please select another phase.");
      setGameStatus(GameStatus.ERROR);
      return;
    }

    // Shuffle the problems
    for (let i = phaseProblems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [phaseProblems[i], phaseProblems[j]] = [phaseProblems[j], phaseProblems[i]];
    }

    setProblemsInPhase(phaseProblems);
    setCurrentProblemIndex(0);
    setScore(0);
    setUserAnswer('');
    setGameStatus(GameStatus.PLAYING);
    setFeedback(null);
    setShowVisualization(false);
    setIsAnswerCorrect(null);
  }, [selectedProblemIds, allProblems]);

  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStatus, currentProblemIndex]);

  const handlePhaseSelect = (problemIds: number[], phaseNumber: number) => {
    setSelectedProblemIds(problemIds);
    setCurrentSelectedPhase(phaseNumber);
    setGameStatus(GameStatus.IDLE);
  };

  useEffect(() => {
    if (gameStatus === GameStatus.IDLE && selectedProblemIds && currentSelectedPhase !== null && allProblems.length > 0) {
      loadProblems();
    }
  }, [gameStatus, selectedProblemIds, currentSelectedPhase, allProblems, loadProblems]);

  const handleAnswerSubmit = useCallback(() => {
    const currentProblem = problemsInPhase[currentProblemIndex];
    if (!currentProblem || userAnswer.trim() === '') return;

    const answer = parseInt(userAnswer, 10);
    if (isNaN(answer)) {
      setFeedback("Please enter a number!");
      setIsAnswerCorrect(false);
      setShowVisualization(false);
      return;
    }

    if (answer === currentProblem.answer) {
      setScore(prevScore => prevScore + 1);
      setFeedback('Correct! Great job! 🎉');
      setIsAnswerCorrect(true);
      setShowVisualization(false);
      setGameStatus(GameStatus.WORD_COMPLETED);

      setTimeout(() => {
        if (currentProblemIndex < problemsInPhase.length - 1) {
          setCurrentProblemIndex(prevIndex => prevIndex + 1);
          setUserAnswer('');
          setFeedback(null);
          setIsAnswerCorrect(null);
          setShowVisualization(false);
          setGameStatus(GameStatus.PLAYING);
        } else {
          setGameStatus(GameStatus.GAME_OVER);
          setFeedback("Amazing! You completed all problems!");
        }
      }, 1500);
    } else {
      setFeedback('Not quite. Try again! Here is some help:');
      setIsAnswerCorrect(false);
      setShowVisualization(true);
    }
  }, [currentProblemIndex, problemsInPhase, userAnswer]);

  const startGame = () => {
    loadProblems();
  };

  const restartGame = () => {
    setGameStatus(GameStatus.IDLE);
    if (!selectedProblemIds) {
      setError("Please select a learning phase to start a new game.");
      setGameStatus(GameStatus.IDLE);
    } else {
      loadProblems();
    }
  };

  const currentProblem = problemsInPhase[currentProblemIndex] || null;

  const renderContent = () => {
    switch (gameStatus) {
      case GameStatus.LOADING_WORDS:
        return <LoadingSpinner message="Loading math problems..." />;
      case GameStatus.ERROR:
        return <ErrorDisplay message={error || "An error occurred."} onRetry={startGame} retryMessage={currentSelectedPhase ? "Try Again" : "Select Phase"} />;
      case GameStatus.IDLE:
        return (
          <div className="text-center">
            <SmileyIcon className="w-32 h-32 mx-auto mb-6 text-yellow-500 drop-shadow-lg" />
            <h2 className="text-5xl font-bold text-indigo-700 mb-8">
              {currentSelectedPhase ? `Phase ${currentSelectedPhase} Selected` : 'KidMath Challenge!'}
            </h2>
            <p className="text-xl text-slate-600 mb-10">
              {currentSelectedPhase 
                ? 'Ready to solve the selected math problems?' 
                : error ? error : 'Please select a phase to begin.'
              }
            </p>
            {currentSelectedPhase && (
              <button
                onClick={startGame}
                className="px-10 py-4 bg-green-500 text-white text-2xl font-semibold rounded-xl shadow-lg hover:bg-green-600 transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                Start Math Challenge!
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
            {currentProblem && (
              <MathProblemDisplay 
                problem={currentProblem}
                userAnswer={userAnswer}
                onAnswerChange={setUserAnswer}
                onSubmit={handleAnswerSubmit}
                disabled={gameStatus === GameStatus.WORD_COMPLETED}
              />
            )}
            
            {feedback && (
              <p className={`mt-4 text-lg font-medium ${isAnswerCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {feedback}
              </p>
            )}

            {showVisualization && isAnswerCorrect === false && currentProblem && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg shadow">
                <MathVisualization problem={currentProblem} />
              </div>
            )}

            <p className="mt-4 text-sm text-slate-500">
              Problems remaining: 
              {problemsInPhase.length - currentProblemIndex - (gameStatus === GameStatus.WORD_COMPLETED ? 0 : 1)}
            </p>
          </>
        );
      case GameStatus.GAME_OVER:
        return (
          <div className="text-center">
            <SmileyIcon className="w-32 h-32 mx-auto mb-6 text-green-500 drop-shadow-lg animate-bounce" />
            <h2 className="text-4xl font-bold text-indigo-700 mb-6">Amazing Math Work!</h2>
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
                setSelectedProblemIds(null);
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
            KidMath Challenge
          </span>
        </h1>
      </header>
      <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto gap-6">
        <MathPhasesUI onPhaseSelect={handlePhaseSelect} currentPhase={currentSelectedPhase} />
        <main className="w-full md:flex-grow p-6 sm:p-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl flex flex-col items-center justify-center min-h-[400px]">
          {renderContent()}
        </main>
      </div>
      <FeedbackMessage message={feedback} type={gameStatus === GameStatus.GAME_OVER || gameStatus === GameStatus.WORD_COMPLETED ? 'success' : 'info'} />
      <footer className="mt-12 text-sm text-slate-600">
        <p>&copy; {new Date().getFullYear()} KidMath Challenge</p>
      </footer>
    </div>
  );
};

export default MathPage; 
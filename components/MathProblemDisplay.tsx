import React from 'react';
import { MathProblem, OperationType } from '../types';

interface MathProblemDisplayProps {
  problem: MathProblem;
  userAnswer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

const MathProblemDisplay: React.FC<MathProblemDisplayProps> = ({ 
  problem, 
  userAnswer, 
  onAnswerChange, 
  onSubmit, 
  disabled 
}) => {
  const { operand1, operand2, operation } = problem;
  const operationSymbol = operation === OperationType.ADDITION ? '+' : '-';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!disabled) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-center space-x-4 text-5xl md:text-6xl font-bold text-slate-700">
        <span>{operand1}</span>
        <span className="text-pink-500">{operationSymbol}</span>
        <span>{operand2}</span>
        <span className="text-indigo-500">=</span>
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={disabled}
          className="w-24 md:w-28 h-20 md:h-24 text-center text-5xl md:text-6xl font-bold border-4 border-indigo-300 rounded-lg focus:border-pink-500 focus:ring-pink-500 transition duration-150 ease-in-out shadow-inner disabled:bg-gray-100"
          aria-label="Your answer"
          autoFocus
          min="0"
          step="1"
        />
      </div>
      {!disabled && (
        <button 
          type="submit"
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          Check Answer
        </button>
      )}
    </form>
  );
};

export default MathProblemDisplay; 
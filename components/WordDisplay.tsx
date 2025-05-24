import React from 'react';

interface WordDisplayProps {
  targetWord: string;
  typedWord: string;
  isCompleted: boolean;
}

const WordDisplay: React.FC<WordDisplayProps> = ({ targetWord, typedWord, isCompleted }) => {
  if (!targetWord) return null;

  return (
    <div className="p-4 my-6 bg-white rounded-lg shadow-lg min-h-[80px] flex items-center justify-center">
      <p className="text-5xl md:text-6xl font-bold tracking-wider select-none">
        {targetWord.split('').map((char, index) => {
          let charColor = 'text-slate-400'; // Default for untyped
          let animationClass = '';

          if (index < typedWord.length) {
            if (typedWord[index] === char) {
              charColor = 'text-green-500';
            } else {
              charColor = 'text-red-500';
            }
          } else if (index === typedWord.length && !isCompleted) {
            // Current character to type - subtle highlight or cursor
            charColor = 'text-slate-400';
          }
          
          if (isCompleted) {
            charColor = 'text-green-500';
            animationClass = 'animate-pulse';
          }

          return (
            <span key={`${targetWord}-${index}`} className={`${charColor} ${animationClass} transition-colors duration-150`}>
              {char}
            </span>
          );
        })}
      </p>
    </div>
  );
};

export default WordDisplay; 
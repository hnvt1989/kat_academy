import React from 'react';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  return (
    <div className="text-3xl font-bold text-purple-700 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-lg shadow-md">
      Score: <span className="text-pink-500">{score}</span>
    </div>
  );
};

export default ScoreDisplay; 
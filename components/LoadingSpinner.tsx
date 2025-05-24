import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 border-8 border-dashed rounded-full animate-spin border-pink-500"></div>
      <p className="mt-4 text-xl font-semibold text-pink-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner; 
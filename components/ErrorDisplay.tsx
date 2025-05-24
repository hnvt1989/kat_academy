import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  retryMessage?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry, retryMessage = "Try Again" }) => {
  return (
    <div className="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-md">
      <div className="flex">
        <div className="py-1">
          <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="font-bold">Oops! Something went wrong.</p>
          <p className="text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition duration-150"
            >
              {retryMessage}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 
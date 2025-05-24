import React, { useState, useEffect } from 'react';

interface FeedbackMessageProps {
  message: string | null;
  type: 'success' | 'error' | 'info';
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({ message, type }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1500); // Message visible for 1.5 seconds
      return () => clearTimeout(timer);
    }
  }, [message, type]); // Rerun effect if message or type changes to show new message

  if (!visible || !message) {
    return null;
  }

  const baseClasses = "fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-8 py-6 rounded-xl shadow-2xl text-4xl font-bold z-50 transition-all duration-300 ease-out";
  let typeClasses = "";

  switch (type) {
    case 'success':
      typeClasses = "bg-green-400 text-white";
      break;
    case 'error':
      typeClasses = "bg-red-400 text-white";
      break;
    default:
      typeClasses = "bg-blue-400 text-white";
  }

  return (
    <div className={`${baseClasses} ${typeClasses} ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
      {type === 'success' && <span className="mr-2">🎉</span>}
      {message}
    </div>
  );
};

export default FeedbackMessage; 
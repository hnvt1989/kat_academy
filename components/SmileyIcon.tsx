import React from 'react';

interface SmileyIconProps {
  className?: string;
}

const SmileyIcon: React.FC<SmileyIconProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="55" r="40" className="fill-yellow-300 stroke-yellow-500" strokeWidth="3"/>
      <path d="M50 12 L40 32 L60 32 Z" className="fill-pink-400 stroke-pink-500" strokeWidth="2"/>
      <circle cx="35" cy="48" r="5" className="fill-slate-800"/>
      <circle cx="65" cy="48" r="5" className="fill-slate-800"/>
      <path d="M35 68 Q50 80 65 68" className="stroke-slate-800" strokeWidth="4" fill="none"/>
    </svg>
  );
};

export default SmileyIcon; 
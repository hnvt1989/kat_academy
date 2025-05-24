import React from 'react';

export const SearchIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const KidZoneLogo: React.FC = () => (
  <div className="flex items-center space-x-1">
    <svg width="28" height="28" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M65 130C100.899 130 130 100.899 130 65C130 29.1015 100.899 0 65 0C29.1015 0 0 29.1015 0 65C0 100.899 29.1015 130 65 130Z" fill="#333333"/>
      {/* New K path */}
      <path d="M38 40 H48 V60 L70 40 L78 40 L53 65 L78 90 L70 90 L48 70 V90 H38 Z" fill="white"/>
    </svg>
    <span className="font-extrabold text-2xl text-brand-charcoal">Kat's Academy</span>
  </div>
);
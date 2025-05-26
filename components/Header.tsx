import React from 'react';
import { SearchIcon, UserIcon, KidZoneLogo } from './icons';

interface HeaderProps {
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateHome }) => {
  return (
    <header className="flex items-center justify-between py-6 mb-10">
      <button onClick={onNavigateHome} aria-label="Go to homepage" className="focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg">
        <KidZoneLogo />
      </button>
      <nav className="hidden md:flex items-center space-x-8 text-gray-600">
        <button 
          onClick={onNavigateHome} 
          className="text-xl font-semibold hover:text-brand-charcoal transition-colors px-4 py-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Home
        </button>
      </nav>
      <div className="flex items-center space-x-6 ml-auto">
        <button 
          aria-label="Search" 
          className="text-gray-500 hover:text-brand-charcoal transition-colors p-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <SearchIcon className="w-7 h-7" />
        </button>
        <button 
          aria-label="User Account" 
          className="text-gray-500 hover:text-brand-charcoal transition-colors p-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <UserIcon className="w-7 h-7" />
        </button>
      </div>
    </header>
  );
};

export default Header;

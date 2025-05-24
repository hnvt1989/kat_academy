
import React from 'react';
import { SearchIcon, UserIcon, KidZoneLogo } from './icons';

interface HeaderProps {
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateHome }) => {
  return (
    <header className="flex items-center justify-between py-4 mb-8">
      <button onClick={onNavigateHome} aria-label="Go to homepage">
        <KidZoneLogo />
      </button>
      {/* Navigation links removed
      <nav className="hidden md:flex items-center space-x-6 text-gray-600">
        <button onClick={onNavigateHome} className="hover:text-brand-charcoal transition-colors">Home</button>
        <a href="#about" className="hover:text-brand-charcoal transition-colors">About</a>
        <a href="#contact" className="hover:text-brand-charcoal transition-colors">Contact</a>
      </nav>
      */}
      <div className="flex items-center space-x-4 ml-auto"> {/* Added ml-auto to push icons to the right if nav is empty */}
        <button aria-label="Search" className="text-gray-500 hover:text-brand-charcoal transition-colors">
          <SearchIcon className="w-5 h-5" />
        </button>
        <button aria-label="User Account" className="text-gray-500 hover:text-brand-charcoal transition-colors">
          <UserIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;

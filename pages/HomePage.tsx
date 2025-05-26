import React from 'react';
import { Category } from '../types';
import { CATEGORIES_DATA } from '../constants';
import CategoryItem from '../components/CategoryItem';

interface HomePageProps {
  onSelectCategory: (category: Category) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSelectCategory }) => {
  return (
    <div className="flex flex-col items-center space-y-12 pt-10 pb-20">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-charcoal leading-tight">
          Welcome to Kat's Academy
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 max-w-4xl leading-relaxed">
          Explore a world of fun and learning with our exciting games, stories, and activities.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 w-full">
        {CATEGORIES_DATA.map((category) => (
          <CategoryItem 
            key={category.id} 
            category={category} 
            onSelect={onSelectCategory}
            size="large"
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;

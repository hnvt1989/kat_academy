
import React from 'react';
import { Category } from '../types';
import { CATEGORIES_DATA } from '../constants';
import CategoryItem from '../components/CategoryItem';

interface HomePageProps {
  onSelectCategory: (category: Category) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSelectCategory }) => {
  return (
    <div className="flex flex-col items-center space-y-10 pt-8 pb-16">
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-charcoal">Welcome to Kat's Academy</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Explore a world of fun and learning with our exciting games, stories, and activities.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 w-full">
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

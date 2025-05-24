
import React from 'react';
import { Category } from '../types';

interface CategoryItemProps {
  category: Category;
  onSelect: (category: Category) => void;
  size?: 'large' | 'small';
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, onSelect, size = 'large' }) => {
  const isLarge = size === 'large';
  const imageSize = isLarge ? 'w-48 h-48 md:w-52 md:h-52' : 'w-36 h-36 md:w-40 md:h-40';
  const titleSize = isLarge ? 'text-xl' : 'text-lg';
  const containerPadding = isLarge ? 'p-6' : 'p-4';

  return (
    <button 
      onClick={() => onSelect(category)}
      className={`flex flex-col items-center text-center space-y-3 group cursor-pointer ${containerPadding} rounded-lg transition-transform hover:scale-105`}
      aria-label={`Explore ${category.title}`}
    >
      <div className={`${imageSize} ${category.bgColorClass} rounded-full overflow-hidden shadow-md flex items-center justify-center group-hover:shadow-xl transition-shadow`}>
        <img 
          src={category.imageUrl} 
          alt={category.title} 
          className="w-full h-full object-cover" 
        />
      </div>
      <h3 className={`${titleSize} font-semibold text-brand-charcoal group-hover:text-blue-600`}>{category.title}</h3>
      {isLarge && category.description && (
        <p className="text-sm text-gray-500">{category.description}</p>
      )}
    </button>
  );
};

export default CategoryItem;

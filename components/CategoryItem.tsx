import React from 'react';
import { Category } from '../types';

interface CategoryItemProps {
  category: Category;
  onSelect: (category: Category) => void;
  size?: 'large' | 'small';
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, onSelect, size = 'large' }) => {
  const isLarge = size === 'large';
  const imageSize = isLarge ? 'w-56 h-56 md:w-64 md:h-64' : 'w-44 h-44 md:w-48 md:h-48';
  const titleSize = isLarge ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl';
  const containerPadding = isLarge ? 'p-8' : 'p-6';

  return (
    <button 
      onClick={() => onSelect(category)}
      className={`flex flex-col items-center text-center space-y-4 group cursor-pointer ${containerPadding} rounded-xl transition-transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300`}
      aria-label={`Explore ${category.title}`}
    >
      <div className={`${imageSize} ${category.bgColorClass} rounded-full overflow-hidden shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow`}>
        <img 
          src={category.imageUrl} 
          alt={category.title} 
          className="w-full h-full object-cover" 
        />
      </div>
      <h3 className={`${titleSize} font-bold text-brand-charcoal group-hover:text-blue-600 leading-tight`}>{category.title}</h3>
      {isLarge && category.description && (
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed">{category.description}</p>
      )}
    </button>
  );
};

export default CategoryItem;

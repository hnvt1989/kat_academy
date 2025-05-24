import React from 'react';
import { Category } from '../types';
import { CATEGORIES_DATA } from '../constants';
import CategoryItem from '../components/CategoryItem';
import LeilaPage from './LeilaPage';
import TypingPage from './TypingPage';
import MathPage from './MathPage';
import SightWordsPage from './SightWordsPage';

interface DetailPageProps {
  category: Category;
  onSelectCategory: (category: Category) => void; // For "Explore More" items
}

const DetailPage: React.FC<DetailPageProps> = ({ category, onSelectCategory }) => {
  const { pageTitle, subtitle, mainImage, age, size, illustrator, imageDescription } = category.detail;
  
  const exploreMoreCategories = CATEGORIES_DATA.filter((c: Category) => c.id !== category.id).slice(0, 3);

  const isChatCategory = category.id === 'leila';
  const isTypingCategory = category.id === 'learn-typing';
  const isMathCategory = category.id === 'learn-math';
  const isSightWordsCategory = category.id === 'sight-words';

  return (
    <div className="flex flex-col items-center space-y-10 pt-8 pb-16">
      <div className="text-center space-y-3 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-charcoal">{pageTitle}</h1>
        {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
      </div>

      {isChatCategory ? (
        <div className="w-full max-w-xl">
          <LeilaPage />
        </div>
      ) : isTypingCategory ? (
        <div className="w-full">
          <TypingPage />
        </div>
      ) : isMathCategory ? (
        <div className="w-full">
          <MathPage />
        </div>
      ) : isSightWordsCategory ? (
        <div className="w-full">
          <SightWordsPage />
        </div>
      ) : (
        <div className="w-full max-w-3xl flex flex-col items-center">
          <div className="bg-white p-3 shadow-2xl rounded-lg w-full mb-4 relative">
            {/* Hanging poster effect: clips */}
            <div className="absolute -top-2 left-1/4 -translate-x-1/2 w-6 h-4 bg-gray-300 rounded-t-sm shadow-sm"></div>
            <div className="absolute -top-2 right-1/4 translate-x-1/2 w-6 h-4 bg-gray-300 rounded-t-sm shadow-sm"></div>
            
            <img 
              src={mainImage} 
              alt={imageDescription || pageTitle} 
              className="w-full h-auto object-contain rounded-md aspect-[700/450]" 
            />
          </div>
          {(age || size || illustrator) && (
            <div className="text-center text-xs text-gray-500 mt-2 space-x-2">
              {age && <span>AGE {age}</span>}
              {(age && size) && <span>/</span>}
              {size && <span>SIZE {size}</span>}
              {((age || size) && illustrator) && <span>/</span>}
              {illustrator && <span>{illustrator.toUpperCase()}</span>}
            </div>
          )}
        </div>
      )}

      {exploreMoreCategories.length > 0 && (
        <div className="w-full pt-10 mt-10 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-brand-charcoal text-center mb-8">Explore More</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 w-full max-w-4xl mx-auto">
            {exploreMoreCategories.map((cat: Category, index: number) => (
              <CategoryItem 
                key={index} 
                category={cat} 
                onSelect={onSelectCategory}
                size="small"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailPage;

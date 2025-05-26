import React from 'react';
import { Category } from '../types';
import LeilaPage from './LeilaPage';
import TypingPage from './TypingPage';
import MathPage from './MathPage';
import SightWordsPage from './SightWordsPage';

interface DetailPageProps {
  category: Category;
}

const DetailPage: React.FC<DetailPageProps> = ({ category }) => {
  const { pageTitle, subtitle, mainImage, age, size, illustrator, imageDescription } = category.detail;
  
  const isChatCategory = category.id === 'leila';
  const isTypingCategory = category.id === 'learn-typing';
  const isMathCategory = category.id === 'learn-math';
  const isSightWordsCategory = category.id === 'sight-words';

  return (
    <div className="flex flex-col items-center space-y-12 pt-10 pb-20">
      <div className="text-center space-y-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-charcoal leading-tight">{pageTitle}</h1>
        {subtitle && <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 leading-relaxed">{subtitle}</p>}
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
            <div className="text-center text-base md:text-lg text-gray-500 mt-4 space-x-3 leading-relaxed">
              {age && <span className="font-medium">AGE {age}</span>}
              {(age && size) && <span>/</span>}
              {size && <span className="font-medium">SIZE {size}</span>}
              {((age || size) && illustrator) && <span>/</span>}
              {illustrator && <span className="font-medium">{illustrator.toUpperCase()}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailPage;

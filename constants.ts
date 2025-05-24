import { Category } from './types';

export const CATEGORIES_DATA: Category[] = [
  {
    id: 'leila',
    title: 'Leila',
    description: 'Chat with Leila the sheep',
    imageUrl: '/waving_sheep.png', // Updated
    bgColorClass: 'bg-brand-beige',
    detail: {
      pageTitle: "Chat with Leila",
      subtitle: "Join Leila and her fluffy sheep on exciting adventures! Explore stories, games, and activities designed to spark creativity and learning.",
      mainImage: '/waving_sheep.png', // Updated
      imageDescription: "Cute cartoon sheep waving, representing Leila's adventures.", // Updated
      age: '7',
      size: '1',
      illustrator: 'MELBOURNE PUNK',
    }
  },
  {
    id: 'tiny-cats',
    title: 'Tiny Cats',
    description: 'Read exciting stories',
    imageUrl: '/cat.png', // Updated
    bgColorClass: 'bg-white', 
    detail: {
      pageTitle: "Tiny chat", // Updated
      subtitle: "Explore the enchanting world of kittens and cats through delightful stories.",
      mainImage: '/cat.png', // Updated
      imageDescription: "Cute cartoon cat waving, for Tiny chat stories.", // Updated
      illustrator: 'KITTY ILLUSTRATIONS',
    }
  },
  {
    id: 'learn-typing',
    title: 'Learn Typing',
    description: 'Play interactive games',
    imageUrl: '/sheep_type.png', // Updated
    bgColorClass: 'bg-brand-pink',
    detail: {
      pageTitle: "Learn Typing", // Updated
      subtitle: "Master the keyboard with engaging games and challenges for all skill levels.",
      mainImage: '/sheep_type.png', // Updated
      imageDescription: "Cute cartoon sheep typing on a laptop, for Learn Typing games.", // Updated
      illustrator: 'KEYBOARD MASTERS',
    }
  },
  {
    id: 'learn-math',
    title: 'Learn Math',
    description: 'Create your own art',
    imageUrl: '/sheep_math.png', // Updated
    bgColorClass: 'bg-brand-peach',
    detail: {
      pageTitle: "Learn Math", // Updated
      subtitle: "Unleash your creativity by combining mathematics and art in unique ways.",
      mainImage: '/sheep_math.png', // Updated
      imageDescription: "Cute cartoon sheep with a chalkboard, for Learn Math activities.", // Updated
      illustrator: 'GEOMETRIC ARTISTS',
    }
  }
];

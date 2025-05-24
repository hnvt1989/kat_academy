export enum View {
  HOME = 'HOME',
  DETAIL = 'DETAIL',
  LEILA = 'LEILA',
}

export interface CategoryDetail {
  pageTitle: string;
  subtitle: string;
  mainImage: string;
  age?: string;
  size?: string;
  illustrator?: string;
  imageDescription?: string; // For alt text
}

export interface Category {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  bgColorClass: string;
  detail: CategoryDetail;
}

// Typing game related types
export enum GameStatus {
  IDLE = 'IDLE',
  API_KEY_CHECK = 'API_KEY_CHECK',
  API_KEY_MISSING = 'API_KEY_MISSING',
  LOADING_WORDS = 'LOADING_WORDS',
  PLAYING = 'PLAYING',
  WORD_COMPLETED = 'WORD_COMPLETED',
  GAME_OVER = 'GAME_OVER',
  ERROR = 'ERROR',
}

export interface ApiKeyInfo {
  key: string | null;
  checked: boolean;
}

export interface GeminiWordResponse {
  words: string[];
}

export interface TypingPhase {
  phase: number;
  description: string;
  sentences: string[];
}

// Math game related types
export enum OperationType {
  ADDITION = 'ADDITION',
  SUBTRACTION = 'SUBTRACTION',
}

export interface MathProblem {
  id: number;
  operation: OperationType;
  operand1: number;
  operand2: number;
  answer: number;
}

export interface MathPhase {
  id: number;
  title: string;
  description: string;
  problemIds: number[];
}

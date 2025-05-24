
export enum View {
  HOME = 'HOME',
  DETAIL = 'DETAIL',
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

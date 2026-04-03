export interface NavigationItem {
  id: number;
  time: number;
  label: string;
  detail: string;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  price: number; // For future DB integration (Intl.NumberFormat will be used for display)
  reason: string;
  image: string;
  affiliateUrl?: string;
}

export interface FitnessVideo {
  id: string;
  title: string;
  youtubeId: string;
  channel: string;
  aiIntroduction: string;
  navigationItems: NavigationItem[];
  aiRecommendedProducts: RecommendedProduct[];
  category: 'HIIT' | 'Yoga' | 'Stretch' | 'Strength';
  tags?: string[];
  thumbnail?: string;
}

export interface Trainer {
  id: string;
  name: string;
  category: 'HIIT' | 'Yoga' | 'Stretch' | 'Strength';
  description: string;
  image: string;
}

export type MenuCategory = 'todas' | 'entradas' | 'platos_fuertes' | 'postres';

export type DietaryTag = 
  | 'Chef' 
  | 'Popular' 
  | 'Nuevo' 
  | 'Vegetariano' 
  | 'Sin Gluten' 
  | 'Picante' 
  | 'Pescado Fresco';

export interface MenuItem {
  id: string;
  name: string;
  category: 'entradas' | 'platos_fuertes' | 'postres' | string;
  description: string;
  longDescription?: string;
  price: number;
  image?: string;
  available: boolean;
  prepTime?: string;
  calories?: number;
  rating?: number;
  reviewCount?: number;
  tags: (DietaryTag | string)[];
  ingredients: string[];
  allergens?: string[];
  winePairing?: string;
  portionSize?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface RestaurantData {
  name: string;
  subtitle: string;
  description: string;
  rating: number;
  reviewsCount: number;
  address: string;
  phone: string;
  hours: string;
  coverImage: string;
  currency: string;
}

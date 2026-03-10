// types/menu.ts

/** 상품 정보 제공 고시 - 영양정보·알레르기 등 */
export interface ProductInfo {
  weightG?: number;
  calorieKcal?: number;
  nutrition?: {
    sodiumMg?: number;
    carbsG?: number;
    sugarsG?: number;
    fatG?: number;
    transFatG?: number;
    saturatedFatG?: number;
    cholesterolMg?: number;
    proteinG?: number;
  };
  allergens?: string[];
  ingredients?: string;
  storage?: string;
}

export interface Menu {
  id: number;
  korName: string;
  engName: string;
  description: string;
  price: number;
  category: number;
  images: MenuImage[];
  isAvailable: boolean;
  isSoldOut: boolean;
  sortOrder: number;
  options: MenuOption[];
  productInfo?: ProductInfo | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface MenuOption {
  id: number;
  name: string;
  type: 'radio' | 'checkbox';
  required: boolean;
  items: OptionItem[];
}

export interface OptionItem {
  id: number;
  name: string;
  priceDelta: number;
}

export interface MenuCategory {
  id: number;
  korName: string;
  engName: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

// 판매 상태
export type SaleStatus = 'available' | 'soldOut' | 'hidden';

// types/menu.ts

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

// mocks/menuData.ts

import { Menu, MenuCategory } from '@/types/menu';

export const mockCategories: MenuCategory[] = [
    { id: 'coffee', korName: '커피', engName: 'Coffee', icon: '☕', sortOrder: 1, isActive: true },
    { id: 'beverage', korName: '음료', engName: 'Beverage', icon: '🥤', sortOrder: 2, isActive: true },
    { id: 'tea', korName: '티', engName: 'Tea', icon: '🍵', sortOrder: 3, isActive: true },
    { id: 'dessert', korName: '디저트', engName: 'Dessert', icon: '🍰', sortOrder: 4, isActive: true },
    { id: 'bakery', korName: '베이커리', engName: 'Bakery', icon: '🥐', sortOrder: 5, isActive: true },
];

export const mockMenus: Menu[] = [
    {
        id: '1',
        korName: '아메리카노',
        engName: 'Americano',
        description: '깊고 풍부한 에스프레소에 물을 더해 깔끔한 맛을 즐길 수 있는 커피',
        price: 4500,
        category: 'coffee',
        images: [
            { id: 'img1', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600', isPrimary: true, sortOrder: 1 }
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 1,
        options: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    },
    {
        id: '2',
        korName: '카페라떼',
        engName: 'Cafe Latte',
        description: '진한 에스프레소와 부드러운 우유가 어우러진 커피',
        price: 5000,
        category: 'coffee',
        images: [
            { id: 'img2', url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=600', isPrimary: true, sortOrder: 1 }
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 2,
        options: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    },
    {
        id: '3',
        korName: '바닐라라떼',
        engName: 'Vanilla Latte',
        description: '바닐라 시럽이 들어간 달콤한 라떼',
        price: 5500,
        category: 'coffee',
        images: [
            { id: 'img3', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600', isPrimary: true, sortOrder: 1 }
        ],
        isAvailable: true,
        isSoldOut: true,
        sortOrder: 3,
        options: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    },
    {
        id: '4',
        korName: '카라멜 마키아또',
        engName: 'Caramel Macchiato',
        description: '바닐라 시럽, 우유, 에스프레소, 카라멜 드리즐이 어우러진 커피',
        price: 5800,
        category: 'coffee',
        images: [
            { id: 'img4', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600', isPrimary: true, sortOrder: 1 }
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 4,
        options: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    },
    {
        id: '5',
        korName: '딸기 스무디',
        engName: 'Strawberry Smoothie',
        description: '신선한 딸기로 만든 달콤한 스무디',
        price: 5500,
        category: 'beverage',
        images: [
            { id: 'img5', url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&q=80&w=600', isPrimary: true, sortOrder: 1 }
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 1,
        options: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    },
    {
        id: '6',
        korName: '망고 스무디',
        engName: 'Mango Smoothie',
        description: '열대 과일 망고로 만든 상큼한 스무디',
        price: 5500,
        category: 'beverage',
        images: [
            { id: 'img6', url: 'https://images.unsplash.com/photo-1600718374662-0483d2b9d283?auto=format&fit=crop&q=80&w=600', isPrimary: true, sortOrder: 1 }
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 2,
        options: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    },
    {
        id: '7',
        korName: '레몬에이드',
        engName: 'Lemonade',
        description: '상큼한 레몬으로 만든 시원한 에이드',
        price: 5000,
        category: 'beverage',
        images: [
            { id: 'img7', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600', isPrimary: true, sortOrder: 1 }
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 3,
        options: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    },
    {
        id: '8',
        korName: '얼그레이',
        engName: 'Earl Grey',
        description: '베르가못 향이 은은한 클래식 홍차',
        price: 4500,
        category: 'tea',
        images: [
            { id: 'img8', url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=600', isPrimary: true, sortOrder: 1 }
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 1,
        options: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    },
    {
        id: '9',
        korName: '치즈케이크',
        engName: 'Cheesecake',
        description: '부드럽고 진한 뉴욕 스타일 치즈케이크',
        price: 6500,
        category: 'dessert',
        images: [
            { id: 'img9', url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=600', isPrimary: true, sortOrder: 1 }
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 1,
        options: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    },
    {
        id: '10',
        korName: '크로와상',
        engName: 'Croissant',
        description: '겉은 바삭, 속은 부드러운 버터 크로와상',
        price: 4000,
        category: 'bakery',
        images: [
            { id: 'img10', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600', isPrimary: true, sortOrder: 1 }
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 1,
        options: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    },
    {
        id: '11',
        korName: '소금빵',
        engName: 'Salt Bread',
        description: '고소한 버터와 소금의 조화가 일품인 인기 빵',
        price: 3500,
        category: 'bakery',
        images: [
            { id: 'img11', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600', isPrimary: true, sortOrder: 1 }
        ],
        isAvailable: true,
        isSoldOut: false,
        sortOrder: 2,
        options: [],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
    },
];

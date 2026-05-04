import { MenuItem } from '@/types';

export const MENU: MenuItem[] = [
  {
    id: 'hangsang',
    name: '항상',
    price: 4000,
    description: '고소한 원두로 내린 커피',
    category: '커피',
    availableOptions: ['hot', 'ice'],
    beanName: '(원두 정보 업데이트 예정)',
    cupNotes: '',
    intro: '',
  },
  {
    id: 'pureun',
    name: '푸른',
    price: 4000,
    description: '산미 있는 원두로 내린 커피',
    category: '커피',
    availableOptions: ['hot', 'ice'],
    beanName: '(원두 정보 업데이트 예정)',
    cupNotes: '',
    intro: '',
  },
  {
    id: 'namu',
    name: '나무',
    price: 4000,
    description: '논커피 메뉴 (아이스 단일)',
    category: '논커피',
    availableOptions: ['ice'],
    beanName: '',
    cupNotes: '',
    intro: '',
  },
];

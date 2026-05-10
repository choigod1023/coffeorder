import { MenuItem } from '@/types';

export const MENU: MenuItem[] = [
  {
    id: 'hangsang',
    name: '항상',
    price: 4000,
    description: '항상 입안을 가득 채우는 풍부한 초콜릿 향미',
    category: '커피',
    availableOptions: ['hot', 'ice'],
    beanName: 'Black Suit — 브라질 60%, 콜롬비아 25%, 에티오피아 15%',
    cupNotes: '초콜릿, 로스팅 너트, 단맛의 여운',
    intro: '누구나 편하게 마실 수 있는 커피를 추구합니다. 초콜릿의 달콤함과 구운 견과의 고소함이 조화롭고, 단맛의 여운이 길게 이어집니다.',
  },
  {
    id: 'pureun',
    name: '푸른',
    price: 4000,
    description: '싱그러운 시트러스 과일, 은은한 꽃 향',
    category: '커피',
    availableOptions: ['hot', 'ice'],
    beanName: 'Velvet White — 에티오피아 블렌드 (비산 디모 40%, 합타무 이르가체페 단체 30%, 합타무 이르가체페 고티티 30%)',
    cupNotes: '복숭아, 오렌지, 재스민, 홍차, 브라운 슈거',
    intro: '복숭아, 오렌지, 재스민처럼 싱그럽고 홍차, 브라운 슈거 같은 긴 여운이 매력적인 커피입니다. 3가지 에티오피아 원두로 구성되어 기분 좋은 향과 맛을 즐길 수 있습니다.',
  },
  {
    id: 'namu',
    name: '나무',
    price: 3500,
    description: '논커피 메뉴 (아이스 단일)',
    category: '논커피',
    availableOptions: ['ice'],
    beanName: '',
    cupNotes: '',
    intro: '',
  },
];

'use client';

import { MenuItem as MenuItemType } from '@/types';

interface MenuItemProps {
  item: MenuItemType;
  cartQty: number;
  onPress: () => void;
}

export default function MenuItem({ item, cartQty, onPress }: MenuItemProps) {
  return (
    <button
      onClick={onPress}
      className="w-full text-left rounded-2xl overflow-hidden border border-sage-200 bg-white shadow-sm active:scale-[0.97] transition-transform"
    >
      <div className="relative w-full aspect-square bg-gradient-to-br from-sage-600 to-sage-400 flex items-center justify-center">
        <span className="text-7xl">{item.category === '논커피' ? '🌿' : '☕'}</span>
        {cartQty > 0 && (
          <span className="absolute top-2.5 right-2.5 w-7 h-7 bg-sage-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {cartQty}
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h3 className="font-bold text-gray-800 text-base">{item.name}</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">{item.category}</span>
        </div>
        <p className="text-sage-600 font-bold text-sm">{item.price.toLocaleString('ko-KR')}원</p>
        {item.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
        )}
      </div>
    </button>
  );
}

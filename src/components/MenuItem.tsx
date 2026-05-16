'use client';

import { MenuItem as MenuItemType } from '@/types';
import { getFlavorColor } from '@/lib/flavor';
import Image from 'next/image';

interface MenuItemProps {
  item: MenuItemType;
  cartQty: number;
  onPress: () => void;
}

export default function MenuItem({ item, cartQty, onPress }: MenuItemProps) {
  const emoji = item.id === 'namu' ? '🍋' : '☕';

  return (
    <button
      onClick={onPress}
      className="w-full text-left rounded-2xl overflow-hidden bg-white shadow-sm active:scale-[0.97] transition-transform"
    >
      <div className="relative w-full aspect-[4/3]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sage-600 to-sage-400 flex items-center justify-center">
            <span className="text-5xl">{emoji}</span>
          </div>
        )}
        {cartQty > 0 && (
          <span className="absolute top-2.5 right-2.5 w-7 h-7 bg-sage-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {cartQty}
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h3 className="font-bold text-gray-800 text-base">{item.name}</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">{item.category}</span>
        </div>
        <p className="text-sage-600 font-bold text-sm mb-1.5">{item.price.toLocaleString('ko-KR')}원</p>
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => {
              const c = getFlavorColor(tag);
              return (
                <span
                  key={tag}
                  style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
                  className="text-[11px] border px-2 py-0.5 rounded-full font-medium"
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </button>
  );
}

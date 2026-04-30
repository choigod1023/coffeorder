'use client';

import { MenuItem as MenuItemType } from '@/types';
import { Plus, Minus } from 'lucide-react';

interface MenuItemProps {
  item: MenuItemType;
  quantity: number;
  onAdd: (item: MenuItemType) => void;
  onRemove: (itemId: string) => void;
}

export default function MenuItem({ item, quantity, onAdd, onRemove }: MenuItemProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm active:scale-[0.98] transition-transform">
      {/* Image area */}
      <div className="w-full h-32 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
        <span className="text-5xl">☕</span>
      </div>

      <div className="p-3 flex flex-col gap-2.5">
        <div>
          <h3 className="font-bold text-gray-800 text-sm leading-tight">{item.name}</h3>
          {item.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
          )}
          <p className="text-amber-700 font-bold mt-1.5 text-base">
            {item.price.toLocaleString('ko-KR')}원
          </p>
        </div>

        {quantity === 0 ? (
          <button
            onClick={() => onAdd(item)}
            className="w-full h-11 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            담기
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => onRemove(item.id)}
              className="w-11 h-11 rounded-xl border-2 border-amber-300 flex items-center justify-center text-amber-700 hover:bg-amber-50 active:bg-amber-100 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-amber-800 text-lg min-w-[2rem] text-center">{quantity}</span>
            <button
              onClick={() => onAdd(item)}
              className="w-11 h-11 rounded-xl bg-amber-600 flex items-center justify-center text-white hover:bg-amber-700 active:bg-amber-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

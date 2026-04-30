'use client';

import { CartItem as CartItemType } from '@/types';
import { Plus, Minus, X } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onAdd: (item: CartItemType) => void;
  onRemove: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export default function CartItem({ item, onAdd, onRemove, onDelete }: CartItemProps) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-amber-100 last:border-0">
      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-base flex-shrink-0">
        ☕
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
        <p className="text-amber-700 text-xs font-semibold">
          {(item.price * item.quantity).toLocaleString('ko-KR')}원
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onRemove(item.id)}
          className="w-6 h-6 rounded-full border border-amber-300 flex items-center justify-center text-amber-700 hover:bg-amber-50 transition-colors"
        >
          <Minus className="w-2.5 h-2.5" />
        </button>
        <span className="font-bold text-amber-800 text-sm min-w-[1.25rem] text-center">{item.quantity}</span>
        <button
          onClick={() => onAdd(item)}
          className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

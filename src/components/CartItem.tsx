'use client';

import { CartItem as CartItemType } from '@/types';
import { Plus, Minus, X } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onIncrement: (cartId: string) => void;
  onDecrement: (cartId: string) => void;
  onDelete: (cartId: string) => void;
}

export default function CartItem({ item, onIncrement, onDecrement, onDelete }: CartItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-amber-100 last:border-0">
      <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
        {item.option === 'hot' ? '☕' : '🧊'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
        <p className="text-amber-700 text-sm font-bold mt-0.5">
          {(item.price * item.quantity).toLocaleString('ko-KR')}원
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onDecrement(item.id)}
          className="w-9 h-9 rounded-xl border-2 border-amber-300 flex items-center justify-center text-amber-700 hover:bg-amber-50 active:bg-amber-100 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="font-bold text-amber-800 text-base min-w-[1.5rem] text-center">{item.quantity}</span>
        <button
          onClick={() => onIncrement(item.id)}
          className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white hover:bg-amber-700 active:bg-amber-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors ml-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

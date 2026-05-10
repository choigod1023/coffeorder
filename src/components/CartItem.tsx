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
    <div className="flex items-center gap-3 py-4 border-b border-gray-100 last:border-0">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-gray-600">{item.option === 'hot' ? '핫' : '냉'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-base truncate">{item.name}</p>
        <p className="text-sage-700 text-base font-bold mt-0.5">
          {(item.price * item.quantity).toLocaleString('ko-KR')}원
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onDecrement(item.id)}
          className="w-11 h-11 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="font-bold text-gray-800 text-lg min-w-[1.75rem] text-center">{item.quantity}</span>
        <button
          onClick={() => onIncrement(item.id)}
          className="w-11 h-11 rounded-xl bg-sage-600 flex items-center justify-center text-white hover:bg-sage-700 active:bg-sage-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors ml-0.5"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

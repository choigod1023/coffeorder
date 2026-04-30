'use client';

import { MenuItem as MenuItemType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface MenuItemProps {
  item: MenuItemType;
  quantity: number;
  onAdd: (item: MenuItemType) => void;
  onRemove: (itemId: string) => void;
}

export default function MenuItem({ item, quantity, onAdd, onRemove }: MenuItemProps) {
  return (
    <Card className="overflow-hidden border border-amber-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Image placeholder */}
      <div className="w-full h-36 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
        <span className="text-5xl">☕</span>
      </div>

      <CardContent className="p-3 flex flex-col gap-2">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
          {item.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
          )}
          <p className="text-amber-700 font-bold mt-1 text-sm">
            {item.price.toLocaleString('ko-KR')}원
          </p>
        </div>

        <div className="flex items-center justify-between">
          {quantity === 0 ? (
            <Button
              onClick={() => onAdd(item)}
              className="w-full h-8 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg"
            >
              <Plus className="w-3 h-3 mr-1" />
              담기
            </Button>
          ) : (
            <div className="flex items-center gap-2 w-full justify-between">
              <button
                onClick={() => onRemove(item.id)}
                className="w-8 h-8 rounded-full border border-amber-300 flex items-center justify-center text-amber-700 hover:bg-amber-50 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-bold text-amber-800 text-sm min-w-[1.5rem] text-center">{quantity}</span>
              <button
                onClick={() => onAdd(item)}
                className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white hover:bg-amber-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

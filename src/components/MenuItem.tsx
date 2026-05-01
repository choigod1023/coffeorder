'use client';

import { MenuItem as MenuItemType, MenuOption } from '@/types';
import { Plus, Minus } from 'lucide-react';

interface MenuItemProps {
  item: MenuItemType;
  getOptionQty: (option: MenuOption) => number;
  onAdd: (option: MenuOption) => void;
  onRemove: (option: MenuOption) => void;
  isAtLimit: boolean;
}

const OPTION_LABEL: Record<MenuOption, string> = { hot: '핫', ice: '아이스' };
const OPTION_ICON: Record<MenuOption, string> = { hot: '🔥', ice: '🧊' };

export default function MenuItem({ item, getOptionQty, onAdd, onRemove, isAtLimit }: MenuItemProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
      <div className="w-full h-28 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
        <span className="text-5xl">{item.category === '논커피' ? '🌿' : '☕'}</span>
      </div>

      <div className="p-3 flex flex-col gap-2">
        <div>
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-bold text-gray-800 text-base leading-tight">{item.name}</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
              {item.category}
            </span>
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
          )}
          {item.beanName && (
            <p className="text-xs text-amber-700 mt-0.5 font-medium">{item.beanName}</p>
          )}
          {item.cupNotes && (
            <p className="text-xs text-gray-400 mt-0.5">✦ {item.cupNotes}</p>
          )}
          {item.intro && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.intro}</p>
          )}
          <p className="text-amber-700 font-bold mt-1.5 text-base">
            {item.price.toLocaleString('ko-KR')}원
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          {item.availableOptions.map((option) => {
            const qty = getOptionQty(option);
            return (
              <div key={option} className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 flex items-center gap-0.5 w-14 shrink-0">
                  {OPTION_ICON[option]} {OPTION_LABEL[option]}
                </span>
                {qty === 0 ? (
                  <button
                    onClick={() => onAdd(option)}
                    disabled={isAtLimit}
                    className="flex-1 h-9 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    담기
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-between gap-1">
                    <button
                      onClick={() => onRemove(option)}
                      className="w-9 h-9 rounded-xl border-2 border-amber-300 flex items-center justify-center text-amber-700 hover:bg-amber-50 active:bg-amber-100 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-amber-800 text-base min-w-[1.5rem] text-center">{qty}</span>
                    <button
                      onClick={() => onAdd(option)}
                      disabled={isAtLimit}
                      className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white hover:bg-amber-700 disabled:bg-gray-200 active:bg-amber-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

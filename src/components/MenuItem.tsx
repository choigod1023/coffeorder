'use client';

import { useState } from 'react';
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
  const [selectedOption, setSelectedOption] = useState<MenuOption>(item.availableOptions[0]);
  const qty = getOptionQty(selectedOption);

  return (
    <div className="rounded-2xl border border-amber-100 bg-white shadow-sm p-4">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-3xl">{item.category === '논커피' ? '🌿' : '☕'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">{item.category}</span>
          </div>
          {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
          {item.beanName && <p className="text-sm text-amber-700 mt-0.5 font-medium">{item.beanName}</p>}
          {item.cupNotes && <p className="text-xs text-gray-400 mt-0.5">✦ {item.cupNotes}</p>}
          <p className="text-amber-700 font-bold mt-1 text-lg">{item.price.toLocaleString('ko-KR')}원</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        {item.availableOptions.length > 1 ? (
          <div className="flex rounded-xl overflow-hidden border border-amber-200 flex-shrink-0">
            {item.availableOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedOption(opt)}
                className={`px-4 py-3 text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  selectedOption === opt
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-amber-50'
                }`}
              >
                {OPTION_ICON[opt]} {OPTION_LABEL[opt]}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 flex-shrink-0 px-1">
            <span>{OPTION_ICON[item.availableOptions[0]]}</span>
            <span>{OPTION_LABEL[item.availableOptions[0]]}</span>
          </div>
        )}

        {qty === 0 ? (
          <button
            onClick={() => onAdd(selectedOption)}
            disabled={isAtLimit}
            className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-base"
          >
            <Plus className="w-5 h-5" />
            담기
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-between gap-2">
            <button
              onClick={() => onRemove(selectedOption)}
              className="w-12 h-12 rounded-xl border-2 border-amber-300 flex items-center justify-center text-amber-700 hover:bg-amber-50 active:bg-amber-100 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="font-bold text-amber-800 text-xl min-w-[2rem] text-center">{qty}</span>
            <button
              onClick={() => onAdd(selectedOption)}
              disabled={isAtLimit}
              className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center text-white hover:bg-amber-700 disabled:bg-gray-200 active:bg-amber-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

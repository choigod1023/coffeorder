'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MENU } from '@/lib/menu';
import { getCart, saveCart } from '@/lib/cart';
import { CartItem, MenuOption } from '@/types';
import { ArrowLeft, Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const OPTION_LABEL: Record<MenuOption, string> = { hot: '핫', ice: '아이스' };
const MAX_ITEMS = 10;

interface Props {
  params: Promise<{ id: string }>;
}

export default function MenuDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const item = MENU.find((m) => m.id === id);

  const [selectedOption, setSelectedOption] = useState<MenuOption>(item?.availableOptions[0] ?? 'ice');
  const [addQty, setAddQty] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setCart(getCart());
  }, []);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50">
        <p className="text-gray-500">메뉴를 찾을 수 없습니다</p>
      </div>
    );
  }

  const cartId = `${item.id}-${selectedOption}`;
  const totalInCart = cart.reduce((s, c) => s + c.quantity, 0);
  const remainingSlots = MAX_ITEMS - totalInCart;
  const isAtLimit = remainingSlots <= 0;

  const increaseAddQty = () => setAddQty((q) => Math.min(q + 1, Math.max(remainingSlots, 1)));
  const decreaseAddQty = () => setAddQty((q) => Math.max(q - 1, 1));

  const handleAdd = useCallback(() => {
    if (!item || isAtLimit) return;
    const displayName = `${item.name} (${selectedOption === 'hot' ? '핫' : '아이스'})`;
    const actualAdd = Math.min(addQty, remainingSlots);

    setCart((prev) => {
      const existing = prev.find((c) => c.id === cartId);
      const next = existing
        ? prev.map((c) => c.id === cartId ? { ...c, quantity: c.quantity + actualAdd } : c)
        : [...prev, { id: cartId, menuId: item.id, name: displayName, price: item.price, quantity: actualAdd, option: selectedOption }];
      saveCart(next);
      return next;
    });

    setAddQty(1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }, [item, cartId, selectedOption, addQty, remainingSlots, isAtLimit]);

  const totalInCartAfterAdd = totalInCart;

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-sage-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="상록수커피클럽" width={28} height={28} className="rounded-full" />
            <h1 className="text-base font-bold text-sage-900">{item.name}</h1>
          </Link>
          <div className="relative">
            <button
              onClick={() => router.push('/')}
              className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="장바구니 보기"
            >
              <ShoppingCart className="w-5 h-5 text-sage-700" />
            </button>
            {totalInCartAfterAdd > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-sage-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalInCartAfterAdd > 9 ? '9+' : totalInCartAfterAdd}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="w-full h-64 bg-gradient-to-br from-sage-600 to-sage-400 flex items-center justify-center">
        <span className="text-9xl">{item.category === '논커피' ? '🌿' : '☕'}</span>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-5 pb-48">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          {item.category && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">{item.category}</span>
          )}
        </div>
        <p className="text-sage-600 font-bold text-xl mb-4">{item.price.toLocaleString('ko-KR')}원</p>

        {item.description && (
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">{item.description}</p>
        )}
        {item.beanName && (
          <div className="bg-white rounded-xl border border-sage-200 px-4 py-3 mb-3">
            <p className="text-xs text-sage-600 font-medium mb-0.5">원두</p>
            <p className="text-sm text-gray-800 font-semibold">{item.beanName}</p>
          </div>
        )}
        {item.cupNotes && (
          <div className="bg-white rounded-xl border border-sage-200 px-4 py-3 mb-3">
            <p className="text-xs text-sage-600 font-medium mb-0.5">컵 노트</p>
            <p className="text-sm text-gray-800">{item.cupNotes}</p>
          </div>
        )}
        {item.intro && (
          <p className="text-gray-500 text-sm leading-relaxed mt-2">{item.intro}</p>
        )}

        {isAtLimit && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700 font-medium text-center">
            10잔 이상 주문은 카운터로 문의해주세요
          </div>
        )}
      </div>

      {/* Bottom CTA — 레이아웃 고정, 전환 없음 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-sage-100 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex flex-col gap-3">
          {/* 옵션 토글 */}
          {item.availableOptions.length > 1 && (
            <div className="flex rounded-xl overflow-hidden border border-sage-200">
              {item.availableOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                    selectedOption === opt
                      ? 'bg-sage-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-sage-50'
                  }`}
                >
                  {OPTION_LABEL[opt]}
                </button>
              ))}
            </div>
          )}

          {/* 수량 + 담기 — 항상 동일 레이아웃 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border-2 border-sage-200 rounded-xl overflow-hidden shrink-0">
              <button
                onClick={decreaseAddQty}
                disabled={addQty <= 1}
                className="w-11 h-12 flex items-center justify-center text-sage-700 hover:bg-sage-50 disabled:text-gray-300 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-sage-800 text-base">{addQty}</span>
              <button
                onClick={increaseAddQty}
                disabled={isAtLimit || addQty >= remainingSlots}
                className="w-11 h-12 flex items-center justify-center text-sage-700 hover:bg-sage-50 disabled:text-gray-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={isAtLimit || justAdded}
              className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                justAdded
                  ? 'bg-sage-100 text-sage-700 border-2 border-sage-300'
                  : 'bg-sage-600 hover:bg-sage-700 active:bg-sage-800 text-white disabled:bg-gray-200 disabled:text-gray-400'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  담겼습니다
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  장바구니에 담기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

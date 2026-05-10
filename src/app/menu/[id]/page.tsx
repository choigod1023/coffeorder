'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MENU } from '@/lib/menu';
import { getCart, saveCart } from '@/lib/cart';
import { CartItem, MenuOption } from '@/types';
import { getFlavorColor } from '@/lib/flavor';
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
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="상록수커피클럽" width={40} height={40} className="rounded-full" />
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
      <div className="w-full aspect-square relative overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sage-600 to-sage-400 flex items-center justify-center">
            <span className="text-9xl">{item.category === '논커피' ? '🌿' : '☕'}</span>
          </div>
        )}
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

        {/* 컵 노트 — 가격 바로 아래 */}
        {item.cupNotes && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-semibold mb-2">컵 노트</p>
            <div className="flex flex-wrap gap-1.5">
              {item.cupNotes.split(',').map((note) => {
                const c = getFlavorColor(note);
                return (
                  <span
                    key={note}
                    style={{ backgroundColor: c.bg, color: c.text, borderColor: c.border }}
                    className="text-xs border px-2.5 py-1 rounded-full font-semibold"
                  >
                    {note.trim()}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 원두 카드 */}
        {(item.beanBrand || item.origins) && (
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs text-gray-500 font-semibold mb-2">원두</p>
            {item.beanBrand && (
              <p className="text-sm font-bold text-gray-900 mb-2">{item.beanBrand}</p>
            )}
            {item.origins && (
              <div className="space-y-2">
                {item.origins.map((o) => (
                  <div key={o.name} className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="text-xs font-semibold text-gray-800">{o.name}</span>
                      {o.region && (
                        <span className="text-[10px] text-gray-400">{o.region}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-gray-500 shrink-0">{o.ratio}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {item.description && (
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">{item.description}</p>
        )}
        {item.intro && (
          <p className="text-gray-500 text-sm leading-relaxed mt-2">{item.intro}</p>
        )}

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 leading-relaxed">
          <p className="font-semibold mb-0.5">추가 요청사항 안내</p>
          <p>저희 커피는 필터커피로 제공되어 시럽 추가, 샷 추가 등 별도 요청사항 수용이 어렵습니다.</p>
        </div>

        {isAtLimit && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700 font-medium text-center">
            장바구니가 가득 찼어요 (최대 10잔) · 10잔 초과 주문은 카운터로 문의해주세요
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex flex-col gap-3">
          {item.availableOptions.length > 1 && (
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              {item.availableOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                    selectedOption === opt
                      ? 'bg-sage-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {OPTION_LABEL[opt]}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden shrink-0">
              <button
                onClick={decreaseAddQty}
                disabled={addQty <= 1}
                className="w-11 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:text-gray-300 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-gray-800 text-base">{addQty}</span>
              <button
                onClick={increaseAddQty}
                disabled={isAtLimit || addQty >= remainingSlots}
                className="w-11 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:text-gray-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={isAtLimit || justAdded}
              className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                justAdded
                  ? 'bg-gray-100 text-gray-600 border-2 border-gray-200'
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

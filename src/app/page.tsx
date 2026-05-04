'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MenuItem as MenuItemType, CartItem, MenuOption } from '@/types';
import MenuItemCard from '@/components/MenuItem';
import CartItemCard from '@/components/CartItem';
import { ShoppingCart, Coffee, X, Info } from 'lucide-react';
import { createOrder } from '@/lib/orders';

const MAX_ITEMS = 10;

const MENU: MenuItemType[] = [
  {
    id: 'hangsang',
    name: '항상',
    price: 4000,
    description: '고소한 원두로 내린 커피',
    category: '커피',
    availableOptions: ['hot', 'ice'],
    beanName: '(원두 정보 업데이트 예정)',
    cupNotes: '',
    intro: '',
  },
  {
    id: 'pureun',
    name: '푸른',
    price: 4000,
    description: '산미 있는 원두로 내린 커피',
    category: '커피',
    availableOptions: ['hot', 'ice'],
    beanName: '(원두 정보 업데이트 예정)',
    cupNotes: '',
    intro: '',
  },
  {
    id: 'namu',
    name: '나무',
    price: 4000,
    description: '논커피 메뉴 (아이스 단일)',
    category: '논커피',
    availableOptions: ['ice'],
    beanName: '',
    cupNotes: '',
    intro: '',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [nameError, setNameError] = useState('');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isAtLimit = totalItems >= MAX_ITEMS;

  const addToCart = useCallback((item: MenuItemType, option: MenuOption) => {
    setCart((prev) => {
      if (prev.reduce((s, c) => s + c.quantity, 0) >= MAX_ITEMS) return prev;
      const cartId = `${item.id}-${option}`;
      const displayName = `${item.name} (${option === 'hot' ? '핫' : '아이스'})`;
      const existing = prev.find((c) => c.id === cartId);
      if (existing) {
        return prev.map((c) => c.id === cartId ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { id: cartId, menuId: item.id, name: displayName, price: item.price, quantity: 1, option }];
    });
  }, []);

  const incrementCart = useCallback((cartId: string) => {
    setCart((prev) => {
      if (prev.reduce((s, c) => s + c.quantity, 0) >= MAX_ITEMS) return prev;
      return prev.map((c) => c.id === cartId ? { ...c, quantity: c.quantity + 1 } : c);
    });
  }, []);

  const decrementCart = useCallback((cartId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === cartId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((c) => c.id !== cartId);
      return prev.map((c) => c.id === cartId ? { ...c, quantity: c.quantity - 1 } : c);
    });
  }, []);

  const deleteFromCart = useCallback((cartId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== cartId));
  }, []);

  const getOptionQty = (menuId: string, option: MenuOption): number =>
    cart.find((c) => c.id === `${menuId}-${option}`)?.quantity ?? 0;

  const handleOrderClick = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setCustomerName('');
    setNameError('');
    setShowNameModal(true);
  };

  const handleConfirmOrder = async () => {
    const trimmed = customerName.trim();
    if (!trimmed) { setNameError('이름을 입력해주세요'); return; }
    if (trimmed.length > 5) { setNameError('이름은 5자 이하로 입력해주세요'); return; }
    setNameError('');
    setIsOrdering(true);
    try {
      const orderId = `order-${Date.now()}`;
      const items = cart.map((item) => ({
        menuItemId: item.menuId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        option: item.option,
      }));
      await createOrder(orderId, trimmed, items, totalPrice);
      setShowNameModal(false);
      setCart([]);
      router.push(`/order/${orderId}?total=${totalPrice}`);
    } catch (e) {
      console.error(e);
      alert('주문 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-sage-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-6 h-6 text-sage-700" />
            <h1 className="text-base font-bold text-sage-900 leading-tight">상록수커피클럽</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/info')}
              className="p-2 rounded-full hover:bg-sage-50 transition-colors"
              aria-label="부스 안내"
            >
              <Info className="w-5 h-5 text-sage-600" />
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-sage-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-sage-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-sage-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 pb-32">
        {/* Hero */}
        <div className="mt-4 mb-5 rounded-2xl bg-gradient-to-r from-sage-800 to-sage-500 p-6 text-white">
          <p className="text-sage-200 text-sm font-medium mb-1">상록수커피클럽</p>
          <h2 className="text-2xl font-bold">음료를 고르고<br />토스로 결제하면</h2>
          <p className="text-sage-200 text-sm mt-2">준비되는 동안 실시간으로 알려드려요</p>
        </div>

        {/* 10잔 제한 안내 */}
        {isAtLimit && (
          <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700 font-medium text-center">
            10잔 이상 주문은 카운터로 문의해주세요
          </div>
        )}

        {/* Menu */}
        <div className="grid grid-cols-1 gap-4">
          {MENU.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              getOptionQty={(opt) => getOptionQty(item.id, opt)}
              onAdd={(opt) => addToCart(item, opt)}
              onRemove={(opt) => decrementCart(`${item.id}-${opt}`)}
              isAtLimit={isAtLimit}
            />
          ))}
        </div>
      </main>

      {/* Sticky cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-sage-100 shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-sage-600 hover:bg-sage-700 active:bg-sage-800 text-white rounded-2xl py-5 px-5 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-3">
                <span className="bg-sage-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                  {totalItems}
                </span>
                <span className="font-bold text-base">장바구니 보기</span>
              </span>
              <span className="font-bold text-base">{totalPrice.toLocaleString('ko-KR')}원</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-sage-100">
              <h2 className="text-lg font-bold text-sage-900">장바구니</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-3">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">장바구니가 비어있습니다</p>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onIncrement={incrementCart}
                      onDecrement={decrementCart}
                      onDelete={deleteFromCart}
                    />
                  ))}
                  {isAtLimit && (
                    <p className="text-xs text-orange-600 text-center mt-3 font-medium">
                      최대 10잔까지 담을 수 있습니다
                    </p>
                  )}
                </>
              )}
            </div>
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-sage-100 bg-sage-50/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-medium">총 금액</span>
                  <span className="text-xl font-bold text-sage-800">
                    {totalPrice.toLocaleString('ko-KR')}원
                  </span>
                </div>
                <button
                  onClick={handleOrderClick}
                  className="w-full bg-sage-600 hover:bg-sage-700 active:bg-sage-800 text-white rounded-2xl py-5 font-bold text-base transition-colors"
                >
                  주문하기 ({totalItems}잔)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Name modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { if (!isOrdering) setShowNameModal(false); }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coffee className="w-6 h-6 text-sage-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">이름을 알려주세요</h2>
              <p className="text-sm text-gray-500 mt-1">음료 준비 시 이름으로 불러드려요</p>
            </div>
            <input
              type="text"
              value={customerName}
              onChange={(e) => { setCustomerName(e.target.value); setNameError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmOrder(); }}
              placeholder="이름 입력 (최대 5자)"
              maxLength={5}
              autoFocus
              className="w-full border-2 border-sage-200 focus:border-sage-500 rounded-xl px-4 py-4 text-base text-gray-800 placeholder-gray-400 outline-none transition-colors text-center font-semibold"
            />
            {nameError && (
              <p className="text-red-500 text-xs text-center mt-1.5">{nameError}</p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowNameModal(false)}
                disabled={isOrdering}
                className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={isOrdering || !customerName.trim()}
                className="flex-1 py-4 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm transition-colors disabled:bg-sage-300 flex items-center justify-center gap-2"
              >
                {isOrdering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    주문 중...
                  </>
                ) : '주문하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

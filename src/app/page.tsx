'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MenuItem as MenuItemType, CartItem } from '@/types';
import MenuItemCard from '@/components/MenuItem';
import CartItemCard from '@/components/CartItem';
import { ShoppingCart, Coffee, X } from 'lucide-react';
import { createOrder } from '@/lib/orders';

const SAMPLE_MENU: MenuItemType[] = [
  { id: '1', name: '아메리카노', price: 3000, description: '깔끔하고 진한 에스프레소와 물의 조화', category: '커피' },
  { id: '2', name: '카페 라떼', price: 4000, description: '부드러운 우유와 에스프레소의 완벽한 블렌드', category: '커피' },
  { id: '3', name: '카푸치노', price: 4500, description: '풍성한 우유 거품이 올라간 클래식 커피', category: '커피' },
  { id: '4', name: '콜드 브루', price: 4500, description: '12시간 저온 추출로 만든 부드러운 커피', category: '커피' },
  { id: '5', name: '녹차 라떼', price: 4500, description: '국내산 녹차 파우더와 우유의 건강한 만남', category: '논커피' },
  { id: '6', name: '카라멜 마키아또', price: 5000, description: '달콤한 카라멜 시럽과 에스프레소', category: '커피' },
];

export default function HomePage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItemType[]>(SAMPLE_MENU);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/menu');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMenuItems(data);
          }
        }
      } catch {
        // fallback to sample menu already set
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const addToCart = useCallback((item: MenuItemType) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter(c => c.id !== itemId);
      }
      return prev.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
    });
  }, []);

  const deleteFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(c => c.id !== itemId));
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getQuantity = (itemId: string) => {
    return cart.find(c => c.id === itemId)?.quantity ?? 0;
  };

  const handleOrder = async () => {
    if (cart.length === 0) return;
    setIsOrdering(true);
    try {
      const orderId = `order-${Date.now()}`;
      const items = cart.map(item => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      await createOrder(orderId, items, totalPrice);
      router.push(`/order/${orderId}?total=${totalPrice}`);
    } catch (e) {
      console.error(e);
      alert('주문 생성에 실패했습니다. Firebase 설정을 확인해 주세요.');
    } finally {
      setIsOrdering(false);
    }
  };

  const categories = Array.from(new Set(menuItems.map(item => item.category || '기타')));

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-amber-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-6 h-6 text-amber-700" />
            <h1 className="text-lg font-bold text-amber-900">커피 주문</h1>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-full hover:bg-amber-50 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-amber-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 pb-32">
        {/* Hero banner */}
        <div className="mt-4 mb-6 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-500 p-6 text-white">
          <p className="text-amber-200 text-sm font-medium mb-1">오늘의 커피</p>
          <h2 className="text-2xl font-bold">원하는 음료를<br />선택해주세요</h2>
          <p className="text-amber-200 text-xs mt-2">신선한 원두로 매일 아침 로스팅합니다</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {categories.map(category => (
              <div key={category} className="mb-6">
                <h2 className="text-base font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
                  {category}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {menuItems
                    .filter(item => (item.category || '기타') === category)
                    .map(item => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        quantity={getQuantity(item.id)}
                        onAdd={addToCart}
                        onRemove={removeFromCart}
                      />
                    ))}
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      {/* Sticky cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-amber-100 shadow-lg safe-area-pb">
          <div className="max-w-2xl mx-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-2xl py-4 px-5 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-3">
                <span className="bg-amber-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-amber-100">
              <h2 className="text-lg font-bold text-amber-900">장바구니</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Cart items */}
            <div className="overflow-y-auto flex-1 px-5 py-3">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">장바구니가 비어있습니다</p>
                </div>
              ) : (
                <div>
                  {cart.map(item => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onAdd={addToCart}
                      onRemove={removeFromCart}
                      onDelete={deleteFromCart}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-amber-100 bg-amber-50/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-medium">총 금액</span>
                  <span className="text-xl font-bold text-amber-800">
                    {totalPrice.toLocaleString('ko-KR')}원
                  </span>
                </div>
                <button
                  onClick={handleOrder}
                  disabled={isOrdering}
                  className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:bg-amber-300 text-white rounded-2xl py-4 font-bold text-base transition-colors flex items-center justify-center gap-2"
                >
                  {isOrdering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      주문 중...
                    </>
                  ) : (
                    `주문하기 (${totalItems}잔)`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

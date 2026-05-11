'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CartItem, MenuItem, MenuOption } from '@/types';
import { getFlavorColor } from '@/lib/flavor';
import MenuItemCard from '@/components/MenuItem';
import CartItemCard from '@/components/CartItem';
import { ShoppingCart, X, Info, Plus, Minus, Check, Clock } from 'lucide-react';
import { createOrder, getOrderStatus, subscribeToWaitQueueCount, calcWaitTimeText, QueueCounts } from '@/lib/orders';
import { MENU } from '@/lib/menu';
import { getCart, saveCart } from '@/lib/cart';
import { getActiveOrders, addActiveOrder, removeActiveOrder, ActiveOrderInfo } from '@/lib/activeOrder';
import Image from 'next/image';
import Link from 'next/link';


const MAX_ITEMS = 10;
const OPTION_LABEL: Record<MenuOption, string> = { hot: '핫 8oz', ice: '아이스 14oz' };

export default function HomePage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [nameError, setNameError] = useState('');

  const [activeOrders, setActiveOrders] = useState<ActiveOrderInfo[]>([]);
  const [showActiveOrders, setShowActiveOrders] = useState(false);
  const [waitQueueCounts, setWaitQueueCounts] = useState<QueueCounts>({ hangsang: 0, pureun: 0, namu: 0 });
  const [showA2HS, setShowA2HS] = useState(false);

  // 메뉴 상세 모달 상태
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [modalOption, setModalOption] = useState<MenuOption>('ice');
  const [addQty, setAddQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // 드래그로 닫기를 위한 refs (DOM 직접 조작으로 60fps 애니메이션)
  const cartSheetRef = useRef<HTMLDivElement>(null);
  const menuSheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragCurrentY = useRef(0);

  useEffect(() => {
    const unsubscribe = subscribeToWaitQueueCount(setWaitQueueCounts);
    return unsubscribe;
  }, []);

  // iOS Safari이고 standalone(홈 화면 앱)이 아닐 때 홈 화면 추가 배너 표시
  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isStandalone = ('standalone' in navigator) && (navigator as Navigator & { standalone?: boolean }).standalone;
    const dismissed = sessionStorage.getItem('a2hs_dismissed');
    if (isIOS && !isStandalone && !dismissed) setShowA2HS(true);
  }, []);

  useEffect(() => {
    setCart(getCart());
    const stored = getActiveOrders();
    if (stored.length === 0) return;
    Promise.all(
      stored.map(async (o) => {
        const status = await getOrderStatus(o.orderId);
        if (!status || status === 'picked_up' || status === 'cancelled') {
          removeActiveOrder(o.orderId);
          return null;
        }
        return o;
      })
    ).then((results) => {
      setActiveOrders(results.filter((o): o is ActiveOrderInfo => o !== null));
    });
  }, []);

  // 모달 열릴 때 배경 스크롤 방지 (non-passive touchmove로 iOS 대응)
  // data-scroll-allow 속성이 있는 시트 내부 스크롤 영역은 허용
  useEffect(() => {
    const isOpen = isCartOpen || !!selectedMenu;
    if (!isOpen) return;
    const prevent = (e: TouchEvent) => {
      if ((e.target as Element).closest('[data-scroll-allow]')) return;
      e.preventDefault();
    };
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, [isCartOpen, selectedMenu]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isAtLimit = totalItems >= MAX_ITEMS;
  const remainingSlots = MAX_ITEMS - totalItems;

  const updateCart = useCallback((next: CartItem[]) => {
    setCart(next);
    saveCart(next);
  }, []);

  const incrementCart = useCallback((cartId: string) => {
    setCart((prev) => {
      if (prev.reduce((s, c) => s + c.quantity, 0) >= MAX_ITEMS) return prev;
      const next = prev.map((c) => c.id === cartId ? { ...c, quantity: c.quantity + 1 } : c);
      saveCart(next);
      return next;
    });
  }, []);

  const decrementCart = useCallback((cartId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === cartId);
      if (!existing) return prev;
      const next = existing.quantity <= 1
        ? prev.filter((c) => c.id !== cartId)
        : prev.map((c) => c.id === cartId ? { ...c, quantity: c.quantity - 1 } : c);
      saveCart(next);
      return next;
    });
  }, []);

  const deleteFromCart = useCallback((cartId: string) => {
    setCart((prev) => {
      const next = prev.filter((c) => c.id !== cartId);
      saveCart(next);
      return next;
    });
  }, []);

  const getMenuCartQty = (menuId: string): number =>
    cart.filter((c) => c.menuId === menuId).reduce((s, c) => s + c.quantity, 0);

  // 장바구니 드로어 열릴 때 히스토리 엔트리 push → 뒤로가기 제스처로 닫기 가능
  useEffect(() => {
    if (!isCartOpen) return;
    window.history.pushState({ modal: 'cart' }, '');
    const handlePopState = () => setIsCartOpen(false);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isCartOpen]);

  const closeCart = useCallback(() => {
    if (window.history.state?.modal === 'cart') {
      window.history.back();
    } else {
      setIsCartOpen(false);
    }
  }, []);

  // 드래그로 닫기 핸들러 생성 (ref 직접 조작 → React 리렌더 없이 부드러운 애니메이션)
  function makeDragHandlers(
    sheetRef: { current: HTMLDivElement | null },
    onClose: () => void,
  ) {
    return {
      onTouchStart(e: React.TouchEvent) {
        dragStartY.current = e.touches[0].clientY;
        dragCurrentY.current = 0;
        if (sheetRef.current) sheetRef.current.style.transition = 'none';
      },
      onTouchMove(e: React.TouchEvent) {
        const delta = e.touches[0].clientY - dragStartY.current;
        if (delta < 0) return;
        dragCurrentY.current = delta;
        if (sheetRef.current) sheetRef.current.style.transform = `translateY(${delta}px)`;
      },
      onTouchEnd() {
        if (!sheetRef.current) return;
        sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
        if (dragCurrentY.current > 120) {
          sheetRef.current.style.transform = 'translateY(100%)';
          setTimeout(onClose, 280);
        } else {
          sheetRef.current.style.transform = 'translateY(0)';
        }
        dragCurrentY.current = 0;
      },
    };
  }

  const cartDrag = makeDragHandlers(cartSheetRef, closeCart);
  const menuDrag = makeDragHandlers(menuSheetRef, () => {
    if (window.history.state?.modal === 'menu') window.history.back();
    else setSelectedMenu(null);
  });

  // 메뉴 바텀시트 열릴 때 히스토리 엔트리 push → 뒤로가기 제스처로 닫기 가능
  useEffect(() => {
    if (!selectedMenu) return;
    window.history.pushState({ modal: 'menu' }, '');
    const handlePopState = () => {
      setSelectedMenu(null);
      setJustAdded(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedMenu]);

  const openMenuModal = useCallback((item: MenuItem) => {
    setSelectedMenu(item);
    setModalOption(item.availableOptions[0]);
    setAddQty(1);
    setJustAdded(false);
  }, []);

  const closeMenuModal = useCallback(() => {
    if (justAdded) return;
    if (window.history.state?.modal === 'menu') {
      window.history.back();
    } else {
      setSelectedMenu(null);
    }
  }, [justAdded]);

  // 모달에서 담기
  const handleModalAdd = useCallback(() => {
    if (!selectedMenu || isAtLimit) return;
    const cartId = `${selectedMenu.id}-${modalOption}`;
    const displayName = `${selectedMenu.name} (${modalOption === 'hot' ? '핫' : '아이스'})`;
    const actualAdd = Math.min(addQty, remainingSlots);

    setCart((prev) => {
      const existing = prev.find((c) => c.id === cartId);
      const next = existing
        ? prev.map((c) => c.id === cartId ? { ...c, quantity: c.quantity + actualAdd } : c)
        : [...prev, { id: cartId, menuId: selectedMenu.id, name: displayName, price: selectedMenu.price, quantity: actualAdd, option: modalOption }];
      saveCart(next);
      return next;
    });

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setAddQty(1);
      if (window.history.state?.modal === 'menu') {
        window.history.back();
      } else {
        setSelectedMenu(null);
      }
    }, 800);
  }, [selectedMenu, modalOption, addQty, isAtLimit, remainingSlots]);

  const handleOrderClick = () => {
    if (cart.length === 0) return;
    closeCart();
    setCustomerName('');
    setNameError('');
    setShowNameModal(true);
  };

  const handleConfirmOrder = async () => {
    const trimmed = customerName.trim();
    if (!trimmed) { setNameError('입금자명을 입력해주세요'); return; }
    if (trimmed.length > 5) { setNameError('이름은 5자 이하로 입력해주세요'); return; }
    setNameError('');
    setIsOrdering(true);
    try {
      const items = cart.map((item) => ({
        menuItemId: item.menuId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        option: item.option,
      }));
      const orderId = await createOrder(trimmed, items, totalPrice);
      addActiveOrder({ orderId, total: totalPrice, name: trimmed });
      setActiveOrders((prev) => [...prev, { orderId, total: totalPrice, name: trimmed, createdAt: new Date().toISOString() }]);
      setShowNameModal(false);
      updateCart([]);
      router.push(`/order/${orderId}?total=${totalPrice}&name=${encodeURIComponent(trimmed)}`);
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
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-14 grid grid-cols-[80px_1fr_80px] items-center">
          <div className="flex items-center justify-start w-20"></div>
          <button onClick={() => { window.location.href = '/'; }} className="flex items-center gap-1 justify-self-center shrink-0">
            <Image src="/logo-nav.png" alt="상록수커피클럽" width={40} height={40} className="object-contain" />
            <h1 className="text-base font-bold text-sage-900 leading-tight">상록수커피클럽</h1>
          </button>
          <div className="flex items-center justify-end gap-1 w-20">
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

      {/* Main */}
      <main className="max-w-md mx-auto px-4 pb-24">
        {/* iOS 홈 화면 추가 안내 배너 */}
        {showA2HS && (
          <div className="mt-3 bg-sage-700 text-white rounded-2xl px-4 py-3 flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">📲</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">홈 화면에 추가하면 알림을 받을 수 있어요</p>
              <p className="text-xs text-sage-200 mt-0.5">Safari 하단 공유 버튼 → <span className="font-semibold text-white">홈 화면에 추가</span></p>
            </div>
            <button
              onClick={() => { sessionStorage.setItem('a2hs_dismissed', '1'); setShowA2HS(false); }}
              className="shrink-0 text-sage-300 hover:text-white p-1 -mr-1"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 진행 중인 주문 배너 */}
        {activeOrders.length === 1 && (
          <Link
            href={`/track/${activeOrders[0].orderId}`}
            className="mt-4 flex items-center justify-between gap-3 bg-sage-800 text-white rounded-2xl px-4 py-3.5 shadow-md active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sage-600 rounded-full flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-sage-300 font-medium">진행 중인 주문</p>
                <p className="text-sm font-bold">{activeOrders[0].name}님 · {activeOrders[0].total.toLocaleString('ko-KR')}원</p>
              </div>
            </div>
            <span className="text-xs text-sage-300 shrink-0">현황 보기 →</span>
          </Link>
        )}
        {activeOrders.length > 1 && (
          <div className="mt-4 bg-sage-800 text-white rounded-2xl shadow-md overflow-hidden">
            <button
              onClick={() => setShowActiveOrders((v) => !v)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 active:bg-sage-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sage-600 rounded-full flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-sage-300 font-medium">진행 중인 주문</p>
                  <p className="text-sm font-bold">{activeOrders.length}건 진행 중</p>
                </div>
              </div>
              <span className="text-xs text-sage-300 shrink-0">{showActiveOrders ? '접기 ↑' : '보기 ↓'}</span>
            </button>
            {showActiveOrders && (
              <div className="border-t border-sage-700 divide-y divide-sage-700">
                {activeOrders.map((o) => (
                  <Link
                    key={o.orderId}
                    href={`/track/${o.orderId}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-sage-700 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold">{o.name}님</p>
                      <p className="text-xs text-sage-300">{o.orderId} · {o.total.toLocaleString('ko-KR')}원</p>
                    </div>
                    <span className="text-xs text-sage-300 shrink-0">현황 보기 →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hero */}
        <div className="mt-3 mb-3 rounded-2xl bg-gradient-to-r from-sage-700 to-sage-600 p-4 text-white flex items-center gap-4">
          <Image src="/logo.png" alt="상록수커피클럽" width={56} height={56} className="rounded-full shrink-0 border-2 border-white/30" />
          <div>
            <p className="text-white/70 text-xs font-medium mb-0.5">상록수커피클럽</p>
            <h2 className="text-lg font-bold leading-snug">음료를 고르고 결제하면 끝!</h2>
            <p className="text-white/70 text-xs mt-1">준비되는 동안 실시간으로 알려드려요</p>
          </div>
        </div>

        {isAtLimit && (
          <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700 font-medium text-center">
            장바구니가 가득 찼어요 (최대 10잔) · 10잔 초과 주문은 카운터로 문의해주세요
          </div>
        )}

        {/* Gallery grid */}
        <div className="grid grid-cols-2 gap-3">
          {MENU.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              cartQty={getMenuCartQty(item.id)}
              onPress={() => openMenuModal(item)}
            />
          ))}
        </div>
      </main>

      {/* Sticky cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-md mx-auto px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
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

      {/* 메뉴 상세 바텀시트 / 데스크탑 센터 모달 */}
      {selectedMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:items-center lg:justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeMenuModal}
          />
          <div ref={menuSheetRef} className="relative bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl h-[100dvh] lg:h-[85vh] lg:w-full lg:max-w-lg flex flex-col overflow-hidden">
            <div
              className="flex justify-center pt-4 pb-3 shrink-0 touch-none lg:hidden"
              onTouchStart={menuDrag.onTouchStart}
              onTouchMove={menuDrag.onTouchMove}
              onTouchEnd={menuDrag.onTouchEnd}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* 스크롤 영역 */}
            <div data-scroll-allow className="overflow-y-auto flex-1">
              <div className="w-full aspect-square relative overflow-hidden">
                {selectedMenu.image ? (
                  <Image
                    src={selectedMenu.image}
                    alt={selectedMenu.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 512px"
                    className="object-cover"
                  />
                ) : selectedMenu.name === '나무' ? (
                  <div className="w-full h-full bg-gradient-to-br from-sage-600 to-sage-400 flex items-center justify-center">
                    <div className="relative w-40 h-40">
                      <Image src="/logo.png" alt="상록수커피클럽" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain scale-90"/>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-sage-600 to-sage-400 flex items-center justify-center">
                    <span className="text-8xl">☕</span>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 pb-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{selectedMenu.name}</h2>
                  {selectedMenu.category && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">{selectedMenu.category}</span>
                  )}
                </div>
                <p className="text-sage-600 font-bold text-lg mb-3">{selectedMenu.price.toLocaleString('ko-KR')}원</p>

                {/* 컵 노트 — 가격 바로 아래 */}
                {selectedMenu.cupNotes && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 font-semibold mb-2">컵 노트</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMenu.cupNotes.split(',').map((note) => {
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
                {(selectedMenu.beanBrand || selectedMenu.origins) && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3.5 mb-3">
                    <p className="text-xs text-gray-500 font-semibold mb-2">원두</p>
                    {selectedMenu.beanBrand && (
                      <p className="text-sm font-bold text-gray-900 mb-2">{selectedMenu.beanBrand}</p>
                    )}
                    {selectedMenu.origins && (
                      <div className="space-y-2">
                        {selectedMenu.origins.map((o) => (
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

                {selectedMenu.description && (
                  <p className="text-gray-400 text-sm mb-2 leading-relaxed">{selectedMenu.description}</p>
                )}
                {selectedMenu.intro && (
                  <p className="text-gray-500 text-sm leading-relaxed">{selectedMenu.intro}</p>
                )}
              </div>
            </div>

            {/* 고정 하단 CTA */}
            <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-white pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {selectedMenu.availableOptions.length > 1 && (
                <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-3">
                  {selectedMenu.availableOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setModalOption(opt)}
                      className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                        modalOption === opt
                          ? 'bg-sage-600 text-white'
                          : 'bg-white text-gray-500 hover:bg-sage-50'
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
                    onClick={() => setAddQty((q) => Math.max(q - 1, 1))}
                    disabled={addQty <= 1}
                    className="w-11 h-12 flex items-center justify-center text-sage-700 hover:bg-sage-50 disabled:text-gray-300 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sage-800 text-base">{addQty}</span>
                  <button
                    onClick={() => setAddQty((q) => Math.min(q + 1, Math.max(remainingSlots, 1)))}
                    disabled={isAtLimit || addQty >= remainingSlots}
                    className="w-11 h-12 flex items-center justify-center text-sage-700 hover:bg-sage-50 disabled:text-gray-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleModalAdd}
                  disabled={isAtLimit || justAdded}
                  className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                    justAdded
                      ? 'bg-sage-100 text-sage-700 border-2 border-sage-300'
                      : 'bg-sage-600 hover:bg-sage-700 active:bg-sage-800 text-white disabled:bg-gray-200 disabled:text-gray-400'
                  }`}
                >
                  {justAdded ? (
                    <><Check className="w-4 h-4" /> 담겼습니다</>
                  ) : (
                    <><Plus className="w-4 h-4" /> 장바구니에 담기</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 장바구니 드로어 */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:items-center lg:justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />
          <div ref={cartSheetRef} className="relative bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl max-h-[80vh] lg:max-h-[70vh] lg:w-full lg:max-w-md flex flex-col">
            <div
              className="flex justify-center pt-4 pb-3 touch-none lg:hidden"
              onTouchStart={cartDrag.onTouchStart}
              onTouchMove={cartDrag.onTouchMove}
              onTouchEnd={cartDrag.onTouchEnd}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-sage-900">장바구니</h2>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div data-scroll-allow className="overflow-y-auto flex-1 px-5 py-3">
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
                    <div className="text-center mt-3 space-y-0.5">
                      <p className="text-xs text-orange-600 font-medium">최대 10잔까지 담을 수 있습니다</p>
                      <p className="text-xs text-gray-400">단체 주문은 부스 카운터에서 문의해주세요</p>
                    </div>
                  )}
                </>
              )}
            </div>
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 mb-3">
                  <Clock className="w-4 h-4 text-sage-600 shrink-0" />
                  <span className="text-xs text-sage-700 font-medium">예상 대기</span>
                  <span className="text-xs font-bold text-sage-900 ml-auto">
                    {calcWaitTimeText(waitQueueCounts, {
                      hangsang: cart.filter(c => c.menuId === 'hangsang').reduce((s, c) => s + c.quantity, 0),
                      pureun:   cart.filter(c => c.menuId === 'pureun').reduce((s, c) => s + c.quantity, 0),
                      namu:     cart.filter(c => c.menuId === 'namu').reduce((s, c) => s + c.quantity, 0),
                    })}
                  </span>
                </div>
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

      {/* 실명 입력 모달 */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { if (!isOrdering) setShowNameModal(false); }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-5">
              <div className="mx-auto mb-3 w-14 h-14">
                <Image src="/logo.png" alt="상록수커피클럽" width={56} height={56} className="rounded-full" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">입금자명을 입력해주세요</h2>
              <p className="text-sm text-gray-500 mt-1">토스 송금 시 입력한 이름과 동일하게 입력해주세요</p>
            </div>
            <input
              type="text"
              value={customerName}
              onChange={(e) => { setCustomerName(e.target.value); setNameError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmOrder(); }}
              placeholder="입금자명 입력"
              maxLength={8}
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

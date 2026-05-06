'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Coffee, CheckCircle2, Smartphone, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { subscribeToOrder } from '@/lib/orders';
import { OrderStatus } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

const BANK_NAMES: Record<string, string> = {
  '002': '산업은행', '003': '기업은행', '004': '국민은행', '007': '수협은행',
  '011': '농협은행', '020': '우리은행', '023': 'SC제일은행', '027': '씨티은행',
  '031': '대구은행', '032': '부산은행', '034': '광주은행', '035': '제주은행',
  '037': '전북은행', '039': '경남은행', '045': '새마을금고', '048': '신협',
  '071': '우체국', '081': '하나은행', '088': '신한은행', '089': '케이뱅크',
  '090': '카카오뱅크', '092': '토스뱅크',
};

function buildTossUrl(amount: number, memo: string): string {
  const bankCode = process.env.NEXT_PUBLIC_TOSS_BANK_CODE ?? '';
  const account = process.env.NEXT_PUBLIC_TOSS_ACCOUNT_NO ?? '';
  if (!bankCode || !account) return 'supertoss://';
  const bankName = BANK_NAMES[bankCode] ?? bankCode;
  return `supertoss://send?bank=${encodeURIComponent(bankName)}&accountNo=${account}&amount=${amount}&memo=${encodeURIComponent(memo)}`;
}

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

type PayMethod = 'toss' | 'other' | 'cash';

export default function OrderPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const total = parseInt(searchParams.get('total') ?? '0');
  const customerName = searchParams.get('name') ?? '';

  const [status, setStatus] = useState<OrderStatus>('pending');
  const [isPaid, setIsPaid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>('toss');
  const [copied, setCopied] = useState(false);

  const accountNo = process.env.NEXT_PUBLIC_TOSS_ACCOUNT_NO ?? '';
  const bankCode = process.env.NEXT_PUBLIC_TOSS_BANK_CODE ?? '';
  const holder = process.env.NEXT_PUBLIC_TOSS_HOLDER ?? '';
  const bankName = BANK_NAMES[bankCode] ?? bankCode;

  useEffect(() => { setIsMobile(isMobileDevice()); }, []);

  useEffect(() => {
    const unsubscribe = subscribeToOrder(id, (order) => {
      setStatus(order.status);
      if (order.status !== 'pending') {
        setIsPaid(true);
        setTimeout(() => router.push(`/track/${id}`), 1500);
      }
    });
    return unsubscribe;
  }, [id, router]);

  const tossUrl = buildTossUrl(total, customerName);

  const handleOpenToss = useCallback(() => {
    window.location.href = tossUrl;
  }, [tossUrl]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(accountNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [accountNo]);

  const PAY_TABS: { key: PayMethod; label: string }[] = [
    { key: 'toss', label: '토스' },
    { key: 'other', label: '타행앱' },
    { key: 'cash', label: '현금' },
  ];

  return (
    <div className="min-h-screen bg-sage-50 flex flex-col">
      <header className="bg-white border-b border-sage-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-sage-700" />
            <h1 className="text-base font-bold text-sage-900">결제</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8 max-w-md mx-auto w-full gap-4">
        {isPaid ? (
          <div className="text-center animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">결제 확인 완료!</h2>
            <p className="text-gray-500 text-sm">주문 상태 페이지로 이동합니다...</p>
            <div className="mt-4 flex justify-center">
              <div className="w-5 h-5 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        ) : (
          <>
            {/* 주문 요약 */}
            <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-5 w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-sage-100 rounded-full flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-sage-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">주문번호</p>
                  <p className="font-mono text-sm font-semibold text-gray-800">#{id}</p>
                </div>
              </div>
              {total > 0 && (
                <div className="flex justify-between items-center pt-4 border-t border-sage-50">
                  <span className="text-gray-600 text-sm font-medium">결제 금액</span>
                  <span className="font-bold text-sage-800 text-2xl">{total.toLocaleString('ko-KR')}원</span>
                </div>
              )}
            </div>

            {/* 결제 수단 탭 */}
            <div className="flex rounded-2xl overflow-hidden border border-sage-200 w-full bg-white">
              {PAY_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPayMethod(key)}
                  className={`flex-1 py-3 text-sm font-bold transition-colors ${
                    payMethod === key
                      ? 'bg-sage-600 text-white'
                      : 'text-gray-500 hover:bg-sage-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 토스 */}
            {payMethod === 'toss' && (
              <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 w-full flex flex-col items-center gap-4">
                <div className="text-center">
                  <h2 className="text-base font-bold text-sage-900">토스로 송금하기</h2>
                  <p className="text-xs text-gray-400 mt-1">QR을 스캔하면 금액이 자동으로 입력됩니다</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border-2 border-sage-200 shadow-inner">
                  <QRCodeSVG value={tossUrl} size={220} fgColor="#577050" bgColor="#ffffff" level="M" />
                </div>
                {isMobile && (
                  <button
                    onClick={handleOpenToss}
                    className="w-full flex items-center justify-center gap-2.5 bg-sage-600 hover:bg-sage-700 active:bg-sage-800 text-white rounded-2xl py-4 font-bold text-base transition-colors"
                  >
                    <Smartphone className="w-5 h-5" />
                    토스 앱으로 바로 송금
                  </button>
                )}
                <p className="text-xs text-gray-400 text-center">송금 후 스태프가 확인하면 자동으로 진행됩니다</p>
              </div>
            )}

            {/* 타행앱 */}
            {payMethod === 'other' && (
              <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 w-full flex flex-col gap-4">
                <div className="text-center">
                  <h2 className="text-base font-bold text-sage-900">계좌이체</h2>
                  <p className="text-xs text-gray-400 mt-1">아래 계좌로 정확한 금액을 이체해주세요</p>
                </div>
                <div className="bg-sage-50 rounded-xl px-4 py-4 flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">은행</span>
                    <span className="font-bold text-gray-800">{bankName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">예금주</span>
                    <span className="font-bold text-gray-800">{holder}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">계좌번호</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 font-mono">{accountNo}</span>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg bg-white border border-sage-200 hover:bg-sage-50 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-sage-600" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-sage-200">
                    <span className="text-gray-500">이체 금액</span>
                    <span className="font-bold text-sage-700 text-base">{total.toLocaleString('ko-KR')}원</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">이체 후 스태프가 확인하면 자동으로 진행됩니다</p>
              </div>
            )}

            {/* 현금 */}
            {payMethod === 'cash' && (
              <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 w-full flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">💵</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">카운터에서 결제해주세요</h2>
                  <p className="text-sm text-gray-500 mt-1">현금으로 직접 결제 후<br />스태프가 확인해드립니다</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 w-full">
                  <p className="text-sm font-bold text-amber-800">{total.toLocaleString('ko-KR')}원</p>
                  <p className="text-xs text-amber-600 mt-0.5">정확한 금액을 준비해주세요</p>
                </div>
                <p className="text-xs text-gray-400">결제 완료 후 스태프가 주문을 진행합니다</p>
              </div>
            )}

            {/* 대기 중 인디케이터 */}
            <div className="flex items-center gap-2 text-sage-600">
              <div className="w-4 h-4 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold">스태프 확인 대기 중...</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

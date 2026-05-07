'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Heart, Star } from 'lucide-react';
import Image from 'next/image';

interface Props {
  params: Promise<{ id: string }>;
}

export default function CompletePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-sage-100 flex flex-col">
      <header className="bg-white/70 backdrop-blur-sm border-b border-sage-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
          <Image src="/logo-nav.png" alt="상록수커피클럽" width={40} height={40} className="object-contain" />
          <h1 className="text-base font-bold text-sage-900">수령 완료</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6 max-w-md mx-auto w-full">
        <div className="relative mb-5">
          <div className="w-24 h-24 bg-sage-600 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-5xl">☕</span>
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-400 rounded-full flex items-center justify-center shadow-md animate-bounce">
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <div className="absolute top-0 -left-3 w-5 h-5 bg-sage-400 rounded-full flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: '0.2s' }}>
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-sage-900 text-center mb-1">맛있게 드세요!</h2>
        <p className="text-gray-500 text-center text-sm mb-5">항상 최고의 커피를 위해 노력하겠습니다</p>

        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm px-5 py-3 w-full mb-4 text-center">
          <p className="text-xs text-gray-500 mb-0.5">완료된 주문번호</p>
          <p className="font-mono text-sm font-semibold text-gray-700">{id}</p>
        </div>

        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-4 w-full mb-4">
          <p className="text-sm font-semibold text-gray-700 text-center mb-4">오늘 커피는 어떠셨나요?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setSelected(star)}
                className="transition-transform active:scale-90 hover:scale-110"
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    star <= (hovered || selected)
                      ? 'text-sage-500 fill-sage-500'
                      : 'text-gray-200 fill-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
          {selected > 0 && (
            <p className="text-center text-xs text-gray-400 mt-3">
              {['', '아쉬웠어요', '그저 그랬어요', '괜찮았어요', '맛있었어요', '최고였어요!'][selected]}
            </p>
          )}
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full bg-sage-600 hover:bg-sage-700 text-white rounded-xl py-4 font-bold text-base transition-colors shadow-lg"
        >
          새 주문하기
        </button>

        <p className="mt-3 text-xs text-gray-400 text-center">또 오세요! 다음에도 맛있는 커피로 만나요</p>
      </main>
    </div>
  );
}

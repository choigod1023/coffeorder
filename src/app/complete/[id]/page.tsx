'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Heart, Star } from 'lucide-react';

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
          <Coffee className="w-5 h-5 text-sage-700" />
          <h1 className="text-base font-bold text-sage-900">수령 완료</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-sage-600 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-6xl">☕</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-400 rounded-full flex items-center justify-center shadow-md animate-bounce">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="absolute top-0 -left-4 w-6 h-6 bg-sage-400 rounded-full flex items-center justify-center shadow-md animate-bounce" style={{ animationDelay: '0.2s' }}>
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-sage-900 text-center mb-3">맛있게 드세요!</h2>
        <p className="text-gray-600 text-center text-base mb-2">음료를 수령하셨습니다</p>
        <p className="text-gray-400 text-sm text-center mb-8">항상 최고의 커피를 위해 노력하겠습니다</p>

        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm px-6 py-4 w-full mb-8 text-center">
          <p className="text-xs text-gray-500 mb-1">완료된 주문번호</p>
          <p className="font-mono text-sm font-semibold text-gray-700">{id}</p>
        </div>

        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5 w-full mb-6">
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

        <p className="mt-4 text-xs text-gray-400 text-center">또 오세요! 다음에도 맛있는 커피로 만나요</p>
      </main>
    </div>
  );
}

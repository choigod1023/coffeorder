'use client';

import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: '주문접수' },
  { status: 'paid', label: '결제완료' },
  { status: 'preparing', label: '준비중' },
  { status: 'ready', label: '수령가능' },
  { status: 'picked_up', label: '수령완료' },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  paid: 1,
  preparing: 2,
  ready: 3,
  picked_up: 4,
};

interface OrderStatusProps {
  status: OrderStatus;
}

export default function OrderStatusTracker({ status }: OrderStatusProps) {
  const currentIndex = STATUS_INDEX[status];
  const progressPercent = (currentIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-6">
        <div className="absolute top-4 left-0 right-0 h-1 bg-amber-100 rounded-full mx-8">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-700 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between relative">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div key={step.status} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 z-10',
                    isCompleted && 'bg-amber-500 text-white shadow-md',
                    isCurrent && 'bg-amber-600 text-white shadow-lg ring-2 ring-amber-300 scale-110',
                    isPending && 'bg-gray-100 text-gray-400 border border-gray-200'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium text-center leading-tight',
                    isCompleted && 'text-amber-600',
                    isCurrent && 'text-amber-700 font-bold',
                    isPending && 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

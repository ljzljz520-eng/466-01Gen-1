import { Check, Clock, MapPin, Home, Sparkles } from 'lucide-react';
import type { OrderStatus } from '@shared/types';

interface StatusTimelineProps {
  status: OrderStatus;
  departedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

const statusSteps = [
  { key: 'pending', label: '待接单', icon: Clock },
  { key: 'accepted', label: '已接单', icon: Home },
  { key: 'departed', label: '已出发', icon: MapPin },
  { key: 'arrived', label: '已到达', icon: Home },
  { key: 'completed', label: '已完成', icon: Sparkles },
];

export default function StatusTimeline({ status }: StatusTimelineProps) {
  const currentIndex = statusSteps.findIndex(s => s.key === status);
  const isCancelled = status === 'cancelled';

  return (
    <div className="py-4">
      <div className="relative">
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-cream-200">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 transition-all duration-500"
            style={{
              width: isCancelled
                ? `${(currentIndex / (statusSteps.length - 1)) * 100}%`
                : `${(currentIndex / (statusSteps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const isPast = index < currentIndex;
            const isCurrent = index === currentIndex && !isCancelled;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isPast || isCurrent
                      ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg shadow-primary-200'
                      : 'bg-cream-100 text-warmgray-400'
                  } ${isCurrent ? 'scale-110' : ''}`}
                >
                  {isPast ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-primary-400 animate-pulse-ring" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isPast || isCurrent ? 'text-warmgray-700' : 'text-warmgray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isCancelled && (
        <div className="mt-6 p-4 bg-red-50 rounded-2xl text-center">
          <span className="text-red-600 font-medium">订单已取消</span>
        </div>
      )}
    </div>
  );
}

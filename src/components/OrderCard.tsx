import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, PawPrint, Star } from 'lucide-react';
import type { Order } from '@shared/types';
import { SERVICE_TYPE_LABELS, ORDER_STATUS_LABELS } from '@shared/types';

interface OrderCardProps {
  order: Order;
  view?: 'employer' | 'aide';
}

const statusColors: Record<string, string> = {
  pending: 'bg-primary-100 text-primary-700',
  accepted: 'bg-secondary-100 text-secondary-700',
  departed: 'bg-blue-100 text-blue-700',
  arrived: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-warmgray-100 text-warmgray-600',
};

const serviceIcons: Record<string, string> = {
  cleaning: '🧹',
  cooking: '🍳',
  care: '🤝',
};

export default function OrderCard({ order, view = 'employer' }: OrderCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/order/${order.id}`)}
      className="card card-hover cursor-pointer animate-fade-in"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center text-2xl">
            {serviceIcons[order.serviceType]}
          </div>
          <div>
            <h3 className="font-semibold text-warmgray-800">
              {SERVICE_TYPE_LABELS[order.serviceType]}
            </h3>
            <p className="text-sm text-warmgray-500">
              {view === 'employer' && order.aideName
                ? `服务人员：${order.aideName}`
                : view === 'aide'
                ? `雇主：${order.employerName}`
                : '等待接单中'}
            </p>
          </div>
        </div>
        <span className={`tag ${statusColors[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="space-y-2 text-sm text-warmgray-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-warmgray-400" />
          <span className="truncate">{order.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-warmgray-400" />
          <span>{order.date} · {order.duration}小时</span>
        </div>
        {order.hasPet && (
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-warmgray-400" />
            <span className="text-primary-600">有宠物：{order.petType}</span>
          </div>
        )}
      </div>

      {order.requirements && (
        <p className="mt-4 text-sm text-warmgray-500 bg-cream-50 rounded-xl p-3 line-clamp-2">
          {order.requirements}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-cream-100">
        <div className="text-lg font-bold text-primary-600">
          ¥{order.price}
        </div>
        {view === 'aide' && order.status === 'pending' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/order/${order.id}`);
            }}
            className="btn-primary text-sm py-2 px-5"
          >
            立即接单
          </button>
        )}
      </div>
    </div>
  );
}

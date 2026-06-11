export type ServiceType = 'cleaning' | 'cooking' | 'care';

export type OrderStatus = 'pending' | 'accepted' | 'departed' | 'arrived' | 'completed' | 'cancelled';

export type CancelReason = 'employer_reschedule' | 'aide_no_show' | 'weather';

export type UserRole = 'employer' | 'aide';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  rating: number;
  ratingCount: number;
  balance: number;
  createdAt: string;
}

export interface Order {
  id: string;
  employerId: string;
  aideId?: string;
  aideName?: string;
  employerName?: string;
  serviceType: ServiceType;
  address: string;
  date: string;
  duration: number;
  hasPet: boolean;
  petType?: string;
  requirements: string;
  price: number;
  status: OrderStatus;
  cancelReason?: CancelReason;
  cancelNote?: string;
  photos: string[];
  createdAt: string;
  departedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface Review {
  id: string;
  orderId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  content: string;
  createdAt: string;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  cleaning: '保洁服务',
  cooking: '做饭服务',
  care: '陪护服务',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '待接单',
  accepted: '已接单',
  departed: '已出发',
  arrived: '已到达',
  completed: '已完成',
  cancelled: '已取消',
};

export const CANCEL_REASON_LABELS: Record<CancelReason, string> = {
  employer_reschedule: '雇主改时间',
  aide_no_show: '阿姨爽约',
  weather: '天气原因',
};

export const SERVICE_PRICES: Record<ServiceType, number> = {
  cleaning: 60,
  cooking: 80,
  care: 70,
};

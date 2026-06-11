import type { Order, User, Review, ServiceType, OrderStatus, CancelReason } from '@shared/types';

const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || '请求失败');
  }
  return data.data;
}

export const api = {
  orders: {
    list(params?: { role?: string; userId?: string; status?: string }): Promise<Order[]> {
      const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      return request<Order[]>(`/orders${query}`);
    },
    get(id: string): Promise<Order> {
      return request<Order>(`/orders/${id}`);
    },
    create(data: {
      employerId: string;
      serviceType: ServiceType;
      address: string;
      date: string;
      duration: number;
      hasPet: boolean;
      petType?: string;
      requirements: string;
      price: number;
    }): Promise<Order> {
      return request<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    accept(orderId: string, aideId: string): Promise<Order> {
      return request<Order>(`/orders/${orderId}/accept`, {
        method: 'PUT',
        body: JSON.stringify({ aideId }),
      });
    },
    updateStatus(orderId: string, status: OrderStatus, aideId: string): Promise<Order> {
      return request<Order>(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, aideId }),
      });
    },
    addPhotos(orderId: string, aideId: string, photos: string[]): Promise<Order> {
      return request<Order>(`/orders/${orderId}/photos`, {
        method: 'POST',
        body: JSON.stringify({ aideId, photos }),
      });
    },
    cancel(orderId: string, reason: CancelReason, operatorId: string, note?: string): Promise<Order> {
      return request<Order>(`/orders/${orderId}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ reason, operatorId, note }),
      });
    },
  },
  users: {
    get(id: string): Promise<User> {
      return request<User>(`/users/${id}`);
    },
    login(phone: string, role: 'employer' | 'aide'): Promise<User> {
      return request<User>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ phone, role }),
      });
    },
    getReviews(userId: string): Promise<{ reviews: Review[]; rating: number; count: number }> {
      return request<{ reviews: Review[]; rating: number; count: number }>(`/users/${userId}/reviews`);
    },
    addReview(data: {
      orderId: string;
      fromUserId: string;
      toUserId: string;
      rating: number;
      content: string;
    }): Promise<Review> {
      return request<Review>('/users/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
};

export default api;

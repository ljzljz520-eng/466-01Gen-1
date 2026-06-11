import { orderRepository } from '../repositories/orderRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { reviewRepository } from '../repositories/reviewRepository.js';
import type { Order, OrderStatus, CancelReason, ServiceType } from '../../shared/types.js';

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
}

export const orderService = {
  getAllOrders(): Order[] {
    return orderRepository.findAll();
  },

  getOrderById(id: string): Order | null {
    return orderRepository.findById(id);
  },

  getOrdersByEmployer(employerId: string): Order[] {
    return orderRepository.findByEmployerId(employerId);
  },

  getOrdersByAide(aideId: string): Order[] {
    return orderRepository.findByAideId(aideId);
  },

  getPendingOrders(): Order[] {
    return orderRepository.findPending();
  },

  createOrder(params: {
    employerId: string;
    serviceType: ServiceType;
    address: string;
    date: string;
    duration: number;
    hasPet: boolean;
    petType?: string;
    requirements: string;
    price: number;
  }): Order {
    const employer = userRepository.findById(params.employerId);
    if (!employer || employer.role !== 'employer') {
      throw new Error('无效的雇主账户');
    }

    if (employer.balance < params.price) {
      throw new Error('余额不足，请先充值');
    }

    const order = orderRepository.create({
      id: generateId('ord'),
      employerId: params.employerId,
      serviceType: params.serviceType,
      address: params.address,
      date: params.date,
      duration: params.duration,
      hasPet: params.hasPet,
      petType: params.petType,
      requirements: params.requirements,
      price: params.price,
      status: 'pending',
    });

    return order;
  },

  acceptOrder(orderId: string, aideId: string): Order {
    const order = orderRepository.findById(orderId);
    if (!order) {
      throw new Error('订单不存在');
    }
    if (order.status !== 'pending') {
      throw new Error('订单已被接单');
    }

    const aide = userRepository.findById(aideId);
    if (!aide || aide.role !== 'aide') {
      throw new Error('无效的阿姨账户');
    }

    const result = orderRepository.acceptOrder(orderId, aideId);
    if (!result) {
      throw new Error('接单失败');
    }
    return result;
  },

  updateOrderStatus(orderId: string, status: OrderStatus, aideId: string): Order {
    const order = orderRepository.findById(orderId);
    if (!order) {
      throw new Error('订单不存在');
    }
    if (order.aideId !== aideId) {
      throw new Error('无权限操作此订单');
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['accepted', 'cancelled'],
      accepted: ['departed', 'cancelled'],
      departed: ['arrived', 'cancelled'],
      arrived: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new Error(`无法从${order.status}状态变更为${status}`);
    }

    const result = orderRepository.updateStatus(orderId, status);
    if (!result) {
      throw new Error('状态更新失败');
    }

    if (status === 'completed') {
      userRepository.updateBalance(aideId, order.price);
    }

    return result;
  },

  addPhotos(orderId: string, aideId: string, photos: string[]): Order {
    const order = orderRepository.findById(orderId);
    if (!order) {
      throw new Error('订单不存在');
    }
    if (order.aideId !== aideId) {
      throw new Error('无权限操作此订单');
    }

    const result = orderRepository.addPhotos(orderId, photos);
    if (!result) {
      throw new Error('添加照片失败');
    }
    return result;
  },

  cancelOrder(orderId: string, reason: CancelReason, operatorId: string, note?: string): Order {
    const order = orderRepository.findById(orderId);
    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new Error('订单无法取消');
    }

    const isEmployer = order.employerId === operatorId;
    const isAide = order.aideId === operatorId;

    if (!isEmployer && !isAide) {
      throw new Error('无权限取消此订单');
    }

    if (reason === 'employer_reschedule' && !isEmployer) {
      throw new Error('只有雇主可以选择"雇主改时间"');
    }
    if (reason === 'aide_no_show' && !isEmployer) {
      throw new Error('只有雇主可以选择"阿姨爽约"');
    }

    const result = orderRepository.cancelOrder(orderId, reason, note);
    if (!result) {
      throw new Error('取消失败');
    }

    if (reason === 'employer_reschedule') {
      const fee = Math.floor(order.price * 0.1);
      userRepository.updateBalance(order.employerId, fee - order.price);
      if (order.aideId) {
        userRepository.updateBalance(order.aideId, fee);
      }
    } else if (reason === 'aide_no_show') {
      if (order.aideId) {
        const penalty = Math.floor(order.price * 0.2);
        userRepository.updateBalance(order.aideId, -penalty);
        const { rating, count } = reviewRepository.getAverageRating(order.aideId);
        const newCount = count + 1;
        const newRating = (rating * count + 1) / newCount;
        userRepository.updateRating(order.aideId, Math.round(newRating * 10) / 10, newCount);
      }
    }

    return result;
  },
};

export default orderService;

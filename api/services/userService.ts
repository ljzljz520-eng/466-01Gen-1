import { userRepository } from '../repositories/userRepository.js';
import { reviewRepository } from '../repositories/reviewRepository.js';
import type { User, UserRole } from '../../shared/types.js';

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`;
}

export const userService = {
  getUserById(id: string): User | null {
    return userRepository.findById(id);
  },

  getUserByPhone(phone: string): User | null {
    return userRepository.findByPhone(phone);
  },

  getUsersByRole(role: UserRole): User[] {
    return userRepository.findAllByRole(role);
  },

  createUser(params: { name: string; phone: string; role: UserRole }): User {
    const existing = userRepository.findByPhone(params.phone);
    if (existing) {
      throw new Error('该手机号已注册');
    }

    const prefix = params.role === 'employer' ? 'emp' : 'aide';
    const user = userRepository.create({
      id: generateId(prefix),
      name: params.name,
      phone: params.phone,
      role: params.role,
      rating: 5.0,
      ratingCount: 0,
      balance: params.role === 'employer' ? 1000.0 : 0.0,
    });

    return user;
  },

  getUserReviews(userId: string) {
    const reviews = reviewRepository.findByToUserId(userId);
    const { rating, count } = reviewRepository.getAverageRating(userId);
    return { reviews, rating, count };
  },

  addReview(params: {
    orderId: string;
    fromUserId: string;
    toUserId: string;
    rating: number;
    content: string;
  }) {
    const existing = reviewRepository.findByOrderId(params.orderId);
    if (existing.some(r => r.fromUserId === params.fromUserId)) {
      throw new Error('您已评价过此订单');
    }

    const review = reviewRepository.create({
      id: generateId('rev'),
      orderId: params.orderId,
      fromUserId: params.fromUserId,
      toUserId: params.toUserId,
      rating: params.rating,
      content: params.content,
    });

    const { rating, count } = reviewRepository.getAverageRating(params.toUserId);
    userRepository.updateRating(params.toUserId, Math.round(rating * 10) / 10, count);

    return review;
  },
};

export default userService;

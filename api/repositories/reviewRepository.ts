import { getDb } from '../db/index.js';
import type { Review } from '../../shared/types.js';

function rowToReview(row: any): Review {
  return {
    id: row.id,
    orderId: row.order_id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    rating: row.rating,
    content: row.content || '',
    createdAt: row.created_at,
  };
}

export const reviewRepository = {
  findByToUserId(userId: string): Review[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM reviews WHERE to_user_id = ?
      ORDER BY created_at DESC
    `).all(userId);
    return rows.map(rowToReview);
  },

  findByOrderId(orderId: string): Review[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM reviews WHERE order_id = ?
      ORDER BY created_at DESC
    `).all(orderId);
    return rows.map(rowToReview);
  },

  create(review: Omit<Review, 'createdAt'>): Review {
    const db = getDb();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO reviews (id, order_id, from_user_id, to_user_id, rating, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(review.id, review.orderId, review.fromUserId, review.toUserId, review.rating, review.content || null, now);
    return { ...review, createdAt: now };
  },

  getAverageRating(userId: string): { rating: number; count: number } {
    const db = getDb();
    const row = db.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as count
      FROM reviews WHERE to_user_id = ?
    `).get(userId) as { avg_rating: number | null; count: number };
    
    return {
      rating: row.avg_rating || 5.0,
      count: row.count,
    };
  },
};

export default reviewRepository;

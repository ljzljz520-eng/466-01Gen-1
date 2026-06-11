import { getDb } from '../db/index.js';
import type { User, UserRole } from '../../shared/types.js';

function rowToUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    role: row.role as UserRole,
    avatar: row.avatar || undefined,
    rating: row.rating,
    ratingCount: row.rating_count,
    balance: row.balance,
    createdAt: row.created_at,
  };
}

export const userRepository = {
  findById(id: string): User | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row ? rowToUser(row) : null;
  },

  findByPhone(phone: string): User | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    return row ? rowToUser(row) : null;
  },

  findAllByRole(role: UserRole): User[] {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM users WHERE role = ? ORDER BY rating DESC').all(role);
    return rows.map(rowToUser);
  },

  updateRating(userId: string, newRating: number, ratingCount: number) {
    const db = getDb();
    db.prepare('UPDATE users SET rating = ?, rating_count = ? WHERE id = ?').run(newRating, ratingCount, userId);
  },

  updateBalance(userId: string, amount: number) {
    const db = getDb();
    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, userId);
  },

  create(user: Omit<User, 'createdAt'>): User {
    const db = getDb();
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO users (id, name, phone, role, avatar, rating, rating_count, balance, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(user.id, user.name, user.phone, user.role, user.avatar || null, user.rating, user.ratingCount, user.balance, now);
    return { ...user, createdAt: now };
  },
};

export default userRepository;

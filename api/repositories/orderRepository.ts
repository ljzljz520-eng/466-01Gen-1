import { getDb } from '../db/index.js';
import type { Order, OrderStatus, ServiceType, CancelReason } from '../../shared/types.js';

function rowToOrder(row: any): Order {
  return {
    id: row.id,
    employerId: row.employer_id,
    aideId: row.aide_id || undefined,
    aideName: row.aide_name || undefined,
    employerName: row.employer_name || undefined,
    serviceType: row.service_type as ServiceType,
    address: row.address,
    date: row.date,
    duration: row.duration,
    hasPet: !!row.has_pet,
    petType: row.pet_type || undefined,
    requirements: row.requirements || '',
    price: row.price,
    status: row.status as OrderStatus,
    cancelReason: (row.cancel_reason as CancelReason) || undefined,
    cancelNote: row.cancel_note || undefined,
    photos: row.photos ? JSON.parse(row.photos) : [],
    createdAt: row.created_at,
    departedAt: row.departed_at || undefined,
    arrivedAt: row.arrived_at || undefined,
    completedAt: row.completed_at || undefined,
    cancelledAt: row.cancelled_at || undefined,
  };
}

export const orderRepository = {
  findAll(): Order[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT o.*, e.name as employer_name, a.name as aide_name
      FROM orders o
      LEFT JOIN users e ON o.employer_id = e.id
      LEFT JOIN users a ON o.aide_id = a.id
      ORDER BY o.created_at DESC
    `).all();
    return rows.map(rowToOrder);
  },

  findById(id: string): Order | null {
    const db = getDb();
    const row = db.prepare(`
      SELECT o.*, e.name as employer_name, a.name as aide_name
      FROM orders o
      LEFT JOIN users e ON o.employer_id = e.id
      LEFT JOIN users a ON o.aide_id = a.id
      WHERE o.id = ?
    `).get(id);
    return row ? rowToOrder(row) : null;
  },

  findByEmployerId(employerId: string): Order[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT o.*, e.name as employer_name, a.name as aide_name
      FROM orders o
      LEFT JOIN users e ON o.employer_id = e.id
      LEFT JOIN users a ON o.aide_id = a.id
      WHERE o.employer_id = ?
      ORDER BY o.created_at DESC
    `).all(employerId);
    return rows.map(rowToOrder);
  },

  findByAideId(aideId: string): Order[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT o.*, e.name as employer_name, a.name as aide_name
      FROM orders o
      LEFT JOIN users e ON o.employer_id = e.id
      LEFT JOIN users a ON o.aide_id = a.id
      WHERE o.aide_id = ?
      ORDER BY o.created_at DESC
    `).all(aideId);
    return rows.map(rowToOrder);
  },

  findPending(): Order[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT o.*, e.name as employer_name, a.name as aide_name
      FROM orders o
      LEFT JOIN users e ON o.employer_id = e.id
      LEFT JOIN users a ON o.aide_id = a.id
      WHERE o.status = 'pending'
      ORDER BY o.created_at DESC
    `).all();
    return rows.map(rowToOrder);
  },

  create(order: Omit<Order, 'createdAt' | 'photos' | 'aideName' | 'employerName'> & { photos?: string[] }): Order {
    const db = getDb();
    const now = new Date().toISOString();
    const photos = order.photos ? JSON.stringify(order.photos) : '[]';
    
    const stmt = db.prepare(`
      INSERT INTO orders (
        id, employer_id, service_type, address, date, duration,
        has_pet, pet_type, requirements, price, status, photos, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      order.id,
      order.employerId,
      order.serviceType,
      order.address,
      order.date,
      order.duration,
      order.hasPet ? 1 : 0,
      order.petType || null,
      order.requirements || null,
      order.price,
      order.status,
      photos,
      now
    );
    
    return this.findById(order.id)!;
  },

  acceptOrder(orderId: string, aideId: string): Order | null {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE orders SET aide_id = ?, status = 'accepted'
      WHERE id = ? AND status = 'pending'
    `).run(aideId, orderId);
    return this.findById(orderId);
  },

  updateStatus(orderId: string, status: OrderStatus): Order | null {
    const db = getDb();
    const now = new Date().toISOString();
    
    const updates: string[] = ['status = ?'];
    const params: any[] = [status];
    
    if (status === 'departed') {
      updates.push('departed_at = ?');
      params.push(now);
    } else if (status === 'arrived') {
      updates.push('arrived_at = ?');
      params.push(now);
    } else if (status === 'completed') {
      updates.push('completed_at = ?');
      params.push(now);
    }
    
    params.push(orderId);
    
    db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    return this.findById(orderId);
  },

  addPhotos(orderId: string, photos: string[]): Order | null {
    const db = getDb();
    const order = this.findById(orderId);
    if (!order) return null;
    
    const allPhotos = [...order.photos, ...photos];
    db.prepare('UPDATE orders SET photos = ? WHERE id = ?').run(JSON.stringify(allPhotos), orderId);
    return this.findById(orderId);
  },

  cancelOrder(orderId: string, reason: CancelReason, note?: string): Order | null {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE orders SET status = 'cancelled', cancel_reason = ?, cancel_note = ?, cancelled_at = ?
      WHERE id = ?
    `).run(reason, note || null, now, orderId);
    return this.findById(orderId);
  },
};

export default orderRepository;

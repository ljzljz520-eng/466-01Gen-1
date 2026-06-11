import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/app.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initDb(db);
  }
  return db;
}

function initDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('employer', 'aide')),
      avatar TEXT,
      rating REAL DEFAULT 5.0,
      rating_count INTEGER DEFAULT 0,
      balance REAL DEFAULT 0.0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      employer_id TEXT NOT NULL,
      aide_id TEXT,
      service_type TEXT NOT NULL CHECK (service_type IN ('cleaning', 'cooking', 'care')),
      address TEXT NOT NULL,
      date TEXT NOT NULL,
      duration INTEGER NOT NULL,
      has_pet INTEGER NOT NULL DEFAULT 0,
      pet_type TEXT,
      requirements TEXT,
      price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'departed', 'arrived', 'completed', 'cancelled')),
      cancel_reason TEXT CHECK (cancel_reason IN ('employer_reschedule', 'aide_no_show', 'weather')),
      cancel_note TEXT,
      photos TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      departed_at TEXT,
      arrived_at TEXT,
      completed_at TEXT,
      cancelled_at TEXT,
      FOREIGN KEY (employer_id) REFERENCES users(id),
      FOREIGN KEY (aide_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      content TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_employer_id ON orders(employer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_aide_id ON orders(aide_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_to_user_id ON reviews(to_user_id);
  `);

  const userCount = database.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedData(database);
  }
}

function seedData(database: Database.Database) {
  const now = new Date().toISOString();
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const insertUser = database.prepare(`
    INSERT INTO users (id, name, phone, role, avatar, rating, rating_count, balance, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('emp_001', '李女士', '13800000001', 'employer', null, 5.0, 3, 500.0, now);
  insertUser.run('emp_002', '张先生', '13800000002', 'employer', null, 4.9, 8, 320.0, now);
  insertUser.run('aide_001', '王阿姨', '13900000001', 'aide', null, 4.8, 25, 1200.0, now);
  insertUser.run('aide_002', '张阿姨', '13900000002', 'aide', null, 4.9, 42, 2100.0, now);
  insertUser.run('aide_003', '刘阿姨', '13900000003', 'aide', null, 4.7, 18, 860.0, now);

  const insertOrder = database.prepare(`
    INSERT INTO orders (id, employer_id, aide_id, service_type, address, date, duration, has_pet, pet_type, requirements, price, status, photos, created_at, departed_at, arrived_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOrder.run(
    'ord_001',
    'emp_001',
    null,
    'cleaning',
    '北京市朝阳区建国路88号SOHO现代城A座1201',
    tomorrow,
    3,
    1,
    '英短猫',
    '需要重点打扫厨房和卫生间，注意关好门不要让猫跑出去，窗户玻璃也要擦一下',
    180.0,
    'pending',
    '[]',
    now,
    null,
    null,
    null
  );

  insertOrder.run(
    'ord_002',
    'emp_001',
    'aide_001',
    'cooking',
    '北京市朝阳区建国路88号SOHO现代城A座1201',
    new Date().toISOString().split('T')[0],
    2,
    0,
    null,
    '做三人份晚餐，清淡口味，不要辣，有一个小孩不吃香菜',
    160.0,
    'departed',
    '[]',
    new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    null,
    null
  );

  insertOrder.run(
    'ord_003',
    'emp_002',
    'aide_002',
    'care',
    '北京市海淀区中关村大街1号',
    yesterday,
    4,
    0,
    null,
    '照顾老人，帮助翻身、喂饭、陪聊',
    280.0,
    'completed',
    JSON.stringify([
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
    ]),
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  );

  insertOrder.run(
    'ord_004',
    'emp_002',
    null,
    'cleaning',
    '北京市海淀区中关村大街1号',
    tomorrow,
    2,
    1,
    '金毛犬',
    '日常保洁，狗狗很乖不会咬人，需要先把客厅的杂物整理一下',
    120.0,
    'pending',
    '[]',
    new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    null,
    null,
    null
  );

  insertOrder.run(
    'ord_005',
    'emp_001',
    'aide_003',
    'cleaning',
    '北京市朝阳区建国路88号SOHO现代城A座1201',
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    3,
    1,
    '英短猫',
    '深度清洁，包括擦窗户、清洗油烟机滤网',
    240.0,
    'completed',
    JSON.stringify([
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    ]),
    new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString()
  );

  const insertReview = database.prepare(`
    INSERT INTO reviews (id, order_id, from_user_id, to_user_id, rating, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertReview.run(
    'rev_001',
    'ord_003',
    'emp_002',
    'aide_002',
    5,
    '张阿姨非常专业有耐心，把老人照顾得很好，下次还会约她！',
    new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
  );

  insertReview.run(
    'rev_002',
    'ord_005',
    'emp_001',
    'aide_003',
    4,
    '打扫得挺干净的，就是时间稍微超了一点，总体满意。',
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  );
}

export default getDb;

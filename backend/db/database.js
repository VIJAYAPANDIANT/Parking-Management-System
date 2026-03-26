import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('./db/parking.db', { verbose: console.log });

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Admin', 'User'))
  );

  CREATE TABLE IF NOT EXISTS slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('Car', 'Bike')),
    status TEXT NOT NULL DEFAULT 'Available' CHECK(status IN ('Available', 'Occupied'))
  );

  CREATE TABLE IF NOT EXISTS parking_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_number TEXT NOT NULL,
    slot_id INTEGER NOT NULL,
    entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    exit_time DATETIME,
    fee REAL,
    FOREIGN KEY(slot_id) REFERENCES slots(id)
  );
`);

// Seed default admin user if not exists
const seedAdmin = () => {
  const adminEmail = 'sweet@gmail.com';
  const adminPassword = 'queen';
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
  if (!user) {
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
      .run('Queen', adminEmail, hashedPassword, 'Admin');
    console.log('Admin user seeded successfully');
  }
};

seedAdmin();

export default db;

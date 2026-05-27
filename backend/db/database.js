import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('./db/parking.db', { verbose: console.log });

// Enable foreign key support in SQLite
db.pragma('foreign_keys = ON');

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
    FOREIGN KEY(slot_id) REFERENCES slots(id) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS rates (
    vehicle_type TEXT PRIMARY KEY CHECK(vehicle_type IN ('Car', 'Bike')),
    hourly_rate REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vehicle_number TEXT NOT NULL,
    vehicle_type TEXT NOT NULL CHECK(vehicle_type IN ('Car', 'Bike')),
    slot_id INTEGER NOT NULL,
    reservation_time DATETIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'CheckedIn', 'Cancelled')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(slot_id) REFERENCES slots(id) ON DELETE RESTRICT
  );
`);

// Seed default users if not exists
const seedUsers = () => {
  // Admin user
  const adminEmail = 'sweet@gmail.com';
  const adminPassword = 'queen';
  const admin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
  if (!admin) {
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
      .run('Queen', adminEmail, hashedPassword, 'Admin');
    console.log('Admin user seeded successfully');
  }

  // Standard user
  const userEmail = 'user@gmail.com';
  const userPassword = 'user123';
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(userEmail);
  if (!user) {
    const hashedPassword = bcrypt.hashSync(userPassword, 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
      .run('John Doe', userEmail, hashedPassword, 'User');
    console.log('Standard user seeded successfully');
  }
};

// Seed default slots
const seedSlots = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM slots').get().count;
  if (count === 0) {
    // 8 Car slots
    for (let i = 1; i <= 8; i++) {
      db.prepare('INSERT INTO slots (type, status) VALUES (?, ?)').run('Car', 'Available');
    }
    // 6 Bike slots
    for (let i = 1; i <= 6; i++) {
      db.prepare('INSERT INTO slots (type, status) VALUES (?, ?)').run('Bike', 'Available');
    }
    console.log('Default slots seeded successfully');
  }
};

// Seed default rates
const seedRates = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM rates').get().count;
  if (count === 0) {
    db.prepare('INSERT INTO rates (vehicle_type, hourly_rate) VALUES (?, ?)').run('Car', 50);
    db.prepare('INSERT INTO rates (vehicle_type, hourly_rate) VALUES (?, ?)').run('Bike', 20);
    console.log('Default rates seeded successfully');
  }
};

// Seed sample reservations and active records to make dashboard live
const seedSampleData = () => {
  const resCount = db.prepare('SELECT COUNT(*) as count FROM reservations').get().count;
  if (resCount === 0) {
    const standardUser = db.prepare('SELECT id FROM users WHERE email = ?').get('user@gmail.com');
    if (!standardUser) return;

    // Get slots to assign
    const slotsList = db.prepare('SELECT id, type FROM slots').all();
    if (slotsList.length < 10) return;

    // Find car and bike slots
    const carSlots = slotsList.filter(s => s.type === 'Car');
    const bikeSlots = slotsList.filter(s => s.type === 'Bike');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Pending reservation (Car)
    db.prepare(`
      INSERT INTO reservations (user_id, vehicle_number, vehicle_type, slot_id, reservation_time, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `).run(standardUser.id, 'TN-01-AB-1234', 'Car', carSlots[1].id, tomorrow.toISOString());

    // 2. CheckedIn reservation (Bike, Slot 12)
    // Mark Slot 12 (bikeSlots[1]) occupied and create active parking record
    const occupiedSlot = bikeSlots[1];
    db.prepare("UPDATE slots SET status = 'Occupied' WHERE id = ?").run(occupiedSlot.id);
    
    // Create reservation
    const todayPast = new Date();
    todayPast.setHours(todayPast.getHours() - 3); // 3 hours ago
    db.prepare(`
      INSERT INTO reservations (user_id, vehicle_number, vehicle_type, slot_id, reservation_time, status)
      VALUES (?, ?, ?, ?, ?, 'CheckedIn')
    `).run(standardUser.id, 'TN-02-XY-9876', 'Bike', occupiedSlot.id, todayPast.toISOString());

    // Create active parking record
    db.prepare(`
      INSERT INTO parking_records (vehicle_number, slot_id, entry_time)
      VALUES (?, ?, ?)
    `).run('TN-02-XY-9876', occupiedSlot.id, todayPast.toISOString());

    // 3. Cancelled reservation (Car)
    db.prepare(`
      INSERT INTO reservations (user_id, vehicle_number, vehicle_type, slot_id, reservation_time, status)
      VALUES (?, ?, ?, ?, ?, 'Cancelled')
    `).run(standardUser.id, 'KA-03-ZZ-5555', 'Car', carSlots[3].id, todayPast.toISOString());

    // 4. An independent active parking record (Car, Slot 1) that did not have reservation
    const activeCarSlot = carSlots[0];
    db.prepare("UPDATE slots SET status = 'Occupied' WHERE id = ?").run(activeCarSlot.id);
    
    const entryCarTime = new Date();
    entryCarTime.setMinutes(entryCarTime.getMinutes() - 45); // 45 minutes ago
    db.prepare(`
      INSERT INTO parking_records (vehicle_number, slot_id, entry_time)
      VALUES (?, ?, ?)
    `).run('TN-09-QQ-7777', activeCarSlot.id, entryCarTime.toISOString());

    console.log('Sample reservations and active parking records seeded successfully');
  }
};

seedUsers();
seedSlots();
seedRates();
seedSampleData();

export default db;

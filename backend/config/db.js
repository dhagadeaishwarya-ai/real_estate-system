const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

let pool;

async function initDB() {
  try {
    // 1. First connection to MySQL (without selecting DB) to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: DB_HOST || 'localhost',
      port: DB_PORT || 3306,
      user: DB_USER || 'root',
      password: DB_PASSWORD || ''
    });

    console.log('Successfully connected to MySQL database server.');

    // Create DB
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME || 'real_estate_db'}\``);
    await connection.end();

    // 2. Establish connection pool with the active database
    pool = mysql.createPool({
      host: DB_HOST || 'localhost',
      port: DB_PORT || 3306,
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
      database: DB_NAME || 'real_estate_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log(`Connected to database pool for '${DB_NAME || 'real_estate_db'}'.`);

    // 3. Create Tables
    await createTables();

    // 4. Seed Data if empty
    await seedDatabase();

  } catch (error) {
    console.error('Critical Error in Database Initialization:', error);
    process.exit(1); // Exit server if DB connection fails
  }
}

async function createTables() {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('buyer', 'seller', 'agent', 'admin') DEFAULT 'buyer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;

  const propertiesTable = `
    CREATE TABLE IF NOT EXISTS properties (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(150) NOT NULL,
      price DECIMAL(12, 2) NOT NULL,
      type ENUM('residential', 'commercial') DEFAULT 'residential',
      rooms INT NOT NULL DEFAULT 1,
      availability ENUM('available', 'sold', 'rented') DEFAULT 'available',
      contact_info VARCHAR(100) NOT NULL,
      owner_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;

  const imagesTable = `
    CREATE TABLE IF NOT EXISTS property_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id INT NOT NULL,
      image_url TEXT NOT NULL,
      public_id VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;

  const bookingsTable = `
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id INT NOT NULL,
      buyer_id INT NOT NULL,
      preferred_date DATE NOT NULL,
      preferred_time TIME NOT NULL,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;

  const questionsTable = `
    CREATE TABLE IF NOT EXISTS property_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id INT NOT NULL,
      buyer_id INT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT,
      answered_by INT,
      answered_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (answered_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `;

  await pool.query(usersTable);
  await pool.query(propertiesTable);
  await pool.query(imagesTable);
  await pool.query(bookingsTable);
  await pool.query(questionsTable);

  console.log('Database tables verified/created successfully.');
}

async function seedDatabase() {
  // Check if users exist
  const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
  let adminId, agentId, sellerId, buyerId;

  if (users[0].count === 0) {
    console.log('Seeding default users...');
    const salt = await bcrypt.genSalt(10);

    const usersData = [
      { name: 'System Admin', email: 'admin@realestate.com', role: 'admin', pass: 'admin123' },
      { name: 'Sarah Jenkins (Agent)', email: 'agent@realestate.com', role: 'agent', pass: 'agent123' },
      { name: 'John Doe (Seller)', email: 'seller@realestate.com', role: 'seller', pass: 'seller123' },
      { name: 'Robert Smith (Buyer)', email: 'buyer@realestate.com', role: 'buyer', pass: 'buyer123' }
    ];

    for (let u of usersData) {
      const hashedPass = await bcrypt.hash(u.pass, salt);
      const [res] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [u.name, u.email, hashedPass, u.role]
      );
      if (u.role === 'admin') adminId = res.insertId;
      if (u.role === 'agent') agentId = res.insertId;
      if (u.role === 'seller') sellerId = res.insertId;
      if (u.role === 'buyer') buyerId = res.insertId;
    }
    console.log('Users seeded successfully. Default credentials:');
    console.log(' - Admin: admin@realestate.com / admin123');
    console.log(' - Agent: agent@realestate.com / agent123');
    console.log(' - Seller: seller@realestate.com / seller123');
    console.log(' - Buyer: buyer@realestate.com / buyer123');
  } else {
    // Retrieve existing IDs to link properties properly
    const [existingUsers] = await pool.query('SELECT id, role FROM users');
    adminId = existingUsers.find(u => u.role === 'admin')?.id;
    agentId = existingUsers.find(u => u.role === 'agent')?.id;
    sellerId = existingUsers.find(u => u.role === 'seller')?.id;
  }

  // Check if properties exist
  const [properties] = await pool.query('SELECT COUNT(*) as count FROM properties');
  if (properties[0].count === 0 && (agentId || sellerId)) {
    console.log('Seeding initial mock properties...');
    const ownerId = agentId || sellerId || adminId;

    const props = [
      {
        name: 'Sunset Luxury Villa',
        description: 'Breathtaking 4-bedroom villa with panoramic sunset views, private infinity pool, and state-of-the-art home automation system. Nested in a serene premium neighborhood.',
        location: 'California',
        price: 1850000.00,
        type: 'residential',
        rooms: 5,
        availability: 'available',
        contact_info: '+1 (555) 123-4567',
        images: [
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Downtown Modern Office Space',
        description: 'Premium A-grade commercial office space situated on the 24th floor of a prestigious corporate tower. Floor-to-ceiling glass windows, open plan desks, and executive conference rooms.',
        location: 'New York',
        price: 2450000.00,
        type: 'commercial',
        rooms: 8,
        availability: 'available',
        contact_info: '+1 (555) 765-4321',
        images: [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Suburban Family Haven',
        description: 'Cozy and spacious double-story family home with a beautiful landscaped backyard, perfect for children and pets. Modern kitchen fittings and close proximity to top schools.',
        location: 'Texas',
        price: 495000.00,
        type: 'residential',
        rooms: 3,
        availability: 'available',
        contact_info: '+1 (555) 888-9999',
        images: [
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80'
        ]
      }
    ];

    for (let p of props) {
      const [res] = await pool.query(
        'INSERT INTO properties (name, description, location, price, type, rooms, availability, contact_info, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.name, p.description, p.location, p.price, p.type, p.rooms, p.availability, p.contact_info, ownerId]
      );
      const propertyId = res.insertId;

      for (let img of p.images) {
        await pool.query(
          'INSERT INTO property_images (property_id, image_url) VALUES (?, ?)',
          [propertyId, img]
        );
      }
    }
    console.log('Mock properties seeded successfully.');
  }
}

module.exports = {
  initDB,
  getPool: () => {
    if (!pool) throw new Error('Database pool has not been initialized. Call initDB() first.');
    return pool;
  }
};

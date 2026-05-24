CREATE DATABASE IF NOT EXISTS real_estate_db;
USE real_estate_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'seller', 'agent', 'admin') DEFAULT 'buyer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Properties Table
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
);

-- 3. Property Images Table
CREATE TABLE IF NOT EXISTS property_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- 4. Bookings Table
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
);

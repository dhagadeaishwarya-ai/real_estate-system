const { getPool } = require('../config/db');

// Get high-level summary stats for Admin dashboard
async function getDashboardStats(req, res) {
  try {
    const db = getPool();

    // 1. Total counts
    const [userCount] = await db.query('SELECT COUNT(*) as total FROM users');
    const [propertyCount] = await db.query('SELECT COUNT(*) as total FROM properties');
    const [bookingCount] = await db.query('SELECT COUNT(*) as total FROM bookings');
    
    // 2. Count by availability status
    const [availCount] = await db.query("SELECT COUNT(*) as total FROM properties WHERE availability = 'available'");
    const [soldCount] = await db.query("SELECT COUNT(*) as total FROM properties WHERE availability = 'sold'");
    const [rentedCount] = await db.query("SELECT COUNT(*) as total FROM properties WHERE availability = 'rented'");

    // 3. Count by type
    const [resCount] = await db.query("SELECT COUNT(*) as total FROM properties WHERE type = 'residential'");
    const [commCount] = await db.query("SELECT COUNT(*) as total FROM properties WHERE type = 'commercial'");

    return res.json({
      totalUsers: userCount[0].total,
      totalProperties: propertyCount[0].total,
      totalBookings: bookingCount[0].total,
      availableProperties: availCount[0].total,
      soldProperties: soldCount[0].total,
      rentedProperties: rentedCount[0].total,
      residentialCount: resCount[0].total,
      commercialCount: commCount[0].total
    });

  } catch (error) {
    console.error('Admin Stats Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

// Get all users in system (Admin role required)
async function getUsers(req, res) {
  try {
    const db = getPool();
    const [users] = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return res.json(users);
  } catch (error) {
    console.error('Admin Get Users Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

// Update a user's role
async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['buyer', 'seller', 'agent', 'admin'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role assignment.' });
  }

  try {
    const db = getPool();

    // Prevent de-privileging self
    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own admin role.' });
    }

    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return res.json({ message: 'User role updated successfully.' });

  } catch (error) {
    console.error('Admin Update User Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

// Delete a user account (cascades all listings/bookings)
async function deleteUser(req, res) {
  const { id } = req.params;

  try {
    const db = getPool();

    // Prevent deleting self
    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ message: 'User account deleted successfully.' });

  } catch (error) {
    console.error('Admin Delete User Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser
};

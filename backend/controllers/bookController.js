const { getPool } = require('../config/db');

// Create a visit booking
async function createBooking(req, res) {
  const { property_id, preferred_date, preferred_time } = req.body;

  if (!property_id || !preferred_date || !preferred_time) {
    return res.status(400).json({ message: 'Please provide all required booking details.' });
  }

  try {
    const db = getPool();

    // Check if property exists
    const [properties] = await db.query('SELECT id, availability FROM properties WHERE id = ?', [property_id]);
    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    if (properties[0].availability !== 'available') {
      return res.status(400).json({ message: 'This property is no longer available for booking.' });
    }

    // Insert booking
    await db.query(
      'INSERT INTO bookings (property_id, buyer_id, preferred_date, preferred_time, status) VALUES (?, ?, ?, ?, ?)',
      [property_id, req.user.id, preferred_date, preferred_time, 'pending']
    );

    return res.status(201).json({ message: 'Visit booked successfully! Waiting for host response.' });

  } catch (error) {
    console.error('Create Booking Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

// Get bookings based on user role
async function getBookings(req, res) {
  const { role, id: userId } = req.user;

  try {
    const db = getPool();
    let query = '';
    let params = [];

    if (role === 'admin' || role === 'agent') {
      // Admins and agents can view all bookings
      query = `
        SELECT b.*, 
               p.name as property_name, p.location as property_location, p.price as property_price, p.contact_info as host_contact,
               u_buyer.name as buyer_name, u_buyer.email as buyer_email,
               u_owner.name as host_name
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN users u_buyer ON b.buyer_id = u_buyer.id
        JOIN users u_owner ON p.owner_id = u_owner.id
        ORDER BY b.preferred_date ASC, b.preferred_time ASC
      `;
    } else if (role === 'seller') {
      // Sellers can only see bookings for their own properties
      query = `
        SELECT b.*, 
               p.name as property_name, p.location as property_location, p.price as property_price, p.contact_info as host_contact,
               u_buyer.name as buyer_name, u_buyer.email as buyer_email,
               u_owner.name as host_name
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN users u_buyer ON b.buyer_id = u_buyer.id
        JOIN users u_owner ON p.owner_id = u_owner.id
        WHERE p.owner_id = ?
        ORDER BY b.preferred_date ASC, b.preferred_time ASC
      `;
      params.push(userId);
    } else {
      // Buyers can only see their own bookings
      query = `
        SELECT b.*, 
               p.name as property_name, p.location as property_location, p.price as property_price, p.contact_info as host_contact,
               u_owner.name as host_name
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN users u_owner ON p.owner_id = u_owner.id
        WHERE b.buyer_id = ?
        ORDER BY b.preferred_date ASC, b.preferred_time ASC
      `;
      params.push(userId);
    }

    const [rows] = await db.query(query, params);
    return res.json(rows);

  } catch (error) {
    console.error('Get Bookings Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

// Update booking status (approve or reject)
async function updateBookingStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const db = getPool();

    // Fetch booking to verify permission
    const [bookings] = await db.query(`
      SELECT b.*, p.owner_id 
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = ?
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking request not found.' });
    }

    const booking = bookings[0];

    // Access control: Admin, Agent, or Property Owner can manage status
    if (req.user.role !== 'admin' && req.user.role !== 'agent' && req.user.id !== booking.owner_id) {
      return res.status(403).json({ message: 'Access denied. You do not own the listed property.' });
    }

    // Update status
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

    return res.json({ message: `Booking request successfully ${status}.` });

  } catch (error) {
    console.error('Update Booking Status Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus
};

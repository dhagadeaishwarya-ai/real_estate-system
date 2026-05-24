const { getPool } = require('../config/db');

// Get all properties with dynamic filtering
async function getProperties(req, res) {
  const { location, type, minPrice, maxPrice, rooms, availability } = req.query;

  try {
    const db = getPool();
    let query = `
      SELECT p.*, 
             (SELECT image_url FROM property_images WHERE property_id = p.id LIMIT 1) as primary_image
      FROM properties p
      WHERE 1=1
    `;
    const queryParams = [];

    // Filter by location / city
    if (location && location.trim() !== '') {
      query += ' AND (p.location LIKE ? OR p.name LIKE ?)';
      queryParams.push(`%${location}%`, `%${location}%`);
    }

    // Filter by type
    if (type && type !== 'all') {
      query += ' AND p.type = ?';
      queryParams.push(type);
    }

    // Filter by minPrice
    if (minPrice) {
      query += ' AND p.price >= ?';
      queryParams.push(Number(minPrice));
    }

    // Filter by maxPrice
    if (maxPrice) {
      query += ' AND p.price <= ?';
      queryParams.push(Number(maxPrice));
    }

    // Filter by rooms
    if (rooms && rooms !== 'all') {
      query += ' AND p.rooms = ?';
      queryParams.push(Number(rooms));
    }

    // Filter by availability
    if (availability && availability !== 'all') {
      query += ' AND p.availability = ?';
      queryParams.push(availability);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await db.query(query, queryParams);
    return res.json(rows);

  } catch (error) {
    console.error('Get Properties Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

// Get single property details by ID (including all images)
async function getPropertyById(req, res) {
  const { id } = req.params;

  try {
    const db = getPool();

    // Query property along with owner/agent details
    const [properties] = await db.query(`
      SELECT p.*, u.name as owner_name, u.email as owner_email, u.role as owner_role
      FROM properties p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    const property = properties[0];

    // Query all images for this property
    const [images] = await db.query('SELECT image_url FROM property_images WHERE property_id = ?', [id]);
    property.images = images.map(img => img.image_url);

    return res.json(property);

  } catch (error) {
    console.error('Get Property Detail Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

// Create a new property listing
async function createProperty(req, res) {
  const { name, description, location, price, type, rooms, availability, contact_info, images } = req.body;

  if (!name || !description || !location || !price || !contact_info) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  try {
    const db = getPool();

    // Insert property
    const [result] = await db.query(
      `INSERT INTO properties (name, description, location, price, type, rooms, availability, contact_info, owner_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        location,
        price,
        type || 'residential',
        rooms || 1,
        availability || 'available',
        contact_info,
        req.user.id // Seller or Agent who is logged in
      ]
    );

    const propertyId = result.insertId;

    // Insert images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      for (let imgUrl of images) {
        if (imgUrl.trim() !== '') {
          await db.query(
            'INSERT INTO property_images (property_id, image_url) VALUES (?, ?)',
            [propertyId, imgUrl]
          );
        }
      }
    } else {
      // Provide a placeholder image if none uploaded
      await db.query(
        'INSERT INTO property_images (property_id, image_url) VALUES (?, ?)',
        [propertyId, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80']
      );
    }

    return res.status(201).json({
      message: 'Property listed successfully.',
      propertyId
    });

  } catch (error) {
    console.error('Create Property Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

// Update a property listing
async function updateProperty(req, res) {
  const { id } = req.params;
  const { name, description, location, price, type, rooms, availability, contact_info, images } = req.body;

  if (!name || !description || !location || !price || !contact_info) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  try {
    const db = getPool();

    // Get existing property to check ownership (unless Admin/Agent)
    const [existing] = await db.query('SELECT owner_id FROM properties WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    const propertyOwnerId = existing[0].owner_id;

    // Check authorization: only admin, agent, or actual owner can update
    if (req.user.role !== 'admin' && req.user.role !== 'agent' && req.user.id !== propertyOwnerId) {
      return res.status(403).json({ message: 'Access denied. You do not own this listing.' });
    }

    // Update properties table
    await db.query(
      `UPDATE properties 
       SET name = ?, description = ?, location = ?, price = ?, type = ?, rooms = ?, availability = ?, contact_info = ?
       WHERE id = ?`,
      [name, description, location, price, type, rooms, availability, contact_info, id]
    );

    // Update images if provided (replaces existing images for absolute control)
    if (images && Array.isArray(images)) {
      // Delete old images
      await db.query('DELETE FROM property_images WHERE property_id = ?', [id]);

      // Add new ones
      for (let imgUrl of images) {
        if (imgUrl.trim() !== '') {
          await db.query(
            'INSERT INTO property_images (property_id, image_url) VALUES (?, ?)',
            [id, imgUrl]
          );
        }
      }
    }

    return res.json({ message: 'Property listing updated successfully.' });

  } catch (error) {
    console.error('Update Property Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

// Delete a property listing
async function deleteProperty(req, res) {
  const { id } = req.params;

  try {
    const db = getPool();

    // Get existing property to check ownership
    const [existing] = await db.query('SELECT owner_id FROM properties WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    const propertyOwnerId = existing[0].owner_id;

    // Only admin, agent, or owner can delete
    if (req.user.role !== 'admin' && req.user.role !== 'agent' && req.user.id !== propertyOwnerId) {
      return res.status(403).json({ message: 'Access denied. You do not own this listing.' });
    }

    // Delete property (cascades deletes to images and bookings)
    await db.query('DELETE FROM properties WHERE id = ?', [id]);

    return res.json({ message: 'Property listing deleted successfully.' });

  } catch (error) {
    console.error('Delete Property Error:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
};

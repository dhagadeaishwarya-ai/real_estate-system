const cloudinary = require('../config/cloudinary');
const { getPool } = require('../config/db');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/images/upload
 * Handles a single image upload (multipart/form-data).
 * Expected fields:
 *   - image (file)
 *   - propertyId (string/int) – the ID of the property to associate with.
 * If Cloudinary credentials are missing, the image is saved locally in the `uploads` folder.
 */
exports.uploadPropertyImage = async (req, res) => {
  try {
    // multer gives us req.file (buffer) and req.body for other fields
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }
    const propertyId = parseInt(req.body.propertyId, 10);
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: 'Invalid propertyId.' });
    }

    // Determine if Cloudinary is configured
    const hasCloudinaryConfig =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    let imageUrl;
    let publicId = null;

    if (hasCloudinaryConfig) {
      // Upload buffer to Cloudinary (stream API)
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'real_estate_properties' },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else {
      // Fallback: save file locally
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `${uuidv4()}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      // Construct a URL that can be served via Express static middleware
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    }

    // Persist a reference in the DB (optional but recommended)
    const pool = getPool();
    await pool.query(
      'INSERT INTO property_images (property_id, image_url, public_id) VALUES (?, ?, ?)',
      [propertyId, imageUrl, publicId]
    );

    // Return the URL (and public_id when using Cloudinary)
    res.status(200).json({ image_url: imageUrl, public_id: publicId });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ message: 'Failed to upload image.', error: err.message });
  }
};

/**
 * DELETE /api/propertyImages/:id
 * Removes an image both from Cloudinary (if applicable) and the DB.
 */
exports.deletePropertyImage = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    // Find the record first
    const [rows] = await pool.query('SELECT public_id FROM property_images WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Image not found' });
    }
    const publicId = rows[0].public_id;

    // Delete from Cloudinary if we have a public_id
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete DB record
    await pool.query('DELETE FROM property_images WHERE id = ?', [id]);
    return res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
};

/**
 * POST /api/images/upload
 * Handles a single image upload (multipart/form-data).
 * Expected fields:
 *   - image (file)
 *   - propertyId (string/int) – the ID of the property to associate with.
 */
exports.uploadPropertyImage = async (req, res) => {
  try {
    // multer gives us req.file (buffer) and req.body for other fields
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }
    const propertyId = parseInt(req.body.propertyId, 10);
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: 'Invalid propertyId.' });
    }

    // Upload buffer to Cloudinary (stream API)
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'real_estate_properties' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    const imageUrl = uploadResult.secure_url;
    // Persist a reference in the DB (optional but recommended)
    const pool = getPool();
    await pool.query(
      'INSERT INTO property_images (property_id, image_url) VALUES (?, ?)',
      [propertyId, imageUrl]
    );

    // Return the URL (frontend expects image_url)
    res.status(200).json({ image_url: imageUrl, public_id: uploadResult.public_id });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ message: 'Failed to upload image.', error: err.message });
  }
};

/**
 * DELETE /api/propertyImages/:id
 * Removes an image both from Cloudinary and the DB.
 */
exports.deletePropertyImage = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the public_id first
    const [rows] = await pool.query('SELECT public_id FROM property_images WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Image not found' });
    }
    const publicId = rows[0].public_id;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete DB record
    await pool.query('DELETE FROM property_images WHERE id = ?', [id]);

    return res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
};

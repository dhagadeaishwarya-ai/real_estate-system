const express = require('express');
const multer = require('multer');
const router = express.Router();

const { authenticateToken, requireRoles } = require('../middleware/authMiddleware');
const { uploadPropertyImage } = require('../controllers/imageController');

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/upload',
  authenticateToken,
  requireRoles(['admin', 'agent', 'seller']),
  upload.single('image'),
  uploadPropertyImage
);

module.exports = router;
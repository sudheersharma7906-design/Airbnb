const express = require('express');
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getHostProperties,
  getHostStats,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getProperties);
router.get('/host/my-listings', protect, authorize('host', 'admin'), getHostProperties);
router.get('/host/stats', protect, authorize('host', 'admin'), getHostStats);
router.get('/:id', getPropertyById);
router.post('/', protect, authorize('host', 'admin'), upload.array('images', 5), createProperty);
router.put('/:id', protect, authorize('host', 'admin'), upload.array('images', 5), updateProperty);
router.delete('/:id', protect, authorize('host', 'admin'), deleteProperty);

module.exports = router;

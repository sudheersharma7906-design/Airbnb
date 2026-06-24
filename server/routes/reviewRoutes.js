const express = require('express');
const { getPropertyReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:propertyId', getPropertyReviews);
router.post('/', protect, createReview);

module.exports = router;

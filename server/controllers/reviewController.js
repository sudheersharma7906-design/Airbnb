const Review = require('../models/Review');
const Property = require('../models/Property');

const updatePropertyRating = async (propertyId) => {
  const reviews = await Review.find({ propertyId });
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  await Property.findByIdAndUpdate(propertyId, {
    rating: Math.round(avg * 10) / 10,
    reviewCount: count,
  });
};

const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ propertyId: req.params.propertyId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;

    const existing = await Review.findOne({
      userId: req.user._id,
      propertyId,
    });

    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this property' });
    }

    const review = await Review.create({
      userId: req.user._id,
      propertyId,
      rating: Number(rating),
      comment,
    });

    await updatePropertyRating(propertyId);

    const populated = await Review.findById(review._id).populate('userId', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPropertyReviews, createReview };

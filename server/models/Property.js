const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, lowercase: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amenities: [{ type: String }],
    guests: { type: Number, required: true, min: 1, default: 1 },
    bedrooms: { type: Number, required: true, min: 0, default: 1 },
    bathrooms: { type: Number, required: true, min: 0, default: 1 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    lat: { type: Number, default: 28.6139 },
    lng: { type: Number, default: 77.2090 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', propertySchema);


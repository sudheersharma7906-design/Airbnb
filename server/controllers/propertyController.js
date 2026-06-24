const Property = require('../models/Property');
const Review = require('../models/Review');

const getProperties = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, guests, minRating } = req.query;
    const filter = {};

    if (city) filter.city = city.toLowerCase();
    if (guests) filter.guests = { $gte: Number(guests) };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const properties = await Property.find(filter)
      .populate('hostId', 'name email')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('hostId', 'name email');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    const { title, description, location, price, amenities, guests, bedrooms, bathrooms, lat, lng } =
      req.body;

    const images = req.files?.length
      ? await Promise.all(
          req.files.map(async (file) => {
            const { getImageUrl } = require('../middleware/uploadMiddleware');
            return getImageUrl(file);
          })
        )
      : [];

    const city = location.split(',')[0].trim().toLowerCase();

    const property = await Property.create({
      title,
      description,
      location,
      city,
      price: Number(price),
      images,
      hostId: req.user._id,
      amenities: amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',').map((a) => a.trim())) : [],
      guests: Number(guests) || 1,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      lat: lat ? Number(lat) : 28.6139,
      lng: lng ? Number(lng) : 77.2090,
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, location, price, amenities, guests, bedrooms, bathrooms, lat, lng } =
      req.body;

    if (title) property.title = title;
    if (description) property.description = description;
    if (location) {
      property.location = location;
      property.city = location.split(',')[0].trim().toLowerCase();
    }
    if (price) property.price = Number(price);
    if (guests) property.guests = Number(guests);
    if (bedrooms) property.bedrooms = Number(bedrooms);
    if (bathrooms) property.bathrooms = Number(bathrooms);
    if (lat) property.lat = Number(lat);
    if (lng) property.lng = Number(lng);
    if (amenities) {
      property.amenities = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim());
    }


    if (req.files?.length) {
      const { getImageUrl } = require('../middleware/uploadMiddleware');
      const newImages = await Promise.all(req.files.map((file) => getImageUrl(file)));
      property.images = [...property.images, ...newImages];
    }

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Review.deleteMany({ propertyId: property._id });
    await property.deleteOne();
    res.json({ message: 'Property removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHostProperties = async (req, res) => {
  try {
    const properties = await Property.find({ hostId: req.user._id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHostStats = async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const properties = await Property.find({ hostId: req.user._id });
    const propertyIds = properties.map((p) => p._id);

    const bookings = await Booking.find({
      propertyId: { $in: propertyIds },
      status: { $in: ['confirmed', 'completed'] },
    }).populate('propertyId userId', 'title name email');

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const upcoming = bookings.filter((b) => new Date(b.checkIn) >= new Date() && b.status === 'confirmed');

    res.json({
      totalBookings: bookings.length,
      totalRevenue,
      upcomingGuests: upcoming,
      properties: properties.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getHostProperties,
  getHostStats,
};

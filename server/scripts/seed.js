require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Property = require('../models/Property');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Message = require('../models/Message');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/airbnb-clone';
    console.log('Connecting to database:', mongoUri);
    await mongoose.connect(mongoUri);

    console.log('Clearing old data...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await Review.deleteMany({});
    await Booking.deleteMany({});
    await Message.deleteMany({});

    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const host = await User.create({
      name: 'Sudheer Sharma',
      email: 'host@example.com',
      password: hashedPassword,
      role: 'host',
      wishlist: [],
    });

    const guest1 = await User.create({
      name: 'Rohan Verma',
      email: 'guest@example.com',
      password: hashedPassword,
      role: 'user',
      wishlist: [],
    });

    const guest2 = await User.create({
      name: 'Aarav Mehta',
      email: 'guest2@example.com',
      password: hashedPassword,
      role: 'user',
      wishlist: [],
    });

    const guest3 = await User.create({
      name: 'Priya Sharma',
      email: 'guest3@example.com',
      password: hashedPassword,
      role: 'user',
      wishlist: [],
    });

    console.log('Creating properties...');
    const propertiesData = [
      {
        title: 'Sunset Beachfront Villa with Private Pool',
        description: 'Wake up to the sound of waves in this beautiful luxury beachfront villa. Located in the heart of North Goa, it features a private pool, lush tropical gardens, and direct beach access. Fully serviced with an in-house chef available.',
        location: 'Candolim, Goa, India',
        city: 'goa',
        price: 9500,
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80'
        ],
        hostId: host._id,
        amenities: ['WiFi', 'Pool', 'AC', 'Kitchen', 'Beach Access', 'Gym', 'Parking'],
        guests: 6,
        bedrooms: 3,
        bathrooms: 3,
        lat: 15.5186,
        lng: 73.7634,
      },
      {
        title: 'Luxury A-Frame Wooden Cabin with Mountain Views',
        description: 'Cozy A-frame cabin tucked in the snow-capped hills of Manali. Features an open fireplace, panoramic glass windows, and a private wooden deck. Perfect for a romantic getaway or a quiet retreat in nature.',
        location: 'Old Manali, Himachal Pradesh, India',
        city: 'manali',
        price: 4500,
        images: [
          'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1482440308425-276ad0f28b19?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80'
        ],
        hostId: host._id,
        amenities: ['WiFi', 'Heater', 'Fireplace', 'Kitchen', 'Balcony', 'Mountain View'],
        guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        lat: 32.2596,
        lng: 77.1855,
      },
      {
        title: 'Modern High-Rise Penthouse with Skyline Views',
        description: 'Experience luxury living in Greater Noida in this top-floor designer penthouse. High-end furnishings, floor-to-ceiling windows overlooking the city, full automation, and an expansive terrace with outdoor lounge seating.',
        location: 'Sector 150, Greater Noida, India',
        city: 'greater noida',
        price: 6000,
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=1200&q=80'
        ],
        hostId: host._id,
        amenities: ['WiFi', 'AC', 'Kitchen', 'Gym', 'Parking', 'City View', 'Elevator'],
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        lat: 28.4697,
        lng: 77.5020,
      },
      {
        title: 'Royal Heritage Palace Suite with Courtyard',
        description: 'Live like royalty in a historic Haveli in the heart of Jaipur. Restored to perfection with hand-painted murals, traditional arches, and antique furniture. Quiet central courtyard to enjoy morning tea.',
        location: 'Pink City, Jaipur, Rajasthan, India',
        city: 'jaipur',
        price: 5500,
        images: [
          'https://images.unsplash.com/photo-1585983224974-084a8e065e76?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1598977123418-45f04b01d4ae?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
        ],
        hostId: host._id,
        amenities: ['WiFi', 'AC', 'Heritage Courtyard', 'Kitchen', 'Breakfast Included'],
        guests: 3,
        bedrooms: 1,
        bathrooms: 1,
        lat: 26.9124,
        lng: 75.7873,
      },
      {
        title: 'Scenic Backwaters Floating Houseboat',
        description: 'Cruise along the peaceful backwaters of Alleppey in a traditional Kettuvalam houseboat. Crafted with local bamboo and wood, this floating retreat features bedrooms with attached bathrooms, sun decks, and meals prepared by local cooks.',
        location: 'Alleppey, Kerala, India',
        city: 'kerala',
        price: 8000,
        images: [
          'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
        ],
        hostId: host._id,
        amenities: ['Floating Deck', 'AC', 'All Meals Included', 'Private Staff', 'Water Views'],
        guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        lat: 9.4981,
        lng: 76.3388,
      },
      {
        title: 'Chic Urban Studio near Pari Chowk',
        description: 'Chic, minimalist studio designed for business travelers and couples. Centrally located with quick access to the Expressway. Fast fiber WiFi, working desk, fully equipped kitchen, and laundry facilities inside.',
        location: 'Pari Chowk, Greater Noida, India',
        city: 'greater noida',
        price: 2800,
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'
        ],
        hostId: host._id,
        amenities: ['WiFi', 'AC', 'Kitchen', 'Workspace', 'Parking', 'Washing Machine'],
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        lat: 28.4670,
        lng: 77.5140,
      }
    ];

    const properties = await Property.create(propertiesData);
    console.log(`Created ${properties.length} properties.`);

    console.log('Adding reviews...');
    const comments = [
      'Absolutely loved our stay here! The location is perfect, and the host is incredibly helpful.',
      'One of the best airbnbs we have visited. Extremely clean, great view, and premium bedding.',
      'Super comfortable and exactly as described in the photos. Highly recommended!',
      'Great experience. The service was excellent, and the amenities were top notch.',
      'A slice of heaven. We will definitely come back next year!'
    ];

    const guests = [guest1, guest2, guest3];

    for (const property of properties) {
      // Create reviews using unique guests
      for (let i = 0; i < guests.length; i++) {
        const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
        const comment = comments[Math.floor(Math.random() * comments.length)];
        const currentGuest = guests[i];
        
        await Review.create({
          userId: currentGuest._id,
          propertyId: property._id,
          rating,
          comment
        });
      }


      // Update averages
      const reviews = await Review.find({ propertyId: property._id });
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      property.rating = Math.round(avg * 10) / 10;
      property.reviewCount = reviews.length;
      await property.save();
    }

    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();

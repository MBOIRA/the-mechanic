const express = require('express');
const { body, validationResult } = require('express-validator');
const Mechanic = require('../models/Mechanic');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all mechanics with filters
router.get('/', async (req, res) => {
  try {
    const {
      specialization,
      city,
      state,
      isAvailable,
      isVerified,
      lat,
      lng,
      radius = 50,
      page = 1,
      limit = 10
    } = req.query;

    let query = { role: 'mechanic' };

    // Filter by specialization
    if (specialization) {
      query.specialization = { $in: [specialization] };
    }

    // Filter by location
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }
    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }

    // Filter by verification
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    const mechanics = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Fetch ratings for all mechanics
    const mechanicIds = mechanics.map(m => m._id);
    const ratings = await Booking.find({
      mechanic: { $in: mechanicIds },
      status: 'completed',
      'rating.score': { $exists: true }
    }).select('mechanic rating.score');

    // Create a map of mechanic ratings
    const ratingMap = {};
    ratings.forEach(r => {
      if (!ratingMap[r.mechanic]) {
        ratingMap[r.mechanic] = { total: 0, count: 0 };
      }
      ratingMap[r.mechanic].total += r.rating.score;
      ratingMap[r.mechanic].count += 1;
    });

    // Calculate average ratings
    const getRating = (mechanicId) => {
      const r = ratingMap[mechanicId];
      if (!r || r.count === 0) return { average: 0, count: 0 };
      return { average: parseFloat((r.total / r.count).toFixed(1)), count: r.count };
    };

    // Transform data to match expected format
    const transformedMechanics = mechanics.map(mechanic => ({
      _id: mechanic._id,
      user: {
        _id: mechanic._id,
        firstName: mechanic.firstName,
        lastName: mechanic.lastName,
        email: mechanic.email,
        phone: mechanic.phone,
        profileImage: mechanic.profileImage
      },
      businessName: mechanic.businessName,
      specialization: mechanic.specialization,
      experience: parseInt(mechanic.experience) || 0,
      bio: mechanic.bio,
      location: mechanic.location,
      serviceRadius: parseInt(mechanic.serviceRadius) || 10,
      pricing: {
        hourlyRate: parseFloat(mechanic.pricing?.hourlyRate) || 0,
        diagnosticFee: parseFloat(mechanic.pricing?.diagnosticFee) || 0
      },
      certifications: mechanic.certifications,
      availability: mechanic.availability,
      services: mechanic.services,
      isAvailable: mechanic.isActive,
      isVerified: mechanic.isVerified,
      emergencyAvailable: mechanic.emergencyAvailable || false,
      rating: getRating(mechanic._id),
      createdAt: mechanic.createdAt,
      updatedAt: mechanic.updatedAt
    }));

    res.json({
      message: 'Mechanics retrieved successfully',
      mechanics: transformedMechanics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get mechanics error:', error);
    res.status(500).json({ message: 'Server error while fetching mechanics' });
  }
});

// Get mechanic by ID
router.get('/:id', async (req, res) => {
  try {
    const mechanic = await User.findOne({ _id: req.params.id, role: 'mechanic' })
      .select('-password');

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    // Fetch mechanic's rating
    const ratings = await Booking.find({
      mechanic: req.params.id,
      status: 'completed',
      'rating.score': { $exists: true }
    }).select('rating.score');

    let rating = { average: 0, count: 0 };
    if (ratings.length > 0) {
      const total = ratings.reduce((sum, r) => sum + r.rating.score, 0);
      rating = {
        average: parseFloat((total / ratings.length).toFixed(1)),
        count: ratings.length
      };
    }

    // Transform data to match expected format
    const transformedMechanic = {
      _id: mechanic._id,
      user: {
        _id: mechanic._id,
        firstName: mechanic.firstName,
        lastName: mechanic.lastName,
        email: mechanic.email,
        phone: mechanic.phone,
        profileImage: mechanic.profileImage
      },
      businessName: mechanic.businessName,
      specialization: mechanic.specialization,
      experience: parseInt(mechanic.experience) || 0,
      bio: mechanic.bio,
      location: mechanic.location,
      serviceRadius: parseInt(mechanic.serviceRadius) || 10,
      pricing: {
        hourlyRate: parseFloat(mechanic.pricing?.hourlyRate) || 0,
        diagnosticFee: parseFloat(mechanic.pricing?.diagnosticFee) || 0
      },
      certifications: mechanic.certifications,
      availability: mechanic.availability,
      services: mechanic.services,
      isAvailable: mechanic.isActive,
      isVerified: mechanic.isVerified,
      emergencyAvailable: mechanic.emergencyAvailable || false,
      rating: rating,
      createdAt: mechanic.createdAt,
      updatedAt: mechanic.updatedAt
    };

    res.json({
      message: 'Mechanic retrieved successfully',
      mechanic: transformedMechanic
    });
  } catch (error) {
    console.error('Get mechanic error:', error);
    res.status(500).json({ message: 'Server error while fetching mechanic' });
  }
});

// Create mechanic profile (mechanic only)
router.post('/', auth, authorize('mechanic'), [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('specialization').isArray({ min: 1 }).withMessage('At least one specialization is required'),
  body('experience').isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.zipCode').notEmpty().withMessage('Zip code is required'),
  body('location.coordinates.lat').isFloat().withMessage('Latitude is required'),
  body('location.coordinates.lng').isFloat().withMessage('Longitude is required'),
  body('pricing.hourlyRate').isFloat({ min: 0 }).withMessage('Hourly rate must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if mechanic profile already exists
    const existingMechanic = await Mechanic.findOne({ user: req.user.id });
    if (existingMechanic) {
      return res.status(400).json({ message: 'Mechanic profile already exists' });
    }

    const mechanic = new Mechanic({
      ...req.body,
      user: req.user.id
    });

    await mechanic.save();

    const populatedMechanic = await Mechanic.findById(mechanic._id)
      .populate('user', 'firstName lastName email phone profileImage');

    res.status(201).json({
      message: 'Mechanic profile created successfully',
      mechanic: populatedMechanic
    });
  } catch (error) {
    console.error('Create mechanic error:', error);
    res.status(500).json({ message: 'Server error while creating mechanic profile' });
  }
});

// Update mechanic profile (mechanic only)
router.put('/:id', auth, authorize('mechanic'), async (req, res) => {
  try {
    const mechanic = await Mechanic.findOne({ _id: req.params.id, user: req.user.id });

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic profile not found or unauthorized' });
    }

    // Extract profileImage if present to update User document
    const { profileImage, ...mechanicData } = req.body;

    // Update User document if profileImage is provided
    if (profileImage !== undefined) {
      await User.findByIdAndUpdate(
        req.user.id,
        { profileImage }
      );
    }

    const updatedMechanic = await Mechanic.findByIdAndUpdate(
      req.params.id,
      mechanicData,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email phone profileImage');

    res.json({
      message: 'Mechanic profile updated successfully',
      mechanic: updatedMechanic
    });
  } catch (error) {
    console.error('Update mechanic error:', error);
    res.status(500).json({ message: 'Server error while updating mechanic profile' });
  }
});

// Get mechanic's own profile
router.get('/profile/me', auth, authorize('mechanic'), async (req, res) => {
  try {
    const mechanic = await Mechanic.findOne({ user: req.user.id })
      .populate('user', 'firstName lastName email phone profileImage');

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic profile not found' });
    }

    res.json({
      message: 'Mechanic profile retrieved successfully',
      mechanic
    });
  } catch (error) {
    console.error('Get mechanic profile error:', error);
    res.status(500).json({ message: 'Server error while fetching mechanic profile' });
  }
});

// Update mechanic availability
router.put('/:id/availability', auth, authorize('mechanic'), async (req, res) => {
  try {
    const mechanic = await Mechanic.findOne({ _id: req.params.id, user: req.user.id });

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic profile not found or unauthorized' });
    }

    const { availability } = req.body;
    mechanic.availability = { ...mechanic.availability, ...availability };
    await mechanic.save();

    res.json({
      message: 'Availability updated successfully',
      availability: mechanic.availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error while updating availability' });
  }
});

// Toggle mechanic availability (mechanic only)
router.put('/:id/toggle-availability', auth, authorize('mechanic'), async (req, res) => {
  try {
    const mechanic = await Mechanic.findOne({ _id: req.params.id, user: req.user.id });

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic profile not found or unauthorized' });
    }

    mechanic.isAvailable = !mechanic.isAvailable;
    await mechanic.save();

    res.json({
      message: 'Availability toggled successfully',
      isAvailable: mechanic.isAvailable
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Server error while toggling availability' });
  }
});

// Verify mechanic (admin only)
router.put('/:id/verify', auth, authorize('admin'), async (req, res) => {
  try {
    const mechanic = await Mechanic.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).populate('user', 'firstName lastName email phone');

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    res.json({
      message: 'Mechanic verified successfully',
      mechanic
    });
  } catch (error) {
    console.error('Verify mechanic error:', error);
    res.status(500).json({ message: 'Server error while verifying mechanic' });
  }
});

// Get mechanic statistics (mechanic only)
router.get('/:id/statistics', auth, authorize('mechanic'), async (req, res) => {
  try {
    const mechanic = await Mechanic.findOne({ _id: req.params.id, user: req.user.id });

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic profile not found or unauthorized' });
    }

    const Booking = require('../models/Booking');
    const Review = require('../models/Review');

    const totalBookings = await Booking.countDocuments({ mechanic: req.params.id });
    const completedBookings = await Booking.countDocuments({ 
      mechanic: req.params.id, 
      status: 'completed' 
    });
    const pendingBookings = await Booking.countDocuments({ 
      mechanic: req.params.id, 
      status: 'pending' 
    });
    const totalReviews = await Review.countDocuments({ mechanic: req.params.id });
    
    // Calculate average rating
    const reviews = await Review.find({ mechanic: req.params.id });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      message: 'Mechanic statistics retrieved successfully',
      statistics: {
        totalBookings,
        completedBookings,
        pendingBookings,
        totalReviews,
        averageRating,
        profileViews: mechanic.profileViews || 0,
        isVerified: mechanic.isVerified,
        isAvailable: mechanic.isAvailable
      }
    });
  } catch (error) {
    console.error('Get mechanic statistics error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

// Update mechanic services (mechanic only)
router.put('/:id/services', auth, authorize('mechanic'), [
  body('services').isArray({ min: 1 }).withMessage('At least one service is required'),
  body('services.*.name').notEmpty().withMessage('Service name is required'),
  body('services.*.description').notEmpty().withMessage('Service description is required'),
  body('services.*.price').isFloat({ min: 0 }).withMessage('Service price must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const mechanic = await Mechanic.findOne({ _id: req.params.id, user: req.user.id });

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic profile not found or unauthorized' });
    }

    const { services } = req.body;
    mechanic.services = services;
    await mechanic.save();

    res.json({
      message: 'Services updated successfully',
      services: mechanic.services
    });
  } catch (error) {
    console.error('Update services error:', error);
    res.status(500).json({ message: 'Server error while updating services' });
  }
});

// Add a single service to mechanic's services (mechanic only)
router.post('/:id/services', auth, authorize('mechanic'), [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('description').trim().notEmpty().withMessage('Service description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Service price must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const mechanic = await Mechanic.findOne({ _id: req.params.id, user: req.user.id });

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic profile not found or unauthorized' });
    }

    const { name, description, price, estimatedDuration } = req.body;

    if (!mechanic.services) {
      mechanic.services = [];
    }

    mechanic.services.push({ name, description, price, estimatedDuration });
    await mechanic.save();

    res.json({
      message: 'Service added successfully',
      services: mechanic.services
    });
  } catch (error) {
    console.error('Add service error:', error);
    res.status(500).json({ message: 'Server error while adding service' });
  }
});

// Delete a service from mechanic's services (mechanic only)
router.delete('/:id/services/:serviceIndex', auth, authorize('mechanic'), async (req, res) => {
  try {
    const mechanic = await Mechanic.findOne({ _id: req.params.id, user: req.user.id });

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic profile not found or unauthorized' });
    }

    const serviceIndex = parseInt(req.params.serviceIndex);

    if (!mechanic.services || serviceIndex < 0 || serviceIndex >= mechanic.services.length) {
      return res.status(404).json({ message: 'Service not found' });
    }

    mechanic.services.splice(serviceIndex, 1);
    await mechanic.save();

    res.json({
      message: 'Service deleted successfully',
      services: mechanic.services
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error while deleting service' });
  }
});

module.exports = router;

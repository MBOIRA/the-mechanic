const express = require('express');
const { body, validationResult } = require('express-validator');
const Service = require('../models/Service');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get emergency services
router.get('/services', async (req, res) => {
  try {
    const emergencyServices = await Service.find({ 
      isEmergency: true, 
      isActive: true 
    }).sort({ category: 1, name: 1 });

    res.json({
      message: 'Emergency services retrieved successfully',
      services: emergencyServices
    });
  } catch (error) {
    console.error('Get emergency services error:', error);
    res.status(500).json({ message: 'Server error while fetching emergency services' });
  }
});

// Submit emergency request
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.coordinates.lat').isFloat().withMessage('Latitude is required'),
  body('location.coordinates.lng').isFloat().withMessage('Longitude is required'),
  body('issue').trim().notEmpty().withMessage('Issue description is required'),
  body('vehicleType').isIn(['car', 'truck', 'motorcycle', 'other']).withMessage('Invalid vehicle type'),
  body('urgency').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid urgency level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const emergencyRequest = {
      ...req.body,
      status: 'pending',
      submittedAt: new Date(),
      requestId: `EMR-${Date.now()}`
    };

    // In a real application, you would:
    // 1. Save to database
    // 2. Send notifications to nearby mechanics
    // 3. Send SMS/email alerts
    // 4. Create tracking system

    // For now, we'll just acknowledge receipt
    res.status(201).json({
      message: 'Emergency request submitted successfully',
      requestId: emergencyRequest.requestId,
      estimatedResponseTime: '15-30 minutes',
      emergencyContacts: [
        { name: 'Local Emergency Services', number: '911' },
        { name: 'Roadside Assistance', number: '1-800-HELP-NOW' }
      ]
    });
  } catch (error) {
    console.error('Submit emergency request error:', error);
    res.status(500).json({ message: 'Server error while submitting emergency request' });
  }
});

// Get nearby emergency mechanics
router.get('/mechanics', async (req, res) => {
  try {
    const { lat, lng, radius = 25 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const Mechanic = require('../models/Mechanic');
    
    const emergencyMechanics = await Mechanic.find({
      isAvailable: true,
      isVerified: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1609.34 // Convert miles to meters
        }
      },
      specialization: { $in: ['Emergency Services', 'General Maintenance'] }
    })
    .populate('user', 'firstName lastName phone')
    .sort({ 'rating.average': -1 })
    .limit(10);

    res.json({
      message: 'Emergency mechanics retrieved successfully',
      mechanics: emergencyMechanics,
      searchRadius: `${radius} miles`
    });
  } catch (error) {
    console.error('Get emergency mechanics error:', error);
    res.status(500).json({ message: 'Server error while fetching emergency mechanics' });
  }
});

// Track emergency request status
router.get('/track/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    // In a real application, you would fetch from database
    // For now, we'll return a mock response
    const mockStatus = {
      requestId,
      status: 'dispatched',
      mechanicName: 'John Doe',
      mechanicPhone: '+1234567890',
      estimatedArrival: '15 minutes',
      currentLocation: '2.5 miles away',
      lastUpdated: new Date()
    };

    res.json({
      message: 'Emergency request status retrieved successfully',
      status: mockStatus
    });
  } catch (error) {
    console.error('Track emergency request error:', error);
    res.status(500).json({ message: 'Server error while tracking emergency request' });
  }
});

module.exports = router;

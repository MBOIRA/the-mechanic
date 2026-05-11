const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all bookings for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = {};

    // Filter by user role
    if (req.user.role === 'client') {
      query.client = req.user.id;
    } else if (req.user.role === 'mechanic') {
      query.mechanic = req.user.id;
    }

    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    const bookings = await Booking.find(query)
      .populate('client', 'firstName lastName email phone')
      .populate('mechanic', 'businessName location firstName lastName')
            .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      message: 'Bookings retrieved successfully',
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
});

// Get bookings by mechanic ID (for mechanic bookings page)
router.get('/mechanic/:mechanicId', auth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = { mechanic: req.params.mechanicId };
    
    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    const bookings = await Booking.find(query)
      .populate('client', 'firstName lastName email phone')
      .populate('mechanic', 'businessName location firstName lastName')
            .sort({ createdAt: -1 });

    res.json({
      bookings
    });
  } catch (error) {
    console.error('Get mechanic bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    const isAuthorized = 
      (req.user.role === 'client' && booking.client.toString() === req.user.id) ||
      (req.user.role === 'mechanic' && booking.mechanic.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    // Populate after authorization check
    const populatedBooking = await Booking.findById(req.params.id)
      .populate('client', 'firstName lastName email phone')
      .populate('mechanic', 'businessName location firstName lastName')
      .populate('notes.author', 'firstName lastName');

    res.json({
      message: 'Booking retrieved successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error while fetching booking' });
  }
});

// Create new booking (client only)
router.post('/', auth, authorize('client'), [
  body('mechanic').notEmpty().withMessage('Mechanic is required'),
  body('service').notEmpty().withMessage('Service is required'),
  body('vehicle.make').notEmpty().withMessage('Vehicle make is required'),
  body('vehicle.model').notEmpty().withMessage('Vehicle model is required'),
  body('vehicle.year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid vehicle year'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').notEmpty().withMessage('Scheduled time is required'),
  body('estimatedDuration').isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes'),
  body('location.type').isIn(['shop', 'mobile']).withMessage('Location type must be shop or mobile'),
  body('description').trim().notEmpty().withMessage('Problem description is required'),
  body('pricing.estimatedCost').isFloat({ min: 0 }).withMessage('Estimated cost must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = new Booking({
      ...req.body,
      client: req.user.id
    });

    await booking.save();

    // Create notification for the mechanic
    try {
      const notification = new Notification({
        userId: req.body.mechanic,
        type: 'booking',
        title: 'New Booking Request',
        message: `New booking request received`,
        relatedId: booking._id,
        priority: 'high',
        actionUrl: `/mechanic/bookings/${booking._id}`,
        metadata: {
          clientName: `${req.user.firstName || 'Client'} ${req.user.lastName || ''}`,
          serviceName: req.body.service?.name || 'Service',
          scheduledDate: req.body.scheduledDate,
          scheduledTime: req.body.scheduledTime
        }
      });
      await notification.save();
      console.log('Notification created:', notification._id);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the booking if notification creation fails
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('client', 'firstName lastName email phone')
      .populate('mechanic', 'businessName location firstName lastName')
      ;

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
});

// Create emergency booking
router.post('/emergency', auth, [
  body('vehicle').notEmpty().withMessage('Vehicle details are required'),
  body('vehicle.make').notEmpty().withMessage('Vehicle make is required'),
  body('vehicle.model').notEmpty().withMessage('Vehicle model is required'),
  body('vehicle.year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid vehicle year'),
  body('location').notEmpty().withMessage('Location is required'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('emergencyType').isIn(['towing', 'dead_battery', 'flat_tire', 'engine_failure', 'accident', 'other']).withMessage('Invalid emergency type'),
  body('estimatedCost').isFloat({ min: 0 }).withMessage('Estimated cost must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let mechanic = null;
    
    // If mechanic is specified, use that mechanic
    if (req.body.mechanic) {
      mechanic = await User.findById(req.body.mechanic);
      if (!mechanic) {
        return res.status(404).json({ message: 'Mechanic not found' });
      }

      if (mechanic.role !== 'mechanic') {
        return res.status(400).json({ message: 'Selected user is not a mechanic' });
      }

      // For manual selection, allow non-emergency mechanics
      // For auto selection, only allow emergency-available mechanics
      if (req.body.mechanicSelectionType === 'auto' && !mechanic.emergencyAvailable) {
        return res.status(400).json({ message: 'Mechanic is not available for emergencies' });
      }
    } else {
      // Find nearest emergency-available mechanic based on location
      const { lat, lng } = req.body.location.coordinates || {};
      
      if (lat && lng) {
        // First, try to find mechanics available for emergencies with location data
        let emergencyMechanics = await User.find({
          role: 'mechanic',
          emergencyAvailable: true,
          'location.coordinates.lat': { $exists: true },
          'location.coordinates.lng': { $exists: true }
        });

        if (emergencyMechanics.length === 0) {
          // Fallback: find any mechanic with location data
          emergencyMechanics = await User.find({
            role: 'mechanic',
            'location.coordinates.lat': { $exists: true },
            'location.coordinates.lng': { $exists: true }
          });
        }

        if (emergencyMechanics.length === 0) {
          return res.status(400).json({ message: 'No mechanics available for emergencies' });
        }

        // Calculate distance and find nearest
        let nearestMechanic = null;
        let minDistance = Infinity;

        emergencyMechanics.forEach(mech => {
          const mechLat = mech.location?.coordinates?.lat;
          const mechLng = mech.location?.coordinates?.lng;
          
          if (mechLat && mechLng) {
            const distance = Math.sqrt(
              Math.pow(lat - mechLat, 2) + Math.pow(lng - mechLng, 2)
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              nearestMechanic = mech;
            }
          }
        });

        if (!nearestMechanic) {
          return res.status(400).json({ message: 'No mechanics with valid location data available for emergencies' });
        }

        mechanic = nearestMechanic;
      } else {
        // No coordinates provided, just find any emergency-available mechanic
        mechanic = await User.findOne({
          role: 'mechanic',
          emergencyAvailable: true
        });

        // Fallback: find any mechanic if no emergency mechanics available
        if (!mechanic) {
          mechanic = await User.findOne({
            role: 'mechanic'
          });
        }

        if (!mechanic) {
          return res.status(400).json({ message: 'No mechanics available for emergencies' });
        }
      }
    }

    // Create emergency booking
    const description = req.body.otherEmergencyDescription || req.body.description || `Emergency: ${req.body.emergencyType.replace('_', ' ').toLowerCase()}`;
    const service = description;

    // Convert base64 image strings to image objects
    const images = (req.body.images || []).map(img => {
      if (typeof img === 'string') {
        return { url: img, description: 'Emergency photo' };
      }
      return img;
    });

    const booking = new Booking({
      client: req.user.id,
      mechanic: mechanic._id,
      service,
      description,
      vehicle: req.body.vehicle,
      scheduledDate: new Date(),
      scheduledTime: 'ASAP',
      estimatedDuration: req.body.estimatedDuration || 15,
      location: req.body.location,
      isEmergency: true,
      priority: 'emergency',
      emergencyType: req.body.emergencyType,
      emergencyFee: 50,
      pricing: {
        estimatedCost: req.body.estimatedCost || 0
      },
      images
    });

    await booking.save();

    // Create emergency notification for the mechanic
    const notification = new Notification({
      userId: mechanic._id,
      type: 'emergency',
      title: '🚨 EMERGENCY REQUEST',
      message: `Emergency request: ${req.body.emergencyType.replace('_', ' ').toUpperCase()} - ${req.body.service}`,
      relatedId: booking._id,
      priority: 'urgent',
      actionUrl: `/mechanic/bookings/${booking._id}`,
      metadata: {
        clientName: `${req.user.firstName} ${req.user.lastName}`,
        emergencyType: req.body.emergencyType,
        service: req.body.service,
        description: req.body.description,
        location: req.body.location.address,
        bookingId: booking._id
      }
    });
    await notification.save();
    console.log('Emergency notification created:', notification._id);

    const populatedBooking = await Booking.findById(booking._id)
      .populate('client', 'firstName lastName email phone')
      .populate('mechanic', 'businessName location firstName lastName phone');

    res.status(201).json({
      message: 'Emergency booking created successfully',
      booking: populatedBooking,
      mechanic: {
        id: mechanic._id,
        name: `${mechanic.firstName} ${mechanic.lastName}`,
        businessName: mechanic.businessName,
        phone: mechanic.phone,
        location: mechanic.location
      }
    });
  } catch (error) {
    console.error('Create emergency booking error:', error);
    res.status(500).json({ message: 'Server error while creating emergency booking' });
  }
});

// Update booking status
router.put('/:id/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const isAuthorized = 
      (req.user.role === 'client' && booking.client.toString() === req.user.id) ||
      (req.user.role === 'mechanic');

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const { status } = req.body;
    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Notify client about status change (if mechanic changed status)
    if (req.user.role === 'mechanic' && oldStatus !== status) {
      try {
        const statusMessages = {
          'confirmed': 'Mechanic has confirmed your booking',
          'in_progress': 'Mechanic has started working on your vehicle',
          'completed': 'Your service has been completed',
          'cancelled': 'Mechanic has cancelled your booking'
        };

        const notification = new Notification({
          userId: booking.client,
          type: 'status_update',
          title: 'Booking Status Updated',
          message: statusMessages[status] || `Booking status changed to ${status.replace('_', ' ')}`,
          relatedId: booking._id,
          priority: 'high',
          actionUrl: `/client/bookings/${booking._id}`,
          metadata: {
            oldStatus,
            newStatus: status,
            bookingId: booking._id
          }
        });
        await notification.save();
        console.log('Status update notification created:', notification._id);

        // Also create rating request notification if booking is completed
        if (status === 'completed') {
          const ratingNotification = new Notification({
            userId: booking.client,
            type: 'rating',
            title: 'Rate Your Mechanic',
            message: 'Your service is complete! Please rate your mechanic.',
            relatedId: booking._id,
            priority: 'medium',
            actionUrl: `/client/bookings/${booking._id}`,
            metadata: {
              bookingId: booking._id,
              mechanicName: booking.mechanic
            }
          });
          await ratingNotification.save();
          console.log('Rating notification created:', ratingNotification._id);
        }
      } catch (notificationError) {
        console.error('Error creating status update notification:', notificationError);
      }
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('client', 'firstName lastName email phone')
      .populate('mechanic', 'businessName location firstName lastName')
      ;

    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error while updating booking status' });
  }
});

// Add note to booking
router.post('/:id/notes', auth, [
  body('content').trim().notEmpty().withMessage('Note content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const isAuthorized = 
      (req.user.role === 'client' && booking.client.toString() === req.user.id) ||
      (req.user.role === 'mechanic');

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to add note to this booking' });
    }

    const note = {
      author: req.user.id,
      content: req.body.content,
      createdAt: new Date()
    };

    booking.notes.push(note);
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('client', 'firstName lastName email phone')
      .populate('mechanic', 'businessName location firstName lastName')
            .populate('notes.author', 'firstName lastName');

    res.json({
      message: 'Note added successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error while adding note' });
  }
});

// Rate and review booking (client only, after completion)
router.post('/:id/rating', auth, authorize('client'), [
  body('score').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 1000 }).withMessage('Review cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to rate this booking' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed bookings' });
    }

    booking.rating = {
      score: req.body.score,
      review: req.body.review,
      createdAt: new Date()
    };

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('client', 'firstName lastName email phone')
      .populate('mechanic', 'businessName location firstName lastName')
      ;

    res.json({
      message: 'Rating added successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Rate booking error:', error);
    res.status(500).json({ message: 'Server error while rating booking' });
  }
});

// Get messages for a booking
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is part of this booking (client or mechanic)
    if (booking.client.toString() !== req.user.id && booking.mechanic.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view messages for this booking' });
    }

    // If booking doesn't have messages field in schema, we'll return empty array
    const messages = booking.messages || [];

    // Populate sender information
    const populatedMessages = await Booking.populate(messages, {
      path: 'sender',
      select: 'firstName lastName email'
    });

    res.json({
      messages: populatedMessages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
});

// Send a message for a booking
router.post('/:id/messages', auth, [
  body('content').trim().notEmpty().withMessage('Message content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is part of this booking (client or mechanic)
    if (booking.client.toString() !== req.user.id && booking.mechanic.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to send messages for this booking' });
    }

    const message = {
      sender: req.user.id,
      content: req.body.content,
      createdAt: new Date()
    };

    // Initialize messages array if it doesn't exist
    if (!booking.messages) {
      booking.messages = [];
    }

    booking.messages.push(message);
    await booking.save();

    // If client sent the message, notify the mechanic
    if (req.user.role === 'client') {
      try {
        const notification = new Notification({
          userId: booking.mechanic,
          type: 'message',
          title: 'New Message from Client',
          message: `${req.user.firstName || 'Client'} ${req.user.lastName || ''}: ${req.body.content.substring(0, 50)}${req.body.content.length > 50 ? '...' : ''}`,
          relatedId: booking._id,
          priority: 'medium',
          actionUrl: `/mechanic/bookings/${booking._id}`,
          metadata: {
            clientName: `${req.user.firstName || 'Client'} ${req.user.lastName || ''}`,
            messageContent: req.body.content,
            bookingId: booking._id
          }
        });
        await notification.save();
        console.log('Message notification created:', notification._id);
      } catch (notificationError) {
        console.error('Error creating message notification:', notificationError);
        // Don't fail the message if notification creation fails
      }
    }

    // If mechanic sent the message, notify the client
    if (req.user.role === 'mechanic') {
      try {
        const notification = new Notification({
          userId: booking.client,
          type: 'message',
          title: 'New Message from Mechanic',
          message: `${req.user.firstName || 'Mechanic'} ${req.user.lastName || ''}: ${req.body.content.substring(0, 50)}${req.body.content.length > 50 ? '...' : ''}`,
          relatedId: booking._id,
          priority: 'medium',
          actionUrl: `/client/bookings/${booking._id}`,
          metadata: {
            mechanicName: `${req.user.firstName || 'Mechanic'} ${req.user.lastName || ''}`,
            messageContent: req.body.content,
            bookingId: booking._id
          }
        });
        await notification.save();
        console.log('Message notification created:', notification._id);
      } catch (notificationError) {
        console.error('Error creating message notification:', notificationError);
        // Don't fail the message if notification creation fails
      }
    }

    // Populate sender information
    const populatedMessage = await Booking.populate(message, {
      path: 'sender',
      select: 'firstName lastName email'
    });

    res.json({
      message: 'Message sent successfully',
      message: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
});

// Add rating to a booking
router.post('/:id/rating', auth, [
  body('score').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 1000 }).withMessage('Review cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the client who made the booking can rate
    if (booking.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to rate this booking' });
    }

    // Only completed bookings can be rated
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed bookings can be rated' });
    }

    // Check if already rated
    if (booking.rating) {
      return res.status(400).json({ message: 'This booking has already been rated' });
    }

    booking.rating = {
      score: req.body.score,
      review: req.body.review || '',
      createdAt: new Date()
    };

    await booking.save();

    // Create notification for the mechanic
    const notification = new Notification({
      userId: booking.mechanic,
      type: 'rating',
      title: 'New Rating Received',
      message: `${req.user.firstName} ${req.user.lastName} rated your service ${req.body.score}/5 stars`,
      relatedId: booking._id,
      priority: 'medium',
      actionUrl: `/mechanic/bookings/${booking._id}`,
      metadata: {
        clientName: `${req.user.firstName} ${req.user.lastName}`,
        rating: req.body.score,
        review: req.body.review || ''
      }
    });
    await notification.save();

    res.json({
      message: 'Rating submitted successfully',
      booking
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ message: 'Server error while adding rating' });
  }
});

// Get mechanic's average rating
router.get('/mechanic/:mechanicId/average-rating', async (req, res) => {
  try {
    const { mechanicId } = req.params;

    const ratings = await Booking.find({
      mechanic: mechanicId,
      status: 'completed',
      'rating.score': { $exists: true }
    }).select('rating.score');

    if (ratings.length === 0) {
      return res.json({
        average: 0,
        count: 0
      });
    }

    const total = ratings.reduce((sum, r) => sum + r.rating.score, 0);
    const average = total / ratings.length;

    res.json({
      average: parseFloat(average.toFixed(1)),
      count: ratings.length
    });
  } catch (error) {
    console.error('Get average rating error:', error);
    res.status(500).json({ message: 'Server error while fetching average rating' });
  }
});

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const Service = require('../models/Service');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const { category, isEmergency, search } = req.query;
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (isEmergency !== undefined) {
      query.isEmergency = isEmergency === 'true';
    }

    if (search) {
      query.$text = { $search: search };
    }

    const services = await Service.find(query).sort({ category: 1, name: 1 });

    res.json({
      message: 'Services retrieved successfully',
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error while fetching services' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (!service.isActive) {
      return res.status(404).json({ message: 'Service is not available' });
    }

    res.json({
      message: 'Service retrieved successfully',
      service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Server error while fetching service' });
  }
});

// Create new service (admin only)
router.post('/', auth, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('category').isIn([
    'Engine Repair', 'Transmission', 'Brakes', 'Electrical', 'AC & Heating',
    'Oil Change', 'Tire Service', 'Battery Service', 'Diagnostics',
    'General Maintenance', 'Body Work', 'Exhaust System', 'Emergency Services'
  ]).withMessage('Invalid category'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('estimatedDuration').isInt({ min: 15 }).withMessage('Duration must be at least 15 minutes'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be positive'),
  body('priceRange.min').isFloat({ min: 0 }).withMessage('Minimum price must be positive'),
  body('priceRange.max').isFloat({ min: 0 }).withMessage('Maximum price must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const service = new Service(req.body);
    await service.save();

    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error while creating service' });
  }
});

// Update service (admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error while updating service' });
  }
});

// Delete service (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error while deleting service' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/vehicles
// @desc    Get all vehicles for the logged in user
// @access  Private (Client only)
router.get('/', auth, authorize('client'), async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ client: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   POST /api/vehicles
// @desc    Add a new vehicle
// @access  Private (Client only)
router.post('/', auth, authorize('client'), async (req, res) => {
  try {
    // Add user to req.body
    req.body.client = req.user.id;

    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/vehicles/:id
// @desc    Delete a vehicle
// @access  Private (Client only)
router.delete('/:id', auth, authorize('client'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    // Make sure user owns the vehicle
    if (vehicle.client.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this vehicle' });
    }

    await vehicle.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;

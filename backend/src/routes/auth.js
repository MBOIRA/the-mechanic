const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register new user
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').matches(/^[\+]?[0-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['client', 'mechanic']).withMessage('Role must be either client or mechanic')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, password, role, ...mechanicData } = req.body;
    
    console.log('Registration request received:', { firstName, lastName, email, phone, role });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('User already exists:', email);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Convert availability checkbox values to booleans
    let processedMechanicData = { ...mechanicData };
    if (mechanicData.availability) {
      processedMechanicData.availability = {};
      for (const day in mechanicData.availability) {
        processedMechanicData.availability[day] = mechanicData.availability[day] === 'on' || mechanicData.availability[day] === true;
      }
    }

    // Convert specialization to array if it's a string
    if (typeof processedMechanicData.specialization === 'string') {
      processedMechanicData.specialization = [processedMechanicData.specialization];
    }

    // Convert certifications to array if it's a string
    if (typeof processedMechanicData.certifications === 'string') {
      processedMechanicData.certifications = [processedMechanicData.certifications];
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      ...(role === 'mechanic' && {
        ...processedMechanicData
      })
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
        ...(role === 'mechanic' && {
          businessName: user.businessName,
          specialization: user.specialization,
          experience: user.experience,
          bio: user.bio,
          location: user.location,
          serviceRadius: user.serviceRadius,
          pricing: user.pricing,
          certifications: user.certifications,
          availability: user.availability,
          services: user.services
        })
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    // Find user by email with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check role if provided, but allow admin to bypass
    if (role && user.role !== role && user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
        isVerified: user.isVerified,
        emergencyAvailable: user.emergencyAvailable,
        ...(user.role === 'mechanic' && {
          businessName: user.businessName,
          specialization: user.specialization,
          experience: user.experience,
          bio: user.bio,
          location: user.location,
          serviceRadius: user.serviceRadius,
          pricing: user.pricing,
          certifications: user.certifications,
          availability: user.availability,
          services: user.services
        })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        emergencyAvailable: user.emergencyAvailable,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().matches(/^[\+]?[0-9][\d]{0,15}$/).withMessage('Please enter a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone, profileImage, emergencyAvailable } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (emergencyAvailable !== undefined) updateData.emergencyAvailable = emergencyAvailable;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        emergencyAvailable: user.emergencyAvailable,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

module.exports = router;

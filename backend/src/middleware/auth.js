const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully. User ID:', decoded.id);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.error('User not found in database for ID:', decoded.id);
      return res.status(401).json({ message: 'Token is valid but user not found.' });
    }

    console.log('User found:', { 
      id: user._id, 
      email: user.email, 
      firstName: user.firstName, 
      lastName: user.lastName, 
      role: user.role,
      isActive: user.isActive 
    });

    if (!user.isActive) {
      console.error('User account is deactivated:', user.email);
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    // Check for required fields that might be missing (relaxed for presentation)
    if (!user.email || !user.role) {
      console.error('User missing critical fields:', { 
        id: user._id, 
        hasEmail: !!user.email, 
        hasRole: !!user.role 
      });
      return res.status(401).json({ message: 'User data is incomplete. Please contact support.' });
    }

    // Set default names if missing (for presentation)
    if (!user.firstName) user.firstName = 'User';
    if (!user.lastName) user.lastName = 'Account';

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error in authentication.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = { auth, authorize };

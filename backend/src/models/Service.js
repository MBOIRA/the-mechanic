const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'Engine Repair',
      'Transmission',
      'Brakes',
      'Electrical',
      'AC & Heating',
      'Oil Change',
      'Tire Service',
      'Battery Service',
      'Diagnostics',
      'General Maintenance',
      'Body Work',
      'Exhaust System',
      'Emergency Services'
    ]
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  estimatedDuration: {
    type: Number,
    required: [true, 'Estimated duration is required'],
    min: [15, 'Duration must be at least 15 minutes']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  priceRange: {
    min: {
      type: Number,
      required: true,
      min: [0, 'Minimum price cannot be negative']
    },
    max: {
      type: Number,
      required: true,
      min: [0, 'Maximum price cannot be negative']
    }
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  requiresSpecialization: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better search performance
serviceSchema.index({ category: 1 });
serviceSchema.index({ isEmergency: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);

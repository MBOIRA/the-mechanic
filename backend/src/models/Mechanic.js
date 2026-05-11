const mongoose = require('mongoose');

const mechanicSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  specialization: [{
    type: String,
    required: [true, 'At least one specialization is required'],
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
      'Exhaust System'
    ]
  }],
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  serviceRadius: {
    type: Number,
    default: 10,
    min: [1, 'Service radius must be at least 1 mile'],
    max: [100, 'Service radius cannot exceed 100 miles']
  },
  availability: {
    monday: { open: String, close: String, available: Boolean },
    tuesday: { open: String, close: String, available: Boolean },
    wednesday: { open: String, close: String, available: Boolean },
    thursday: { open: String, close: String, available: Boolean },
    friday: { open: String, close: String, available: Boolean },
    saturday: { open: String, close: String, available: Boolean },
    sunday: { open: String, close: String, available: Boolean }
  },
  pricing: {
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [0, 'Hourly rate cannot be negative']
    },
    diagnosticFee: {
      type: Number,
      default: 0,
      min: [0, 'Diagnostic fee cannot be negative']
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative']
    }
  },
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
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
mechanicSchema.index({ 'location.coordinates': '2dsphere' });
mechanicSchema.index({ specialization: 1 });
mechanicSchema.index({ rating: -1 });
mechanicSchema.index({ isAvailable: 1 });
mechanicSchema.index({ isVerified: -1 });

module.exports = mongoose.model('Mechanic', mechanicSchema);

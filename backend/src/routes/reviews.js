const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Mechanic = require('../models/Mechanic');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Create a review (client only)
router.post('/', auth, authorize('client'), [
  body('mechanic').notEmpty().withMessage('Mechanic ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mechanic, rating, comment, booking } = req.body;

    // Check if mechanic exists
    const mechanicExists = await Mechanic.findById(mechanic);
    if (!mechanicExists) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    // Check if client already reviewed this mechanic
    const existingReview = await Review.findOne({ mechanic, client: req.user.id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this mechanic' });
    }

    const review = new Review({
      mechanic,
      client: req.user.id,
      rating,
      comment,
      booking,
      isVerified: !!booking // Auto-verify if linked to a booking
    });

    await review.save();

    // Update mechanic's average rating
    const allReviews = await Review.find({ mechanic });
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Mechanic.findByIdAndUpdate(mechanic, {
      'rating.average': averageRating,
      'rating.count': allReviews.length
    });

    const populatedReview = await Review.findById(review._id)
      .populate('client', 'firstName lastName')
      .populate('mechanic', 'businessName');

    res.status(201).json({
      message: 'Review created successfully',
      review: populatedReview
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error while creating review' });
  }
});

// Get reviews for a mechanic
router.get('/mechanic/:mechanicId', async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ mechanic: mechanicId })
      .populate('client', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ mechanic: mechanicId });

    res.json({
      message: 'Reviews retrieved successfully',
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
});

// Get client's reviews
router.get('/my-reviews', auth, authorize('client'), async (req, res) => {
  try {
    const reviews = await Review.find({ client: req.user.id })
      .populate('mechanic', 'businessName specialization location')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Your reviews retrieved successfully',
      reviews
    });
  } catch (error) {
    console.error('Get client reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching your reviews' });
  }
});

// Delete a review (client only, own reviews)
router.delete('/:id', auth, authorize('client'), async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, client: req.user.id });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    const mechanicId = review.mechanic;

    await Review.findByIdAndDelete(req.params.id);

    // Recalculate mechanic's average rating
    const allReviews = await Review.find({ mechanic: mechanicId });
    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await Mechanic.findByIdAndUpdate(mechanicId, {
      'rating.average': averageRating,
      'rating.count': allReviews.length
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error while deleting review' });
  }
});

module.exports = router;

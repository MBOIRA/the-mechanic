const express = require('express');
const { body, validationResult } = require('express-validator');
const Inquiry = require('../models/Inquiry');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all inquiries (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const inquiries = await Inquiry.find(query)
      .populate('userId', 'firstName lastName email phone role')
      .populate('response.respondedBy', 'firstName lastName email')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Inquiry.countDocuments(query);

    res.json({
      message: 'Inquiries retrieved successfully',
      inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ message: 'Server error while fetching inquiries' });
  }
});

// Get inquiry by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Only admin or inquiry owner can view
    if (req.user.role !== 'admin' && inquiry.email !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to view this inquiry' });
    }

    res.json({
      message: 'Inquiry retrieved successfully',
      inquiry
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({ message: 'Server error while fetching inquiry' });
  }
});

// Create new inquiry (public)
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').optional({ values: 'falsy' }).matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('category').optional().isIn(['general', 'complaint', 'suggestion', 'technical', 'billing', 'partnership']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inquiry = new Inquiry(req.body);
    await inquiry.save();

    res.status(201).json({
      message: 'Inquiry submitted successfully',
      inquiry
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ message: 'Server error while submitting inquiry' });
  }
});

// Update inquiry status (admin only)
router.put('/:id/status', auth, authorize('admin'), [
  body('status').isIn(['pending', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    res.json({
      message: 'Inquiry status updated successfully',
      inquiry
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({ message: 'Server error while updating inquiry status' });
  }
});

// Respond to inquiry (admin only)
router.post('/:id/response', auth, authorize('admin'), [
  body('content').trim().notEmpty().withMessage('Response content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      {
        response: {
          content: req.body.content,
          respondedBy: req.user.id,
          respondedAt: new Date()
        },
        status: 'resolved'
      },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email')
     .populate('response.respondedBy', 'firstName lastName email');

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Create notification for the user who submitted the inquiry
    if (inquiry.userId) {
      try {
        const notification = new Notification({
          userId: inquiry.userId._id,
          type: 'inquiry',
          title: 'Support Reply Received',
          message: `Admin has replied to your inquiry "${inquiry.subject}": ${req.body.content.substring(0, 100)}${req.body.content.length > 100 ? '...' : ''}`,
          relatedId: inquiry._id,
          priority: inquiry.priority === 'high' ? 'high' : 'medium',
          actionUrl: '/inquiries',
          metadata: {
            inquiryId: inquiry._id,
            inquirySubject: inquiry.subject,
            responseContent: req.body.content
          }
        });
        await notification.save();
        console.log('Notification created for user:', inquiry.userId._id);
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Don't fail the response if notification creation fails
      }
    }

    res.json({
      message: 'Response added successfully',
      inquiry
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({ message: 'Server error while adding response' });
  }
});

module.exports = router;

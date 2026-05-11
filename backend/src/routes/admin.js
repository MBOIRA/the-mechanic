const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const Mechanic = require('../models/Mechanic');
const Subscription = require('../models/Subscription');

const router = express.Router();

// Middleware to ensure user is admin
router.use(auth, authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalMechanics = await User.countDocuments({ role: 'mechanic' });
    
    // Calculate total income from subscriptions (Mocking this as $50 per mechanic for now)
    const subscriptionIncome = totalMechanics * 50; 

    // Aggregate users by month for the graph
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format graph data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const graphData = userGrowth.map(item => ({
      name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      users: item.count,
      subscriptions: Math.floor(item.count * 0.3) // Mocking subscription growth relative to user growth
    }));

    res.json({
      totalClients,
      totalMechanics,
      subscriptionIncome,
      graphData
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// @route   GET /api/admin/support
// @desc    Get all user support inquiries
router.get('/support', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching support inquiries:', error);
    res.status(500).json({ message: 'Server error fetching inquiries' });
  }
});

// @route   POST /api/admin/support/:id/reply
// @desc    Reply to a support inquiry
router.post('/support/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    inquiry.response = {
      content: reply,
      respondedBy: req.user._id,
      respondedAt: new Date()
    };
    inquiry.status = 'resolved';
    await inquiry.save();

    res.json({ message: 'Reply sent successfully', inquiry });
  } catch (error) {
    console.error('Error replying to inquiry:', error);
    res.status(500).json({ message: 'Server error sending reply' });
  }
});

// @route   GET /api/admin/subscriptions
// @desc    Get all mechanic subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('mechanic', 'businessName specialization')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Server error fetching subscriptions' });
  }
});

// @route   GET /api/admin/subscriptions/stats
// @desc    Get subscription statistics
router.get('/subscriptions/stats', async (req, res) => {
  try {
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const totalRevenue = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const revenueByPlan = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$plan', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({
      totalSubscriptions,
      activeSubscriptions,
      totalRevenue: totalRevenue[0]?.total || 0,
      revenueByPlan
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({ message: 'Server error fetching subscription stats' });
  }
});

module.exports = router;

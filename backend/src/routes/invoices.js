const express = require('express');
const { body, validationResult } = require('express-validator');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Create new invoice (mechanic only)
router.post('/', auth, authorize('mechanic'), [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findById(req.body.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if mechanic owns this booking
    if (booking.mechanic.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create invoice for this booking' });
    }

    // Calculate totals
    const subtotal = req.body.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = req.body.tax || 0;
    const discount = req.body.discount || 0;
    const total = subtotal + tax - discount;

    const invoice = new Invoice({
      booking: req.body.bookingId,
      mechanic: req.user.id,
      client: booking.client,
      items: req.body.items,
      subtotal,
      tax,
      discount,
      total,
      dueDate: req.body.dueDate,
      notes: req.body.notes
    });

    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('booking', 'service scheduledDate')
      .populate('mechanic', 'firstName lastName businessName email phone')
      .populate('client', 'firstName lastName email phone');

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: populatedInvoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Server error while creating invoice' });
  }
});

// Get invoices for mechanic
router.get('/mechanic', auth, authorize('mechanic'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = { mechanic: req.user.id };

    if (status) {
      query.status = status;
    }

    const invoices = await Invoice.find(query)
      .populate('booking', 'service scheduledDate')
      .populate('client', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invoice.countDocuments(query);

    res.json({
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get mechanic invoices error:', error);
    res.status(500).json({ message: 'Server error while fetching invoices' });
  }
});

// Get invoice by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('booking', 'service scheduledDate location')
      .populate('mechanic', 'firstName lastName businessName email phone location')
      .populate('client', 'firstName lastName email phone');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check authorization
    const isAuthorized = 
      (req.user.role === 'mechanic' && invoice.mechanic._id.toString() === req.user.id) ||
      (req.user.role === 'client' && invoice.client._id.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    res.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server error while fetching invoice' });
  }
});

// Send invoice to client (mechanic only)
router.post('/:id/send', auth, authorize('mechanic'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if mechanic owns this invoice
    if (invoice.mechanic.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to send this invoice' });
    }

    if (invoice.status === 'sent') {
      return res.status(400).json({ message: 'Invoice has already been sent' });
    }

    invoice.status = 'sent';
    invoice.sentAt = new Date();
    await invoice.save();

    // Create notification for client
    const Notification = require('../models/Notification');
    const notification = new Notification({
      userId: invoice.client,
      type: 'message',
      title: 'New Invoice Received',
      message: `You have received a new invoice for your booking. Invoice #${invoice.invoiceNumber}`,
      relatedId: invoice._id,
      priority: 'high',
      actionUrl: `/client/invoices/${invoice._id}`,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        dueDate: invoice.dueDate
      }
    });
    await notification.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('booking', 'service')
      .populate('client', 'firstName lastName email')
      .populate('mechanic', 'businessName');

    res.json({
      message: 'Invoice sent successfully',
      invoice: populatedInvoice
    });
  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({ message: 'Server error while sending invoice' });
  }
});

// Update invoice
router.put('/:id', auth, authorize('mechanic'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if mechanic owns this invoice
    if (invoice.mechanic.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this invoice' });
    }

    // Cannot update if already sent
    if (invoice.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot update invoice that has been sent' });
    }

    if (req.body.items) {
      const subtotal = req.body.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const tax = req.body.tax || 0;
      const discount = req.body.discount || 0;
      const total = subtotal + tax - discount;

      invoice.items = req.body.items;
      invoice.subtotal = subtotal;
      invoice.tax = tax;
      invoice.discount = discount;
      invoice.total = total;
    }

    if (req.body.dueDate) invoice.dueDate = req.body.dueDate;
    if (req.body.notes) invoice.notes = req.body.notes;

    invoice.updatedAt = new Date();
    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('booking', 'service')
      .populate('client', 'firstName lastName email')
      .populate('mechanic', 'businessName');

    res.json({
      message: 'Invoice updated successfully',
      invoice: populatedInvoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Server error while updating invoice' });
  }
});

// Delete invoice
router.delete('/:id', auth, authorize('mechanic'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if mechanic owns this invoice
    if (invoice.mechanic.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this invoice' });
    }

    // Cannot delete if already sent
    if (invoice.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot delete invoice that has been sent' });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ message: 'Server error while deleting invoice' });
  }
});

module.exports = router;

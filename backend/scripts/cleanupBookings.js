require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../src/models/Booking');
const User = require('../src/models/User');

const cleanupBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');

    // Get all valid mechanic IDs
    const mechanics = await User.find({ role: 'mechanic' }).select('_id');
    const mechanicIds = mechanics.map(m => m._id.toString());
    console.log(`📊 Valid mechanic IDs: ${mechanicIds.length}`);

    // Delete bookings with invalid mechanic references
    const result = await Booking.deleteMany({ 
      mechanic: { $nin: mechanicIds }
    });
    console.log(`🗑️  Deleted ${result.deletedCount} bookings with invalid mechanic references`);

    // Verify remaining bookings
    const remainingBookings = await Booking.countDocuments();
    console.log(`📊 Remaining bookings: ${remainingBookings}`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanupBookings();

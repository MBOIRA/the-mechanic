require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('../src/models/Booking');
const User = require('../src/models/User');

const checkBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');

    // Get all bookings
    const bookings = await Booking.find()
      .populate('client', 'fullName email role')
      .populate('mechanic', 'fullName email role')
      .sort({ createdAt: -1 });

    console.log(`\n📊 Total bookings: ${bookings.length}\n`);

    bookings.forEach((booking, index) => {
      console.log(`\n--- Booking ${index + 1} ---`);
      console.log(`ID: ${booking._id}`);
      console.log(`Status: ${booking.status}`);
      console.log(`Service: ${booking.service}`);
      console.log(`Client: ${booking.client?.fullName || 'N/A'} (${booking.client?.email || 'N/A'}) - Role: ${booking.client?.role || 'N/A'}`);
      console.log(`Mechanic: ${booking.mechanic?.fullName || 'N/A'} (${booking.mechanic?.email || 'N/A'}) - Role: ${booking.mechanic?.role || 'N/A'}`);
      console.log(`Mechanic ID: ${booking.mechanic?._id || 'NOT SET'}`);
    });

    // Get all mechanics
    const mechanics = await User.find({ role: 'mechanic' });
    console.log(`\n\n📊 Total mechanics: ${mechanics.length}\n`);
    mechanics.forEach((mechanic) => {
      console.log(`- ${mechanic.fullName} (${mechanic.email}) - ID: ${mechanic._id}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkBookings();

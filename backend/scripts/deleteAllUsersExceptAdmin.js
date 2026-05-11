require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const deleteAllUsersExceptAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔗 Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@themechanic.com' });
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log(`✅ Admin found: ${admin.email} (ID: ${admin._id})`);

    // Delete all users except admin
    const result = await User.deleteMany({ 
      email: { $ne: 'admin@themechanic.com' } 
    });

    console.log(`🗑️  Deleted ${result.deletedCount} user(s) (excluding admin)`);

    // Verify
    const remainingUsers = await User.countDocuments();
    console.log(`📊 Remaining users in database: ${remainingUsers}`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

deleteAllUsersExceptAdmin();

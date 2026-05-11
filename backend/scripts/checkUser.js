const mongoose = require('mongoose');
const User = require('../src/models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mboira:password@ac-a3vfei1-shard-00-00.1mghfcz.mongodb.net/test?retryWrites=true&w=majority')
  .then(async () => {
    console.log('Connected to MongoDB');
    const users = await User.find({}).select('firstName lastName email role isActive');
    console.log('All users:', JSON.stringify(users, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

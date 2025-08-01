const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const users = [
  {
    name: 'System Admin',
    email: 'admin@taskmanagement.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    name: 'Jane Smith',
    email: 'jane@taskmanagement.com',
    password: 'User123!',
    role: 'user'
  },
  {
    name: 'Mike Johnson',
    email: 'mike@taskmanagement.com',
    password: 'User123!',
    role: 'user'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah@taskmanagement.com',
    password: 'User123!',
    role: 'user'
  },
  {
    name: 'David Brown',
    email: 'david@taskmanagement.com',
    password: 'User123!',
    role: 'user'
  }
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (optional)
    if (process.argv.includes('--clear')) {
      await User.deleteMany({});
      console.log('Cleared existing users');
    }

    // Create users
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        
        await user.save();
        console.log(`Created user: ${userData.name} (${userData.email})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('User seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
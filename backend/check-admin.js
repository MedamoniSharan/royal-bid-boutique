import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const checkAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/royal-bid-boutique');
    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@royalbidboutique.com' });
    
    if (admin) {
      console.log('\n✅ Admin user found!');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Is Verified:', admin.isVerified);
      console.log('Is Active:', admin.isActive);
      console.log('Has Password:', !!admin.password);
      console.log('User ID:', admin._id);
    } else {
      console.log('\n❌ Admin user NOT found!');
      console.log('Please run: node setup-admin.js');
    }

    // Check all users
    const allUsers = await User.find({}).select('email role firstName lastName');
    console.log('\n📋 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Role: ${user.role} - Name: ${user.firstName} ${user.lastName}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

checkAdmin();


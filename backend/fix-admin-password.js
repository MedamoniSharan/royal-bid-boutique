import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fixAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/royal-bid-boutique');
    console.log('Connected to MongoDB');

    // Hash the password
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');

    // Update admin user
    const result = await User.updateOne(
      { email: 'admin@royalbidboutique.com' },
      { 
        $set: {
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
          isActive: true
        }
      }
    );

    console.log('\n✅ Admin password updated!');
    console.log('Updated documents:', result.modifiedCount);
    
    // Verify the update
    const admin = await User.findOne({ email: 'admin@royalbidboutique.com' });
    console.log('\n📋 Verification:');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Has Password:', !!admin.password);
    console.log('Is Verified:', admin.isVerified);
    console.log('Is Active:', admin.isActive);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Email: admin@royalbidboutique.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

fixAdminPassword();


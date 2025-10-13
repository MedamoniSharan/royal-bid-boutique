import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const verifyAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/royal-bid-boutique');
    console.log('Connected to MongoDB');

    // Find admin user WITH password field
    const admin = await User.findOne({ email: 'admin@royalbidboutique.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('\n✅ Admin user found!');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Has Password Hash:', !!admin.password);
    console.log('Password Hash Length:', admin.password ? admin.password.length : 0);
    
    // Test password comparison
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    
    console.log('\n🔐 Password Test:');
    console.log('Test Password: admin123');
    console.log('Password Match:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');
    
    if (isMatch) {
      console.log('\n🎉 SUCCESS! You can login with:');
      console.log('Email: admin@royalbidboutique.com');
      console.log('Password: admin123');
    } else {
      console.log('\n⚠️  Password does not match. Setting new password...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.updateOne(
        { email: 'admin@royalbidboutique.com' },
        { $set: { password: hashedPassword } }
      );
      console.log('✅ Password has been reset to: admin123');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

verifyAdmin();


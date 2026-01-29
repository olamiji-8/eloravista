
// scripts/createAdmin.js
// Run this with: node scripts/createAdmin.js

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  isVerified: Boolean,
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@eloravista.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update to admin role if needed
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isVerified = true;
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      // Create admin user
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@eloravista.com',
        password: hashedPassword,
        phone: '+234 000 000 0000',
        role: 'admin',
        isVerified: true,
      });

      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@eloravista.com');
      console.log('Password: admin123');
      console.log('⚠️  IMPORTANT: Change this password after first login!');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
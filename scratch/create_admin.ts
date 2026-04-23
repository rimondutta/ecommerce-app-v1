import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flexwear';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@flexwear.com';
    const password = 'adminpassword123';
    const hashedPassword = await bcrypt.hash(password, 12);

    await User.findOneAndUpdate(
      { email },
      {
        name: 'Admin User',
        email,
        password: hashedPassword,
        role: 'admin',
      },
      { upsert: true, new: true }
    );

    console.log('Admin user created successfully');
    console.log('Email:', email);
    console.log('Password:', password);
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error);
    process.exit(1);
  }
}

createAdmin();

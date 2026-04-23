import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

async function seedAdmin() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const adminEmail = 'admin@flexwear.com';
  
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log('Admin already exists.');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await User.create({
    name: 'Admin',
    email: adminEmail,
    password: hashedPassword,
    role: 'admin'
  });

  console.log('Admin user created: admin@flexwear.com / admin123');
  process.exit(0);
}

seedAdmin();

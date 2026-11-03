/**
 * scripts/ensure-indexes.js
 *
 * Idempotent database index synchronization utility.
 * Safe to execute on existing production MongoDB databases.
 * Does NOT drop or modify existing collections or documents.
 *
 * Usage:
 *   node scripts/ensure-indexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function ensureIndexes() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected successfully. Syncing indexes...');

  const db = mongoose.connection.db;

  // 1. Order indexes
  console.log('Creating Order indexes...');
  const orders = db.collection('orders');
  await orders.createIndex({ customerEmail: 1, createdAt: -1 });
  await orders.createIndex({ createdAt: -1 });
  await orders.createIndex({ fulfillmentStatus: 1, createdAt: -1 });
  await orders.createIndex({ paymentStatus: 1, createdAt: -1 });
  await orders.createIndex({ guestAccessTokenHash: 1 }, { sparse: true });
  await orders.createIndex({ invoiceNumber: 1 }, { unique: true, sparse: true });

  // 2. Product indexes
  console.log('Creating Product indexes...');
  const products = db.collection('products');
  await products.createIndex({ slug: 1 }, { unique: true });
  await products.createIndex({ isPublished: 1, category: 1 });
  await products.createIndex({ isPublished: 1, createdAt: -1 });
  await products.createIndex({ isPublished: 1, ageRange: 1 });
  await products.createIndex({ isPublished: 1, price: 1 });
  await products.createIndex({ isPublished: 1, price: -1 });
  await products.createIndex({ title: 'text', description: 'text' });

  // 3. User indexes
  console.log('Creating User indexes...');
  const users = db.collection('users');
  await users.createIndex({ email: 1 }, { unique: true });

  // 4. Coupon indexes
  console.log('Creating Coupon indexes...');
  const coupons = db.collection('coupons');
  await coupons.createIndex({ code: 1 }, { unique: true });

  // 5. Category indexes
  console.log('Creating Category indexes...');
  const categories = db.collection('categories');
  await categories.createIndex({ slug: 1 }, { unique: true, sparse: true });

  console.log('✅ All indexes successfully verified and synced.');
  await mongoose.disconnect();
  process.exit(0);
}

ensureIndexes().catch((err) => {
  console.error('❌ Index synchronization error:', err);
  process.exit(1);
});


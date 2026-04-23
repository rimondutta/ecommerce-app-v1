import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../src/models/Review';
import Product from '../src/models/Product';
import User from '../src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flexwear';

async function seedReviews() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a product
    const product = await Product.findOne({ slug: 'knit-polo-shirt' });
    if (!product) {
      console.log('Product not found');
      process.exit(1);
    }

    // Get/Create a test user
    let user = await User.findOne({ email: 'testcustomer@example.com' });
    if (!user) {
        user = await User.create({
            name: 'John Archival',
            email: 'testcustomer@example.com',
            password: 'password123', // Hardcoded for test
            role: 'admin' // Using admin as placeholder
        });
    }

    // Create some reviews
    const reviewsData = [
      {
        productId: product._id,
        userId: user._id,
        userName: 'John Archival',
        rating: 5,
        comment: 'The silhouette is perfection. High-density weave feels exactly like archival pieces from the early 2000s. A must-have for the modern nomad.',
        isVerifiedPurchase: true
      },
      {
        productId: product._id,
        userId: user._id,
        userName: 'Elena V.',
        rating: 4,
        comment: 'Exceptional texture. The polo drape is very structural. Only wish the buttons were slightly larger, but the overall aesthetic is unmatched.',
        isVerifiedPurchase: true
      }
    ];

    for (const r of reviewsData) {
      await Review.findOneAndUpdate(
        { productId: r.productId, userName: r.userName },
        r,
        { upsert: true, new: true }
      );
      console.log(`Added review by ${r.userName}`);
    }

    console.log('Review seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedReviews();

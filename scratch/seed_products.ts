import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product';
import Category from '../src/models/Category';
import { products } from '../src/data/products';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flexwear';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Ensure we have a default category
    let defaultCategory = await Category.findOne({ slug: 'tops' });
    if (!defaultCategory) {
      defaultCategory = await Category.create({
        name: 'Tops',
        slug: 'tops',
        description: 'Pants and more',
      });
    }

    const categoryMap: Record<string, any> = {
      'Tops': defaultCategory._id,
      'Pants': defaultCategory._id,
      'Outerwear': defaultCategory._id,
      'Accessories': defaultCategory._id,
    };

    // Upsert all products from mock data
    for (const p of products) {
      const productData = {
        title: p.title,
        slug: p.slug,
        description: p.description,
        price: p.priceNum,
        compareAtPrice: Math.round(p.priceNum * 1.2),
        category: categoryMap[p.category] || defaultCategory._id,
        inventory: 10 + Math.floor(Math.random() * 50),
        isPublished: true,
        images: p.images.map(img => ({ url: img.src, alt: img.alt })),
        colors: p.colors.map(c => ({ name: c.name, value: c.hex || '#000000' })),
        sizes: p.sizes,
      };

      await Product.findOneAndUpdate(
        { slug: p.slug },
        productData,
        { upsert: true, new: true }
      );
      console.log(`Synced: ${p.title}`);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();

import 'dotenv/config';
import mongoose from 'mongoose';
import Category from './src/models/Category';
import Product from './src/models/Product';
import { products } from './src/data/products';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // 1. Seed Categories based on unique values in products
    const uniqueCategoryNames = Array.from(new Set(products.map(p => p.category)));
    
    console.log(`Found ${uniqueCategoryNames.length} unique categories.`);
    
    // Clear existing for a clean slate
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing Categories and Products');

    const createdCategories: Record<string, string> = {};

    for (const catName of uniqueCategoryNames) {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const category = await Category.create({
        name: catName,
        slug: slug,
        description: `All our best ${catName}`,
        isActive: true
      });
      createdCategories[catName] = category._id.toString();
    }
    console.log('Categories seeded.');

    // 2. Seed Products
    for (const item of products) {
      const categoryId = createdCategories[item.category];
      
      if (!categoryId) {
         console.error(`Category ${item.category} not found for product ${item.title}`);
         continue;
      }

      await Product.create({
        title: item.title,
        slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: item.description,
        price: item.priceNum,
        compareAtPrice: Math.floor(item.priceNum * 1.2), // Mock original price
        // Use the first image as main, rest as gallery
        image: item.images[0]?.src || '',
        gallery: item.images.slice(1).map(img => img.src),
        category: categoryId,
        inventory: Math.floor(Math.random() * 50) + 1, // Random inventory between 1-50
        status: 'active',
        featured: item.badge === 'Best Seller',
      });
    }

    console.log(`Successfully seeded ${products.length} products!`);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();

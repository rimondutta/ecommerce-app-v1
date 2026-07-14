import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    longDescription: String,
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    sizes: [{ type: String }],
    colors: [
      {
        name: String,
        hex: String,
      },
    ],
    attributes: [
      {
        name: String,
        value: String,
      },
    ],
    tags: [{ type: String }],
    variations: [
      {
        combinationString: String, // e.g., "Red-L" 
        attributes: { type: Map, of: String }, // e.g. { "Color": "Red", "Size": "L" }
        price: { type: Number },
        stock: { type: Number, default: 0 },
        sku: String,
        image: String,
      }
    ],
    images: [{ url: String, alt: String }],
    badge: String, // e.g., 'New', 'Best Seller'
    ageRange: String, // e.g., '3-5', '5-8'
    inventory: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    reviews: [
      {
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, required: true },
        text: { type: String, required: true },
        name: { type: String, required: true },
        date: { type: Date, default: Date.now }
      }
    ],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// High Performance: Indexes for fast filtering during high traffic
ProductSchema.index({ isPublished: 1, category: 1 });
ProductSchema.index({ isPublished: 1, createdAt: -1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

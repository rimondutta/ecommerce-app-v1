import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const officialCategories = [
  {
    name: "Toys",
    slug: "toys",
    image: "/images/categories/toys.png",
    description: "Cute plush toys, teddy bears, and developmental playthings.",
    isActive: true,
  },
  {
    name: "Gadgets",
    slug: "gadgets",
    image: "/images/categories/gadgets.png",
    description: "Fun tech toys, gaming accessories, and interactive gadgets.",
    isActive: true,
  },
  {
    name: "Dolls",
    slug: "dolls",
    image: "/images/categories/dolls.png",
    description: "Beautiful dolls, figures, and play sets for imaginative fun.",
    isActive: true,
  },
  {
    name: "Puzzles",
    slug: "puzzles",
    image: "/images/categories/puzzles.png",
    description: "Brain teasers, jigsaw puzzles, and educational problem-solving toys.",
    isActive: true,
  },
  {
    name: "Toy Cars",
    slug: "toy-cars",
    image: "/images/categories/toy-cars.png",
    description: "Fast racers, die-cast cars, and construction vehicles.",
    isActive: true,
  },
  {
    name: "Arts & Crafts",
    slug: "arts-crafts",
    image: "/images/categories/arts-crafts.png",
    description: "Painting sets, modeling clay, DIY kits, and creative supplies.",
    isActive: true,
  },
  {
    name: "Cosmetics",
    slug: "cosmetics",
    image: "/images/categories/cosmetics.png",
    description: "Kid-friendly beauty, glitter, and safe dress-up cosmetics.",
    isActive: true,
  },
  {
    name: "Gift Sets",
    slug: "gift-sets",
    image: "/images/categories/gift-sets.png",
    description: "Curated gift bundles, birthday surprises, and special toy packages.",
    isActive: true,
  },
];

async function seedCategories() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in environment.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);

    for (const cat of officialCategories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true, new: true }
      );
      console.log(`✓ Seeded category: ${cat.name} (${cat.slug})`);
    }

    console.log("✓ All 8 reference categories seeded successfully!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedCategories();

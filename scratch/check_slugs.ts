import connectToDatabase from "../src/lib/db";
import Product from "../src/models/Product";
import Category from "../src/models/Category";

async function test() {
  await connectToDatabase();
  console.log("Connected to DB");
  const products = await Product.find({}).limit(5);
  console.log("Products found:", products.map((p: any) => ({ title: p.title, slug: p.slug, isPublished: p.isPublished })));
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});

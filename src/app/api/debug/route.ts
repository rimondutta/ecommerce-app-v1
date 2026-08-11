import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import VariationValue from '@/models/VariationValue';

export async function GET(req: Request) {
  await connectToDatabase();
  
  // Find the product
  const product = await Product.findOne({ slug: 'playful-plumpy-chicks-10-piece' });
  if (!product) return NextResponse.json({ error: 'not found' });

  // Get color and pieces values
  const colorId = '6a6a0ff4a6eee94139759987';
  const piecesId = '6a68e1d81039f683e6306693';
  
  const colors = await VariationValue.find({ variationType: colorId });
  const pieces = await VariationValue.find({ variationType: piecesId });

  // Update combinations
  product.variants[0].combination = [
    { variationType: colorId, variationValue: colors[0]._id },
    { variationType: piecesId, variationValue: pieces[0]._id }
  ];
  product.variants[1].combination = [
    { variationType: colorId, variationValue: colors[1]._id },
    { variationType: piecesId, variationValue: pieces[1]._id }
  ];

  await product.save();
    
  return NextResponse.json({ success: true, variants: product.variants });
}

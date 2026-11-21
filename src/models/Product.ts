import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    longDescription: String,
    descriptionHeading: { type: String, default: '' },
    keyFeatures: [{ type: String }],
    specifications: [
      {
        name: String,
        value: String,
      },
    ],
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },

    // ── Legacy flat options (kept for backward compat, no longer used by new products) ──
    attributes: [
      {
        name: String,
        value: String,
      },
    ],
    tags: [{ type: String }],
    images: [{ url: String, alt: String }],
    badge: String, // e.g., 'New', 'Best Seller'
    ageRange: String, // e.g., '3-5', '5-8'
    inventory: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    isFreeShipping: { type: Boolean, default: false },
    shippingRate: { type: Number, default: null },
    reviews: [
      {
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, required: true },
        text: { type: String, required: true },
        name: { type: String, required: true },
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'published'], default: 'published' },
      },
    ],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },

    // ─────────────────────────────────────────────────────────────
    // DYNAMIC VARIATION SYSTEM
    // When hasVariations is false, the product uses price/inventory/images directly.
    // When hasVariations is true, all pricing/stock comes from the variants array.
    // ─────────────────────────────────────────────────────────────
    hasVariations: { type: Boolean, default: false },

    variationTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VariationType' }],

    /** Each variant is a unique combination of option values */
    variants: [
      {
        sku: { type: String, default: '' },
        combinationLabel: { type: String }, // e.g. "Red / M"
        /** 
         * The global values that make up this combination.
         */
        combination: [
          {
            variationType: { type: mongoose.Schema.Types.ObjectId, ref: 'VariationType' },
            variationValue: { type: mongoose.Schema.Types.ObjectId, ref: 'VariationValue' },
          }
        ],
        price: { type: Number, required: true, default: 0 },
        comparePrice: { type: Number, default: null },
        stock: { type: Number, required: true, default: 0 },
        /** Cloudinary URLs specific to this variant (e.g. red product photos) */
        images: [{ type: String }],
        isActive: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

// Auto-sync inventory and default pricing from active variants when hasVariations is true
ProductSchema.pre('validate', function () {
  if (this.hasVariations && Array.isArray(this.variants) && this.variants.length > 0) {
    this.inventory = this.variants.reduce(
      (sum: number, v: { stock?: number; isActive?: boolean }) =>
        sum + (v.isActive !== false ? (Number(v.stock) || 0) : 0),
      0
    );
    const activeVariants = this.variants.filter((v: { isActive?: boolean }) => v.isActive !== false);
    const vList = activeVariants.length > 0 ? activeVariants : this.variants;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const minVariant = (vList as any[]).reduce((min: any, curr: any) =>
      (Number(curr?.price || 0) < Number(min?.price || 0) ? curr : min), vList[0]
    );
    if (minVariant) {
      if (!this.price || Number(this.price) === 0) {
        this.price = Number(minVariant.price) || 0;
      }
      if (!this.compareAtPrice && minVariant.comparePrice) {
        this.compareAtPrice = Number(minVariant.comparePrice) || null;
      }
    }
  }
});

ProductSchema.pre('save', function () {
  if (this.hasVariations && Array.isArray(this.variants) && this.variants.length > 0) {
    this.inventory = this.variants.reduce(
      (sum: number, v: { stock?: number; isActive?: boolean }) =>
        sum + (v.isActive !== false ? (Number(v.stock) || 0) : 0),
      0
    );
    const activeVariants = this.variants.filter((v: { isActive?: boolean }) => v.isActive !== false);
    const vList = activeVariants.length > 0 ? activeVariants : this.variants;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const minVariant = (vList as any[]).reduce((min: any, curr: any) =>
      (Number(curr?.price || 0) < Number(min?.price || 0) ? curr : min), vList[0]
    );
    if (minVariant) {
      if (!this.price || Number(this.price) === 0) {
        this.price = Number(minVariant.price) || 0;
      }
      if (!this.compareAtPrice && minVariant.comparePrice) {
        this.compareAtPrice = Number(minVariant.comparePrice) || null;
      }
    }
  }
});

// High Performance: Indexes for fast filtering during high traffic
ProductSchema.index({ isPublished: 1, category: 1 });
ProductSchema.index({ isPublished: 1, createdAt: -1 });
ProductSchema.index({ isPublished: 1, ageRange: 1 });
ProductSchema.index({ isPublished: 1, tags: 1 });
ProductSchema.index({ isPublished: 1, price: 1 }); // For price-asc sorting
ProductSchema.index({ isPublished: 1, price: -1 }); // For price-desc sorting
ProductSchema.index({ title: 'text', description: 'text' }); // Enables faster text searching

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

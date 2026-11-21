import mongoose from 'mongoose';

/**
 * VariationType
 * Represents a named category of product variation, e.g. "Color", "Size", "Pieces".
 * Admins can create/manage these from /admin/variations.
 * displayType controls how the selector renders on the storefront:
 *   - "cards"    → high-converting bundle radio cards (used for Pieces / Packs / Bundles)
 *   - "swatch"   → color circles with hex color (used for Color)
 *   - "button"   → pill-style buttons (used for Size, etc.)
 *   - "dropdown" → <select> element
 */
const VariationTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayType: {
      type: String,
      enum: ['swatch', 'button', 'dropdown', 'cards', 'pcs'],
      default: 'button',
    },
  },
  { timestamps: true }
);

export default mongoose.models.VariationType ||
  mongoose.model('VariationType', VariationTypeSchema);

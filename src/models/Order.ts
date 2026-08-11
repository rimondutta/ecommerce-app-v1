import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    customerEmail: { type: String },
    customerName: { type: String },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        variantId: { type: mongoose.Schema.Types.ObjectId },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        title: { type: String },
        variantOptions: { type: Map, of: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cod', 'bkash'],
      default: 'cod',
    },
    shippingZone: {
      type: String,
      enum: ['inside_dhaka', 'outside_dhaka'],
    },
    notes: {
      type: String,
    },
    fulfillmentStatus: {
      type: String,
      enum: ['unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'unfulfilled',
    },
    shippingAddress: {
      addressLine1: String,
      city: String,
      postcode: String,
      country: { type: String, default: 'Bangladesh' },
      phone: String,
    },
    // ── Invoice fields (added for PDF invoice system) ──
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    invoiceUrl: {
      type: String,
      default: null,
    },
    invoiceGeneratedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Performance: Compound index covering Order.find({ customerEmail }).sort({ createdAt: -1 })
// Without this, every /account page load does a full collection scan as order volume grows.
OrderSchema.index({ customerEmail: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

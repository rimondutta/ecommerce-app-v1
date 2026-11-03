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
        image: { type: String },
        variantOptions: { type: Map, of: String },
      },
    ],
    subtotal: { type: Number },
    shippingCost: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    totalAmount: { type: Number, required: true },
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
      name: String,
      email: String,
      addressLine1: String,
      city: String,
      postcode: String,
      country: { type: String, default: 'Bangladesh' },
      phone: String,
    },
    // ── Guest Checkout Access Token (For secure invoice/tracking access without session) ──
    guestAccessToken: {
      type: String,
      select: false,
    },
    guestAccessTokenHash: {
      type: String,
      select: false,
      index: true,
      sparse: true,
    },
    // ── Courier & Live Tracking System ──
    courier: {
      name: { type: String }, // e.g. "Steadfast", "Pathao", "Paperfly", "RedX", "Custom Courier"
      code: { type: String }, // e.g. "steadfast", "pathao"
      trackingId: { type: String }, // Consignment ID / Tracking Code
      trackingUrl: { type: String }, // Direct link to courier live tracking page
    },
    courierStatus: {
      type: String,
      enum: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed'],
      default: 'pending',
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    trackingTimeline: [
      {
        status: { type: String },
        title: { type: String },
        description: { type: String },
        location: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
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

// High Performance: Indexes for customer order history, admin queries and sorts
OrderSchema.index({ customerEmail: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ fulfillmentStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

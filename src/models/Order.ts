import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    customerEmail: { type: String },
    customerName: { type: String },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        title: { type: String },
        color: { type: String },
        size: { type: String },
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
      enum: ['card', 'cod'],
      default: 'cod',
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

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

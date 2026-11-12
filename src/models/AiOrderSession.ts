import mongoose from 'mongoose';

export interface IAiCollectedFields {
  phone?: string;
  name?: string;
  variationId?: string;
  variationLabel?: string;
  quantity?: number;
  address?: string;
  city?: string;
  shippingZone?: 'inside_dhaka' | 'outside_dhaka';
  couponCode?: string;
  discountAmount?: number;
}

export interface IAiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface IAiOrderSession {
  sessionId: string;
  productId: mongoose.Types.ObjectId;
  step: 'phone' | 'name' | 'variation' | 'quantity' | 'address' | 'review' | 'done' | 'cancelled';
  collected: IAiCollectedFields;
  messages: IAiMessage[];
  orderId?: mongoose.Types.ObjectId;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const AiOrderSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    step: {
      type: String,
      enum: ['phone', 'name', 'variation', 'quantity', 'address', 'review', 'done', 'cancelled'],
      default: 'phone',
    },
    collected: {
      phone: { type: String, default: null },
      name: { type: String, default: null },
      variationId: { type: String, default: null },
      variationLabel: { type: String, default: null },
      quantity: { type: Number, default: 1 },
      address: { type: String, default: null },
      city: { type: String, default: null },
      shippingZone: {
        type: String,
        enum: ['inside_dhaka', 'outside_dhaka'],
        default: 'inside_dhaka',
      },
      couponCode: { type: String, default: null },
      discountAmount: { type: Number, default: 0 },
    },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// TTL Index: Automatically expire inactive sessions after 2 hours (7200s)
AiOrderSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

export default mongoose.models.AiOrderSession ||
  mongoose.model('AiOrderSession', AiOrderSessionSchema);


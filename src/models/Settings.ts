import mongoose from 'mongoose';

const FacebookPixelSchema = new mongoose.Schema({
  pixelId: { type: String, default: '' },
  enabled: { type: Boolean, default: false },
  testEventCode: { type: String, default: '' },
});

const ShippingSchema = new mongoose.Schema({
  insideDhakaRate: { type: Number, default: 120 },
  outsideDhakaRate: { type: Number, default: 150 },
  freeShippingEnabled: { type: Boolean, default: false },
  freeShippingMinOrder: { type: Number, default: 0 },   // 0 = always free when enabled
  freeShippingZone: {
    type: String,
    enum: ['all', 'inside_dhaka', 'outside_dhaka'],
    default: 'all',
  },
});

const SettingsSchema = new mongoose.Schema(
  {
    // Singleton key — always "global"
    key: { type: String, default: 'global', unique: true },
    facebookPixel: { type: FacebookPixelSchema, default: () => ({}) },
    shipping: { type: ShippingSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

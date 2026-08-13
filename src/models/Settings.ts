import mongoose from 'mongoose';

const FacebookPixelSchema = new mongoose.Schema({
  pixelId: { type: String, default: '' },
  enabled: { type: Boolean, default: false },
  testEventCode: { type: String, default: '' },
});

const SettingsSchema = new mongoose.Schema(
  {
    // Singleton key — always "global"
    key: { type: String, default: 'global', unique: true },
    facebookPixel: { type: FacebookPixelSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

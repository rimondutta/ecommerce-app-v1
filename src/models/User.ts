import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  fullName: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'customer'],
      default: 'customer',
    },
    image: {
      type: String,
    },
    pushToken: {
      type: String,
    },
    addresses: {
      type: [AddressSchema],
      default: [],
    },
  },
  { timestamps: true }
);


export default mongoose.models.User || mongoose.model('User', UserSchema);

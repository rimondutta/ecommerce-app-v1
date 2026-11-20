import mongoose from 'mongoose';

export interface IMenuChild {
  _id?: string;
  label: string;
  url: string;
  openInNewTab?: boolean;
  order?: number;
}

export interface IMenuItem {
  _id?: string;
  label: string;
  url: string;
  icon?: string;
  badge?: string;
  openInNewTab?: boolean;
  isActive?: boolean;
  order?: number;
  children?: IMenuChild[];
  createdAt?: Date;
  updatedAt?: Date;
}

const MenuChildSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    openInNewTab: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const MenuItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    icon: { type: String, default: '', trim: true },
    badge: { type: String, default: '', trim: true },
    openInNewTab: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    children: { type: [MenuChildSchema], default: [] },
  },
  { timestamps: true }
);

// Index for fast ordered queries
MenuItemSchema.index({ order: 1, isActive: 1 });

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

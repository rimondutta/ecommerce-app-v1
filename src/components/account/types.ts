export type AccountTabId = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'profile';

export interface AccountOrderItem {
  product?: string;
  variantId?: string;
  title?: string;
  image?: string;
  price?: number;
  quantity?: number;
  variantOptions?: Record<string, string>;
}

export interface AccountShippingAddress {
  name?: string;
  email?: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
  country?: string;
  phone?: string;
}

export interface AccountOrder {
  _id: string;
  orderNumber?: string;
  invoiceNumber?: string;
  invoiceUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
  fulfillmentStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  courierStatus?: string;
  courier?: {
    name?: string;
    code?: string;
    trackingId?: string;
    trackingUrl?: string;
  };
  estimatedDeliveryDate?: string;
  subtotal?: number;
  shippingCost?: number;
  discountAmount?: number;
  totalAmount?: number;
  customerName?: string;
  shippingAddress?: AccountShippingAddress;
  items?: AccountOrderItem[];
}

export interface SavedAddress {
  _id: string;
  label: string;
  fullName: string;
  streetAddress: string;
  city: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  isDefault?: boolean;
}

export interface AccountProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  addresses: SavedAddress[];
  createdAt: string | null;
}

export interface StatusStyle {
  label: string;
  pillClass: string;
  dotClass: string;
}

export const FULFILLMENT_STATUS_MAP: Record<string, StatusStyle> = {
  unfulfilled: {
    label: 'Order Placed',
    pillClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dotClass: 'bg-amber-500',
  },
  processing: {
    label: 'Packing & Prep',
    pillClass: 'bg-[#F3F0FE] text-[#5428D8] border-[#DFD6FE]',
    dotClass: 'bg-[#5428D8]',
  },
  shipped: {
    label: 'In Transit',
    pillClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
    dotClass: 'bg-sky-500',
  },
  delivered: {
    label: 'Delivered',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dotClass: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelled',
    pillClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dotClass: 'bg-rose-500',
  },
};

export const PAYMENT_STATUS_MAP: Record<string, StatusStyle> = {
  paid: {
    label: 'Paid',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dotClass: 'bg-emerald-500',
  },
  pending: {
    label: 'Payment Pending',
    pillClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dotClass: 'bg-amber-500',
  },
  failed: {
    label: 'Payment Failed',
    pillClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dotClass: 'bg-rose-500',
  },
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  bkash: 'bKash',
  card: 'Card Payment',
};

export function getFulfillmentStyle(status?: string): StatusStyle {
  const key = (status || 'unfulfilled').toLowerCase();
  return FULFILLMENT_STATUS_MAP[key] || FULFILLMENT_STATUS_MAP.unfulfilled;
}

export function getPaymentStyle(status?: string): StatusStyle {
  const key = (status || 'pending').toLowerCase();
  return PAYMENT_STATUS_MAP[key] || PAYMENT_STATUS_MAP.pending;
}

export function formatOrderRef(order: Pick<AccountOrder, '_id' | 'invoiceNumber' | 'orderNumber'>): string {
  return order.invoiceNumber || order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`;
}

export function formatCurrencyBDT(amount?: number): string {
  return `৳${Math.round(amount ?? 0).toLocaleString('en-BD')}`;
}

export function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isOrderActive(order: Pick<AccountOrder, 'fulfillmentStatus' | 'courierStatus'>): boolean {
  const f = (order.fulfillmentStatus || 'unfulfilled').toLowerCase();
  const c = (order.courierStatus || '').toLowerCase();
  return f !== 'delivered' && f !== 'cancelled' && c !== 'delivered';
}

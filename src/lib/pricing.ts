import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Settings from '@/models/Settings';
import Coupon from '@/models/Coupon';
import mongoose from 'mongoose';

interface VariantDoc {
  _id?: { toString(): string };
  price: number;
  isActive?: boolean;
  stock?: number;
  combinationLabel?: string;
  images?: string[];
}

interface ProductDoc {
  _id: { toString(): string };
  title: string;
  price: number;
  inventory?: number;
  images?: Array<{ url?: string }>;
  variants?: VariantDoc[];
}

interface ShippingSettingsDoc {
  insideDhakaRate?: number;
  outsideDhakaRate?: number;
  freeShippingEnabled?: boolean;
  freeShippingMinOrder?: number;
  freeShippingZone?: string;
}

interface SettingsDoc {
  shipping?: ShippingSettingsDoc;
}

export interface CheckoutInputItem {
  productId?: string;
  id?: string;
  variantId?: string;
  quantity: number;
  variantOptions?: Record<string, string>;
  title?: string;
  image?: string;
}

export interface VerifiedOrderItem {
  product: mongoose.Types.ObjectId;
  productId: string;
  variantId?: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variantOptions?: Map<string, string> | Record<string, string>;
}

export interface PricingCalculationResult {
  items: VerifiedOrderItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  shippingZone: 'inside_dhaka' | 'outside_dhaka';
}

export interface PricingCalculationOptions {
  items: CheckoutInputItem[];
  shippingZone?: string;
  couponCode?: string;
  skipInventoryCheck?: boolean;
}

/**
 * Authoritative Server-Side Pricing Calculation Engine.
 *
 * Fetches products from MongoDB, verifies availability, variant pricing,
 * stock, shipping rules, and coupon discounts.
 * NEVER trusts any client-provided price or total.
 */
export async function calculateOrderPricing(
  options: PricingCalculationOptions
): Promise<PricingCalculationResult> {
  const { items: inputItems, shippingZone: rawShippingZone, couponCode: rawCouponCode, skipInventoryCheck } = options;

  if (!inputItems || !Array.isArray(inputItems) || inputItems.length === 0) {
    throw new Error('Cart is empty. At least one item is required.');
  }

  await connectToDatabase();

  // Validate and extract product IDs
  const productItemMap = new Map<string, CheckoutInputItem[]>();
  for (const item of inputItems) {
    const rawId = item.productId || item.id;
    if (!rawId || !mongoose.Types.ObjectId.isValid(rawId)) {
      throw new Error(`Invalid product ID: ${rawId}`);
    }
    const productIdStr = String(rawId);
    const existing = productItemMap.get(productIdStr) || [];
    existing.push(item);
    productItemMap.set(productIdStr, existing);
  }

  const productIds = Array.from(productItemMap.keys()).map((id) => new mongoose.Types.ObjectId(id));

  // Fetch all matching published products in a single DB query
  const products = await Product.find({
    _id: { $in: productIds },
    isPublished: true,
  }).lean() as ProductDoc[];

  const productDbMap = new Map<string, ProductDoc>();
  for (const p of products) {
    productDbMap.set(p._id.toString(), p);
  }

  const verifiedItems: VerifiedOrderItem[] = [];
  let subtotal = 0;

  for (const [productIdStr, cartItems] of productItemMap.entries()) {
    const product = productDbMap.get(productIdStr);
    if (!product) {
      throw new Error(`Product not found or is currently unavailable for purchase.`);
    }

    for (const cartItem of cartItems) {
      const quantity = Math.floor(Number(cartItem.quantity));
      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for product "${product.title}". Must be a positive integer.`);
      }

      let unitPrice = product.price;
      let variantObjectId: mongoose.Types.ObjectId | undefined = undefined;
      let itemImage = product.images?.[0]?.url || '';

      // If variant is requested, locate and validate the variant
      if (cartItem.variantId) {
        if (!mongoose.Types.ObjectId.isValid(cartItem.variantId)) {
          throw new Error(`Invalid variant ID for product "${product.title}".`);
        }
        const variantIdStr = String(cartItem.variantId);
        const variant = (product.variants || []).find(
          (v: VariantDoc) => v._id?.toString() === variantIdStr
        );

        if (!variant || variant.isActive === false) {
          throw new Error(`Selected variant is no longer available for "${product.title}".`);
        }

        unitPrice = variant.price;
        variantObjectId = new mongoose.Types.ObjectId(variantIdStr);
        if (variant.images?.[0]) {
          itemImage = variant.images[0];
        }

        // Inventory check on variant
        if (!skipInventoryCheck && typeof variant.stock === 'number' && variant.stock < quantity) {
          throw new Error(
            `Insufficient stock for "${product.title} (${variant.combinationLabel || 'Selected Variant'})". Only ${variant.stock} left in stock.`
          );
        }
      } else {
        // Flat product inventory check
        if (!skipInventoryCheck && typeof product.inventory === 'number' && product.inventory < quantity) {
          throw new Error(`Insufficient stock for "${product.title}". Only ${product.inventory} left in stock.`);
        }
      }

      if (typeof unitPrice !== 'number' || isNaN(unitPrice) || unitPrice < 0) {
        throw new Error(`Invalid price configuration for "${product.title}".`);
      }

      subtotal += unitPrice * quantity;

      verifiedItems.push({
        product: new mongoose.Types.ObjectId(productIdStr),
        productId: productIdStr,
        variantId: variantObjectId,
        title: product.title,
        price: unitPrice,
        quantity,
        image: itemImage,
        variantOptions: cartItem.variantOptions || undefined,
      });
    }
  }

  // ── Authoritative Shipping Calculation ──
  const normalizedZone: 'inside_dhaka' | 'outside_dhaka' =
    rawShippingZone === 'outside_dhaka' ? 'outside_dhaka' : 'inside_dhaka';

  const settings = await Settings.findOne({ key: 'global' }).lean() as SettingsDoc | null;
  const shippingSettings = settings?.shipping ?? {};

  const insideDhakaRate = Number(shippingSettings.insideDhakaRate ?? 120);
  const outsideDhakaRate = Number(shippingSettings.outsideDhakaRate ?? 150);
  const freeShippingEnabled = Boolean(shippingSettings.freeShippingEnabled ?? false);
  const freeShippingMinOrder = Number(shippingSettings.freeShippingMinOrder ?? 0);
  const freeShippingZone = shippingSettings.freeShippingZone ?? 'all';

  const baseShippingCost = normalizedZone === 'outside_dhaka' ? outsideDhakaRate : insideDhakaRate;

  const qualifiesForFreeShipping =
    freeShippingEnabled &&
    (freeShippingZone === 'all' || freeShippingZone === normalizedZone) &&
    subtotal >= freeShippingMinOrder;

  const shippingCost = qualifiesForFreeShipping ? 0 : baseShippingCost;

  // ── Authoritative Coupon Calculation ──
  let discountAmount = 0;
  let appliedCouponCode: string | undefined = undefined;

  if (rawCouponCode && rawCouponCode.trim()) {
    const code = rawCouponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code, isActive: true });

    if (coupon) {
      const now = new Date();
      const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < now;
      const isMaxUsed = coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses;
      const minOrderNotMet = coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount;

      if (!isExpired && !isMaxUsed && !minOrderNotMet) {
        appliedCouponCode = code;
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round(((subtotal * coupon.discountValue) / 100) * 100) / 100;
        } else {
          discountAmount = coupon.discountValue;
        }
        // Cap discount so it never exceeds subtotal
        discountAmount = Math.min(discountAmount, subtotal);
      }
    }
  }

  // Round values to 2 decimal places to prevent floating-point precision issues
  subtotal = Math.round(subtotal * 100) / 100;
  discountAmount = Math.round(discountAmount * 100) / 100;
  const totalAmount = Math.max(0, Math.round((subtotal + shippingCost - discountAmount) * 100) / 100);

  return {
    items: verifiedItems,
    subtotal,
    shippingCost,
    discountAmount,
    totalAmount,
    couponCode: appliedCouponCode,
    shippingZone: normalizedZone,
  };
}


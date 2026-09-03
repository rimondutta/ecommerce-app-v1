/**
 * Facebook/Meta Pixel event helper utilities.
 *
 * Each function is safe to call even before the pixel has loaded — events are
 * queued internally and flushed once the pixel is fully initialized.
 * All monetary values are in BDT (Bangladeshi Taka).
 *
 * NOTE: cookie/tracking consent — if you add a consent banner in the future,
 * gate these calls on consent state before invoking. GDPR / PDPA compliance
 * may require explicit opt-in before firing any pixel events.
 */

declare global {
  interface Window {
    fbq?: ((...args: any[]) => void) & {
      callMethod?: (...args: any[]) => void;
      queue?: any[];
      loaded?: boolean;
      version?: string;
      push?: (...args: any[]) => void;
    };
    _fbq?: typeof window.fbq;
  }
}

/**
 * Checks whether the Meta Pixel SDK has fully initialized.
 * The inline bootstrap snippet sets window.fbq immediately, but the actual
 * fbevents.js script loads asynchronously. Until it loads, `fbq.callMethod`
 * is undefined and calling it crashes with "Cannot read properties of
 * undefined (reading 'M_ID')".
 *
 * We consider the SDK "ready" only when fbq.callMethod is a function, which
 * is set by the external fbevents.js script after it bootstraps.
 */
function isPixelReady(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.fbq === 'function' &&
    typeof window.fbq.callMethod === 'function'
  );
}

/**
 * Fires `action` as soon as the pixel SDK is fully initialized.
 * Retries up to `retries` times with 300ms delay between each attempt.
 */
function fireWhenReady(action: () => void, retries = 30) {
  if (typeof window === 'undefined') return;
  if (isPixelReady()) {
    try {
      action();
    } catch {
      // Pixel failures must never crash the page
    }
  } else if (retries > 0) {
    setTimeout(() => fireWhenReady(action, retries - 1), 300);
  }
}

/** ViewContent — fired when a customer views a product detail page. */
export function trackViewContent(product: {
  _id: string;
  title?: string;
  price?: number;
  category?: { title?: string };
}) {
  try {
    if (!product?._id) return;
    fireWhenReady(() => {
      window.fbq!('track', 'ViewContent', {
        content_ids: [product._id],
        content_type: 'product',
        content_name: product.title ?? '',
        content_category: product.category?.title ?? '',
        value: Math.max(0.01, Number(product.price ?? 0)),
        currency: 'BDT',
      });
    });
  } catch {
    // Pixel failures must never crash the page
  }
}

/** AddToCart — fired when a customer adds a product to their cart. */
export function trackAddToCart(
  product: { _id: string; title?: string; price?: number },
  quantity: number
) {
  try {
    if (!product?._id) return;
    fireWhenReady(() => {
      window.fbq!('track', 'AddToCart', {
        content_ids: [product._id],
        content_type: 'product',
        content_name: product.title ?? '',
        value: Math.max(0.01, Number((product.price ?? 0) * quantity)),
        currency: 'BDT',
        quantity,
      });
    });
  } catch {
    // Pixel failures must never crash the page
  }
}

/** InitiateCheckout — fired when the checkout page loads with items. */
export function trackInitiateCheckout(
  cartItems: Array<{ id: string; price?: number; quantity?: number }>,
  totalValue: number
) {
  try {
    if (!cartItems?.length) return;
    fireWhenReady(() => {
      window.fbq!('track', 'InitiateCheckout', {
        content_ids: cartItems.map((i) => i.id),
        content_type: 'product',
        num_items: cartItems.reduce((sum, i) => sum + (i.quantity ?? 1), 0),
        value: Math.max(0.01, Number(totalValue || 0)),
        currency: 'BDT',
      });
    });
  } catch {
    // Pixel failures must never crash the page
  }
}

/** Purchase — fired after a successful order is created. */
export function trackPurchase(order: {
  _id?: string;
  orderId?: string;
  items: Array<{ productId?: string; id?: string }>;
  totalAmount?: number;
  total?: number;
}) {
  try {
    const orderId = String(order._id ?? order.orderId ?? '');
    let value = Number(order.totalAmount ?? order.total ?? 0);
    if (isNaN(value) || value <= 0) {
      value = 0.01; // Meta Pixel requires a positive non-zero value if currency is provided
    }
    const contentIds = (order.items || []).map((i) => String(i.productId ?? i.id ?? ''));

    fireWhenReady(() => {
      window.fbq!('track', 'Purchase', {
        content_ids: contentIds,
        content_type: 'product',
        value: Number(value.toFixed(2)),
        currency: 'BDT',
        order_id: orderId,
      });
    });
  } catch {
    // Pixel failures must never crash the page
  }
}

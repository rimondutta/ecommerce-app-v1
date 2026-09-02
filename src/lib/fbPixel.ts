/**
 * Facebook/Meta Pixel event helper utilities.
 *
 * Each function is safe to call even before the pixel has loaded — a guard
 * clause checks for window.fbq and no-ops silently if it isn't available.
 * All monetary values are in BDT (Bangladeshi Taka).
 *
 * NOTE: cookie/tracking consent — if you add a consent banner in the future,
 * gate these calls on consent state before invoking. GDPR / PDPA compliance
 * may require explicit opt-in before firing any pixel events.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function fireWhenReady(action: () => void, retries = 20) {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq === 'function') {
    action();
  } else if (retries > 0) {
    setTimeout(() => fireWhenReady(action, retries - 1), 250);
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

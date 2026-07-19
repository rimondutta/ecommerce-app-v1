import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import PrintButton from "./PrintButton";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectToDatabase();

  let order: any;
  try {
    order = await Order.findById(id).lean();
  } catch {
    return notFound();
  }
  if (!order) return notFound();

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const shortId = order._id.toString().slice(-8).toUpperCase();
  const subtotal = order.totalAmount - ((order.shippingCost as number) || 0);
  const addr = order.shippingAddress as any;
  const paymentLabel =
    order.paymentMethod === "cod" ? "Cash on Delivery"
      : order.paymentMethod === "bkash" ? "bKash"
        : order.paymentMethod === "card" ? "Credit / Debit Card"
          : "COD";

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 14px; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; background: #f7f7f8; color: #111; -webkit-font-smoothing: antialiased; }
        .page { min-height: 100vh; background: #f7f7f8; display: flex; flex-direction: column; align-items: center; padding: 48px 20px 80px; }
        .toolbar { width: 100%; max-width: 680px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .toolbar-left-label { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #aaa; margin-bottom: 3px; }
        .toolbar-left-title { font-size: 20px; font-weight: 800; color: #111; letter-spacing: -0.3px; }
        .card { width: 100%; max-width: 680px; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e8e8e8; }

        /* Top accent */
        .card-top-accent { height: 3px; background: #111; }

        /* Card header */
        .card-header { padding: 36px 44px 32px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f0f0f0; }
        .brand-name { font-size: 18px; font-weight: 900; letter-spacing: -0.3px; color: #111; }
        .brand-tagline { font-size: 10px; color: #bbb; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 3px; }
        .invoice-meta { text-align: right; }
        .invoice-meta-label { font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #bbb; }
        .invoice-meta-id { font-size: 18px; font-weight: 800; font-family: 'SF Mono', 'Fira Code', monospace; color: #111; margin-top: 3px; }
        .invoice-meta-date { font-size: 10px; color: #999; margin-top: 3px; }

        /* Status strip */
        .status-strip { padding: 12px 44px; background: #fafafa; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 100px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
        .badge-dot { width: 5px; height: 5px; border-radius: 50%; }
        .badge-paid { background: #f0fdf4; color: #15803d; }
        .badge-paid .badge-dot { background: #22c55e; }
        .badge-pending { background: #fffbeb; color: #92400e; }
        .badge-pending .badge-dot { background: #f59e0b; }
        .badge-fulfillment { background: #eff6ff; color: #1d4ed8; }
        .badge-fulfillment .badge-dot { background: #3b82f6; }
        .status-payment-method { margin-left: auto; font-size: 10px; color: #999; font-weight: 600; }

        /* Body */
        .card-body { padding: 36px 44px; }

        /* Info grid */
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding-bottom: 32px; border-bottom: 1px solid #f0f0f0; margin-bottom: 32px; }
        .info-section-label { font-size: 9px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #ccc; margin-bottom: 10px; }
        .info-name { font-size: 14px; font-weight: 700; color: #111; }
        .info-detail { font-size: 11px; color: #888; margin-top: 2px; line-height: 1.6; }
        .info-country { font-size: 11px; font-weight: 600; color: #555; margin-top: 1px; }

        /* Items */
        .items-label { font-size: 9px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #ccc; margin-bottom: 14px; }
        .items-header { display: grid; grid-template-columns: 1fr 56px 84px 84px; gap: 8px; padding: 0 0 8px; border-bottom: 1px solid #f0f0f0; }
        .items-header span { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #ccc; }
        .items-header span:not(:first-child) { text-align: right; }
        .item-row { display: grid; grid-template-columns: 1fr 56px 84px 84px; gap: 8px; padding: 12px 0; border-bottom: 1px solid #f7f7f7; align-items: center; }
        .item-title { font-size: 13px; font-weight: 600; color: #111; }
        .item-variant { font-size: 10px; color: #bbb; margin-top: 2px; }
        .item-qty { font-size: 12px; color: #888; text-align: right; font-weight: 500; }
        .item-price { font-size: 11px; color: #aaa; text-align: right; font-family: 'SF Mono', 'Fira Code', monospace; }
        .item-total { font-size: 13px; font-weight: 700; color: #111; text-align: right; font-family: 'SF Mono', 'Fira Code', monospace; }

        /* Totals */
        .totals-wrap { display: flex; justify-content: flex-end; margin-top: 24px; }
        .totals-inner { width: 220px; }
        .total-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; }
        .total-row + .total-row { border-top: 1px solid #f7f7f7; }
        .total-label { font-size: 11px; color: #999; }
        .total-value { font-size: 11px; font-weight: 600; color: #555; font-family: 'SF Mono', 'Fira Code', monospace; }
        .grand-total-row { margin-top: 10px; padding: 12px 16px; background: #111; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
        .grand-total-label { font-size: 12px; font-weight: 700; color: #fff; }
        .grand-total-value { font-size: 15px; font-weight: 800; color: #fff; font-family: 'SF Mono', 'Fira Code', monospace; }

        /* Footer */
        .card-footer { padding: 20px 44px; background: #fafafa; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .footer-note { font-size: 11px; color: #bbb; }
        .footer-ref { font-size: 9px; color: #ddd; font-family: monospace; margin-top: 3px; letter-spacing: 0.04em; }
        .back-link { margin-top: 28px; font-size: 11px; font-weight: 600; color: #bbb; text-decoration: none; }
        .back-link:hover { color: #888; }

        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .page { padding: 0; background: #fff; }
          .card { border-radius: 0 !important; border: none !important; max-width: 100%; box-shadow: none; }
          @page { margin: 0.5in; size: A4; }
        }
        @media (max-width: 640px) {
          .card-header, .status-strip, .card-body, .card-footer { padding-left: 24px; padding-right: 24px; }
          .info-grid { grid-template-columns: 1fr; gap: 20px; }
          .items-header, .item-row { grid-template-columns: 1fr 48px 72px; }
          .item-price { display: none; }
        }
      `}} />

      <div className="page">

        {/* Toolbar */}
        <div className="toolbar no-print">
          <div>
            <div className="toolbar-left-label">Toy Hourse</div>
            <div className="toolbar-left-title">Invoice #{shortId}</div>
          </div>
          <PrintButton />
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-top-accent" />

          {/* Header */}
          <div className="card-header">
            <div>
              <div className="brand-name">TOY HOURSE</div>
              <div className="brand-tagline">Toys Worth Keeping</div>
            </div>
            <div className="invoice-meta">
              <div className="invoice-meta-label">Invoice</div>
              <div className="invoice-meta-id">#{shortId}</div>
              <div className="invoice-meta-date">{orderDate}</div>
            </div>
          </div>

          {/* Status Strip */}
          <div className="status-strip">
            <span className={`badge ${order.paymentStatus === "paid" ? "badge-paid" : "badge-pending"}`}>
              <span className="badge-dot" />
              {order.paymentStatus === "paid" ? "Paid" : "Pending"}
            </span>
            <span className="badge badge-fulfillment">
              <span className="badge-dot" />
              {order.fulfillmentStatus || "Processing"}
            </span>
            <span className="status-payment-method">{paymentLabel}</span>
          </div>

          {/* Body */}
          <div className="card-body">

            {/* Customer & Address */}
            <div className="info-grid">
              <div>
                <div className="info-section-label">Bill To</div>
                <div className="info-name">{order.customerName || "Customer"}</div>
                {order.customerEmail && <div className="info-detail">{order.customerEmail}</div>}
                {addr?.phone && <div className="info-detail">{addr.phone}</div>}
              </div>
              <div>
                <div className="info-section-label">Ship To</div>
                {addr?.addressLine1 ? (
                  <>
                    <div className="info-name" style={{ fontWeight: 500, fontSize: 13 }}>{addr.addressLine1}</div>
                    {(addr.city || addr.postcode) && (
                      <div className="info-detail">{addr.city}{addr.postcode ? `, ${addr.postcode}` : ""}</div>
                    )}
                    {addr.country && <div className="info-country">{addr.country}</div>}
                  </>
                ) : (
                  <div className="info-detail">No address provided</div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="items-label">Items Ordered</div>
            <div className="items-header">
              <span>Product</span>
              <span style={{ textAlign: "right" }}>Qty</span>
              <span style={{ textAlign: "right" }}>Price</span>
              <span style={{ textAlign: "right" }}>Total</span>
            </div>

            {(order.items as any[]).map((item: any, i: number) => {
              const variants = [
                item.color && item.color !== "Default" ? item.color : null,
                item.size && item.size !== "Default" ? item.size : null,
              ].filter(Boolean).join(" · ");
              return (
                <div key={i} className="item-row">
                  <div>
                    <div className="item-title">{item.title}</div>
                    {variants && <div className="item-variant">{variants}</div>}
                  </div>
                  <div className="item-qty">{item.quantity}</div>
                  <div className="item-price">৳{item.price.toLocaleString()}</div>
                  <div className="item-total">৳{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              );
            })}

            {/* Totals */}
            <div className="totals-wrap">
              <div className="totals-inner">
                <div className="total-row">
                  <span className="total-label">Subtotal</span>
                  <span className="total-value">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span className="total-label">Shipping</span>
                  <span className="total-value">৳{((order.shippingCost as number) || 0).toLocaleString()}</span>
                </div>
                <div className="grand-total-row" style={{ marginTop: 12 }}>
                  <span className="grand-total-label">Total</span>
                  <span className="grand-total-value">৳{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="card-footer">
            <div>
              <div className="footer-note">Thank you for shopping with Toy Hourse 🧸</div>
              <div className="footer-ref">Order ID: {order._id.toString()}</div>
            </div>
            <div className="no-print">
              <PrintButton />
            </div>
          </div>
        </div>

        <a href="/products" className="back-link no-print">← Continue Shopping</a>
      </div>
    </>
  );
}

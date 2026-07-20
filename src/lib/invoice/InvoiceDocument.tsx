/**
 * InvoiceDocument.tsx
 * React-PDF template for generating professional PDF invoices.
 * Designed for Toy Hourse — A4, print-friendly (no heavy shadows/colors).
 */
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 44,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111111',
    backgroundColor: '#ffffff',
  },

  // ── Header ──
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: '1.5 solid #111111',
  },
  brandName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    color: '#111111',
  },
  brandTagline: {
    fontSize: 8,
    color: '#aaaaaa',
    letterSpacing: 1,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  invoiceMeta: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
    color: '#aaaaaa',
    textTransform: 'uppercase',
  },
  invoiceNumber: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    marginTop: 3,
  },
  invoiceDate: {
    fontSize: 9,
    color: '#888888',
    marginTop: 3,
  },

  // ── Status badges row ──
  statusRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgePaid: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
  },
  badgePending: {
    backgroundColor: '#fffbeb',
    color: '#92400e',
  },
  badgeFulfillment: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
  },
  paymentMethodText: {
    fontSize: 8,
    color: '#aaaaaa',
    fontFamily: 'Helvetica-Bold',
    marginTop: 3,
    marginLeft: 'auto',
  },

  // ── Info grid ──
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: '1 solid #f0f0f0',
  },
  infoSection: {
    width: '45%',
  },
  infoLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    color: '#cccccc',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  infoName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    marginBottom: 2,
  },
  infoDetail: {
    fontSize: 9,
    color: '#888888',
    marginBottom: 2,
    lineHeight: 1.5,
  },

  // ── Items table ──
  tableLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    color: '#cccccc',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e5e5',
    paddingBottom: 7,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    color: '#aaaaaa',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    borderBottom: '1 solid #f7f7f7',
    alignItems: 'center',
  },
  colProduct: { width: '50%' },
  colQty: { width: '12%', textAlign: 'right' },
  colPrice: { width: '19%', textAlign: 'right' },
  colTotal: { width: '19%', textAlign: 'right' },
  itemTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
  },
  itemVariant: {
    fontSize: 8,
    color: '#aaaaaa',
    marginTop: 2,
  },
  cellText: {
    fontSize: 10,
    color: '#555555',
  },
  cellBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
  },

  // ── Totals ──
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalsInner: {
    width: 210,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottom: '1 solid #f7f7f7',
  },
  totalLabel: {
    fontSize: 10,
    color: '#888888',
  },
  totalValue: {
    fontSize: 10,
    color: '#555555',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#111111',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  grandTotalValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 44,
    right: 44,
    borderTop: '1 solid #f0f0f0',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerNote: {
    fontSize: 8,
    color: '#bbbbbb',
  },
  footerRef: {
    fontSize: 7,
    color: '#dddddd',
    fontFamily: 'Helvetica',
  },
});

interface InvoiceItem {
  title: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

export interface InvoiceDocumentProps {
  invoiceNumber: string;
  invoiceDate: string;
  orderId: string;
  orderDate: string;
  paymentMethod: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
  };
  shippingAddress?: {
    addressLine1?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
}

const fmt = (n: number) => `\u09F3${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

const paymentLabel = (method: string) => {
  if (method === 'cod') return 'Cash on Delivery';
  if (method === 'bkash') return 'bKash';
  if (method === 'card') return 'Credit / Debit Card';
  return method;
};

export function InvoiceDocument({
  invoiceNumber,
  invoiceDate,
  orderId,
  orderDate,
  paymentMethod,
  paymentStatus,
  fulfillmentStatus,
  customer,
  shippingAddress,
  items,
  subtotal,
  shippingCost,
  totalAmount,
  company,
}: InvoiceDocumentProps) {
  const shortId = orderId.slice(-8).toUpperCase();
  const isPaid = paymentStatus === 'paid';
  const variantText = (item: InvoiceItem) =>
    [
      item.color && item.color !== 'Default' ? item.color : null,
      item.size && item.size !== 'Default' ? item.size : null,
    ]
      .filter(Boolean)
      .join(' · ');

  const addressText = shippingAddress
    ? [
        shippingAddress.addressLine1,
        shippingAddress.city,
        shippingAddress.postcode,
        shippingAddress.country,
      ]
        .filter(Boolean)
        .join(', ')
    : 'No address provided';

  return (
    <Document
      title={`Invoice ${invoiceNumber} — ${company.name}`}
      author={company.name}
    >
      <Page size="A4" style={styles.page}>

        {/* ── HEADER ── */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brandName}>{company.name.toUpperCase()}</Text>
            <Text style={styles.brandTagline}>Toys Worth Keeping</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>{invoiceDate}</Text>
          </View>
        </View>

        {/* ── STATUS BADGES ── */}
        <View style={styles.statusRow}>
          <Text style={[styles.badge, isPaid ? styles.badgePaid : styles.badgePending]}>
            {isPaid ? 'Paid' : 'Pending'}
          </Text>
          <Text style={[styles.badge, styles.badgeFulfillment]}>
            {fulfillmentStatus || 'Processing'}
          </Text>
          <Text style={styles.paymentMethodText}>{paymentLabel(paymentMethod)}</Text>
        </View>

        {/* ── BILL TO / SHIP TO ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Bill To</Text>
            <Text style={styles.infoName}>{customer.name || 'Customer'}</Text>
            {customer.email ? <Text style={styles.infoDetail}>{customer.email}</Text> : null}
            {customer.phone ? <Text style={styles.infoDetail}>{customer.phone}</Text> : null}
          </View>
          <View style={[styles.infoSection, { alignItems: 'flex-end' }]}>
            <Text style={styles.infoLabel}>Order Details</Text>
            <Text style={styles.infoDetail}>Order #{shortId}</Text>
            <Text style={styles.infoDetail}>Placed: {orderDate}</Text>
            <Text style={[styles.infoDetail, { marginTop: 6 }]}>{addressText}</Text>
          </View>
        </View>

        {/* ── ITEMS TABLE ── */}
        <Text style={styles.tableLabel}>Items Ordered</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colProduct]}>Product</Text>
          <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
          <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
        </View>

        {items.map((item, i) => {
          const variant = variantText(item);
          return (
            <View key={i} style={styles.tableRow}>
              <View style={styles.colProduct}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {variant ? <Text style={styles.itemVariant}>{variant}</Text> : null}
              </View>
              <Text style={[styles.cellText, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.cellText, styles.colPrice]}>{fmt(item.price)}</Text>
              <Text style={[styles.cellBold, styles.colTotal]}>
                {fmt(item.price * item.quantity)}
              </Text>
            </View>
          );
        })}

        {/* ── TOTALS ── */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsInner}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={styles.totalValue}>{fmt(shippingCost)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{fmt(totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerNote}>
            Thank you for shopping with {company.name} 🧸 · This is a system-generated invoice.
          </Text>
          <Text style={styles.footerRef}>Order ID: {orderId}</Text>
        </View>
      </Page>
    </Document>
  );
}

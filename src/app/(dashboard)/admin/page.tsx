import connectToDatabase from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import DashboardClient from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connectToDatabase();
  const { withCache } = await import('@/lib/cache');

  const data = await withCache('admin:dashboard:overview', 30, async () => {
    const [
      totalOrdersCount,
      totalProductsCount,
      customerEmails,
      revenueAgg,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      Order.distinct('customerEmail'),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.find()
        .select('orderNumber customerName customerEmail createdAt totalAmount paymentStatus fulfillmentStatus')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Product.find()
        .select('title price soldCount images')
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),
    ]);

    const totalRevenue = revenueAgg?.[0]?.total || 0;
    const totalCustomersCount = customerEmails.length;

    return {
      totalRevenue,
      totalOrdersCount,
      totalCustomersCount,
      totalProductsCount,
      recentOrders,
      topProducts,
    };
  });

  return (
    <DashboardClient
      totalRevenue={data.totalRevenue}
      totalOrdersCount={data.totalOrdersCount}
      totalCustomersCount={data.totalCustomersCount}
      totalProductsCount={data.totalProductsCount}
      recentOrders={JSON.parse(JSON.stringify(data.recentOrders))}
      topProducts={JSON.parse(JSON.stringify(data.topProducts))}
    />
  );
}

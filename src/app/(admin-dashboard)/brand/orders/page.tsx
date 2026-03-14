import type { Metadata } from "next";
import { OrdersPageView } from "pages-sections/brand-dashboard/orders/page-view";

export const metadata: Metadata = {
  title: "Orders - BAZAAR Brand Dashboard",
  description: "Manage orders for your brand",
};

export default function VendorOrdersPage() {
  return <OrdersPageView />;
}

import type { Metadata } from "next";
import { OrdersPageView } from "pages-sections/customer-dashboard/orders/page-view";

export const metadata: Metadata = {
  title: "Orders - Seoulé",
  description: "Seoulé — Fashion platform connecting brands and shoppers",
  keywords: ["e-commerce", "orders", "next.js", "react"]
};

export default function OrdersPage() {
  return <OrdersPageView />;
}

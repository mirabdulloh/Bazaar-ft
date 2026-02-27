import { Metadata } from "next";
import { OrdersPageView } from "pages-sections/brand-dashboard/orders/page-view";
// API FUNCTIONS
import api from "utils/__api__/dashboard";

export const metadata: Metadata = {
  title: "Orders - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default async function Orders() {
  const orders = await api.orders();
  return <OrdersPageView orders={orders} />;
}

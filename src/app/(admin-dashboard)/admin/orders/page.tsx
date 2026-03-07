import { Metadata } from "next";
import { OrdersPageView } from "pages-sections/brand-dashboard/orders/page-view";

export const metadata: Metadata = {
  title: "Orders - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Orders() {
  return <OrdersPageView />;
}

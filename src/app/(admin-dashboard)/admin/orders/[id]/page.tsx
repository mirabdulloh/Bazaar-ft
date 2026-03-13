import { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetailsPageView } from "pages-sections/brand-dashboard/orders/page-view";
// API FUNCTIONS
import api from "utils/__api__/dashboard";
// CUSTOM DATA MODEL
import { IdParams } from "models/Common";

export const metadata: Metadata = {
  title: "Order Details - BAZAAR",
  description: `BAZAAR — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default async function OrderDetails({ params }: IdParams) {
  const { id } = await params;
  const order = await api.getOrder(id);

  if (!order) notFound();

  return <OrderDetailsPageView order={order} />;
}

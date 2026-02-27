import { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetailsPageView } from "pages-sections/customer-dashboard/orders/page-view";
// API FUNCTIONS
import api from "utils/__api__/orders";
// CUSTOM DATA MODEL
import { IdParams } from "models/Common";

export async function generateMetadata({ params }: IdParams): Promise<Metadata> {
  const { id } = await params;
  const order = await api.getOrder(id);
  if (!order) notFound();

  return {
    title: order.id + " - Seoulé",
    description: "Seoulé — Fashion platform connecting brands and shoppers.",
    
    keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
  };
}

export default async function OrderDetails({ params }: IdParams) {
  const { id } = await params;
  const order = await api.getOrder(id);

  if (!order) notFound();

  return <OrderDetailsPageView order={order} />;
}

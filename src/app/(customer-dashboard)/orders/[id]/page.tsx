import type { Metadata } from "next";
import { OrderDetailsPageView } from "pages-sections/customer-dashboard/orders/page-view";
import { IdParams } from "models/Common";

export async function generateMetadata({ params }: IdParams): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order #${id.substring(0, 12)} - Seoulé`,
    description: "Seoulé — Fashion platform connecting brands and shoppers.",
  };
}

export default async function OrderDetails({ params }: IdParams) {
  const { id } = await params;
  return <OrderDetailsPageView orderId={id} />;
}

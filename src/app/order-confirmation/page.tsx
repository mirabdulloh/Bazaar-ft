import type { Metadata } from "next";
import { OrderConfirmationPageView } from "pages-sections/order-confirmation";

export const metadata: Metadata = {
  title: "Order Confirmation - Seoulé",
  description:
    "Seoulé — Fashion platform connecting brands and shoppers",
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function OrderConfirmation() {
  return <OrderConfirmationPageView />;
}

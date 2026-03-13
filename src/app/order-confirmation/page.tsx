import type { Metadata } from "next";
import { OrderConfirmationPageView } from "pages-sections/order-confirmation";

export const metadata: Metadata = {
  title: "Order Confirmation - BAZAAR",
  description:
    "BAZAAR — Fashion platform connecting brands and shoppers",
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function OrderConfirmation() {
  return <OrderConfirmationPageView />;
}

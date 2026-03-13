import type { Metadata } from "next";
import { PaymentPageView } from "pages-sections/payment/page-view";

export const metadata: Metadata = {
  title: "Payment - BAZAAR",
  description:
    "BAZAAR — Fashion platform connecting brands and shoppers",
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Payment() {
  return <PaymentPageView />;
}

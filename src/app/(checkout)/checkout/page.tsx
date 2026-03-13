import type { Metadata } from "next";
import CheckoutPageView from "pages-sections/checkout/page-view";

export const metadata: Metadata = {
  title: "Checkout - BAZAAR",
  description:
    "BAZAAR — Fashion platform connecting brands and shoppers",
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Checkout() {
  return <CheckoutPageView />;
}

import type { Metadata } from "next";
import { CartPageView } from "pages-sections/cart/page-view";

export const metadata: Metadata = {
  title: "Cart - Seoulé",
  description:
    "Seoulé — Fashion platform connecting brands and shoppers",
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Cart() {
  return <CartPageView />;
}

import { Metadata } from "next";
import { WishListPageView } from "pages-sections/customer-dashboard/wish-list";

export const metadata: Metadata = {
  title: "Wish List - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

// ==============================================================
export default function WishList() {
  return <WishListPageView />;
}

import { Metadata } from "next";
import { ProductReviewsPageView } from "pages-sections/brand-dashboard/products/page-view";

export const metadata: Metadata = {
  title: "Product Reviews - BAZAAR",
  description: `BAZAAR — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function ProductReviews() {
  return <ProductReviewsPageView />;
}

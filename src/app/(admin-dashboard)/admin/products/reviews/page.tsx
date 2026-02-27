import { Metadata } from "next";
import { ProductReviewsPageView } from "pages-sections/brand-dashboard/products/page-view";
// API FUNCTIONS
import api from "utils/__api__/dashboard";

export const metadata: Metadata = {
  title: "Product Reviews - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default async function ProductReviews() {
  const reviews = await api.reviews();
  return <ProductReviewsPageView reviews={reviews} />;
}

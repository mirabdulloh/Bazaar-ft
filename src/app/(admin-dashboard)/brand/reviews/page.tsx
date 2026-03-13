import { Metadata } from "next";
import { ReviewsPageView } from "pages-sections/brand-dashboard/reviews/page-view";
// API FUNCTIONS
import api from "utils/__api__/brand-dashboard";

export const metadata: Metadata = {
  title: "Reviews - BAZAAR",
  description: `BAZAAR — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default async function Reviews() {
  const reviews = await api.getAllProductReviews();
  return <ReviewsPageView reviews={reviews} />;
}

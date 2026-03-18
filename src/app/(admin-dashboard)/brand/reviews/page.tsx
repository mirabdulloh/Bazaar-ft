import { Metadata } from "next";
import { ReviewsPageView } from "pages-sections/brand-dashboard/reviews/page-view";

export const metadata: Metadata = {
  title: "Reviews - BAZAAR",
  description: `BAZAAR — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default async function Reviews() {
  return <ReviewsPageView />;
}

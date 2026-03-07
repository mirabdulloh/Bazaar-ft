import { Metadata } from "next";
import { CategoriesPageView } from "pages-sections/brand-dashboard/categories/page-view";

export const metadata: Metadata = {
  title: "Categories - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Categories() {
  return <CategoriesPageView />;
}

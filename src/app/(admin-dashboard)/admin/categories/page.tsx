import { Metadata } from "next";
import { CategoriesPageView } from "pages-sections/brand-dashboard/categories/page-view";
// API FUNCTIONS
import api from "utils/__api__/dashboard";

export const metadata: Metadata = {
  title: "Categories - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default async function Categories() {
  const categories = await api.category();
  return <CategoriesPageView categories={categories} />;
}

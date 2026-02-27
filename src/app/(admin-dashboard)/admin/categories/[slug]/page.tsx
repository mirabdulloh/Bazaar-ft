import { Metadata } from "next";
import { EditCategoryPageView } from "pages-sections/brand-dashboard/categories/page-view";

export const metadata: Metadata = {
  title: "Edit Category - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function EditCategory() {
  return <EditCategoryPageView />;
}

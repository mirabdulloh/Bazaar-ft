import { Metadata } from "next";
import { EditBrandPageView } from "pages-sections/brand-dashboard/brands/page-view";

export const metadata: Metadata = {
  title: "Edit Brand - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function BrandEdit() {
  return <EditBrandPageView />;
}

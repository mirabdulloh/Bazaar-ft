import { Metadata } from "next";
import { CreateBrandPageView } from "pages-sections/brand-dashboard/brands/page-view";

export const metadata: Metadata = {
  title: "Brand Create - BAZAAR",
  description: `BAZAAR — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function BrandCreate() {
  return <CreateBrandPageView />;
}

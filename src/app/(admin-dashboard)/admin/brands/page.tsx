import { Metadata } from "next";
import { BrandsPageView } from "pages-sections/brand-dashboard/brands/page-view";

export const metadata: Metadata = {
  title: "Brands - BAZAAR",
  description: `BAZAAR — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Brands() {
  return <BrandsPageView />;
}

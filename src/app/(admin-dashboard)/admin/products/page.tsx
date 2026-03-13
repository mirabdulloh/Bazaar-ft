import { Metadata } from "next";
import { ProductsPageView } from "pages-sections/brand-dashboard/products/page-view";

export const metadata: Metadata = {
  title: "Products - BAZAAR",
  description: `BAZAAR — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Products() {
  return <ProductsPageView />;
}

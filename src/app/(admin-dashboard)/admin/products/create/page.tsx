import { Metadata } from "next";
import { ProductCreatePageView } from "pages-sections/brand-dashboard/products/page-view";

export const metadata: Metadata = {
  title: "Product Create - BAZAAR",
  description: `BAZAAR — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function ProductCreate() {
  return <ProductCreatePageView />;
}

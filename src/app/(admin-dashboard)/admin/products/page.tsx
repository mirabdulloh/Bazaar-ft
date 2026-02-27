import { Metadata } from "next";
import { ProductsPageView } from "pages-sections/brand-dashboard/products/page-view";
// API FUNCTIONS
import api from "utils/__api__/dashboard";

export const metadata: Metadata = {
  title: "Products - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default async function Products() {
  const products = await api.products();
  return <ProductsPageView products={products} />;
}

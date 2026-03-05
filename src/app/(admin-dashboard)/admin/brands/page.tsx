import { Metadata } from "next";
import { BrandsPageView } from "pages-sections/brand-dashboard/brands/page-view";
// API FUNCTIONS
import api from "utils/__api__/dashboard";

export const metadata: Metadata = {
  title: "Brands - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default async function Brands() {
  const brands = await api.brands();
  return <BrandsPageView brands={brands} />;
}

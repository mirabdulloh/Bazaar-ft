import { Metadata } from "next";
import { CustomersPageView } from "pages-sections/brand-dashboard/customers/page-view";
// API FUNCTIONS
import api from "utils/__api__/dashboard";

export const metadata: Metadata = {
  title: "Customers - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default async function Customers() {
  const customers = await api.customers();
  return <CustomersPageView customers={customers} />;
}

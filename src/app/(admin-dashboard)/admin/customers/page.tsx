import { Metadata } from "next";
import { CustomersPageView } from "pages-sections/brand-dashboard/customers/page-view";

export const metadata: Metadata = {
  title: "Users - BAZAAR",
  description: `BAZAAR — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Users() {
  return <CustomersPageView />;
}

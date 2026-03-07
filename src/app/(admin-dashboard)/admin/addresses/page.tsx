import { Metadata } from "next";
import { AddressesPageView } from "pages-sections/brand-dashboard/addresses/page-view";

export const metadata: Metadata = {
  title: "Addresses - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Addresses() {
  return <AddressesPageView />;
}

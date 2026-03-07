import type { Metadata } from "next";
import { AddressPageView } from "pages-sections/customer-dashboard/address/page-view";

export const metadata: Metadata = {
  title: "My Addresses - Seoulé",
  description: "Seoulé — Fashion platform connecting brands and shoppers.",
};

export default function AddressPage() {
  return <AddressPageView />;
}

import type { Metadata } from "next";
import { VendorPayoutsPageView } from "pages-sections/brand-dashboard/v-payouts/page-view";

export const metadata: Metadata = {
  title: "Payouts - Bazaar Brand Dashboard",
  description: "View your payout history",
};

export default function Payouts() {
  return <VendorPayoutsPageView payouts={[]} />;
}

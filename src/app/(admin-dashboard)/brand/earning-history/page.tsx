import type { Metadata } from "next";
import { VendorEarningHistoryPageView } from "pages-sections/brand-dashboard/v-earning-history/page-view";

export const metadata: Metadata = {
  title: "Earning History - Bazaar Brand Dashboard",
  description: "View your brand earning history",
};

export default function EarningHistory() {
  return <VendorEarningHistoryPageView earnings={[]} />;
}

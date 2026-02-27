import type { Metadata } from "next";
import { VendorPayoutRequestsPageView } from "pages-sections/brand-dashboard/v-payout-request/page-view";
import api from "utils/__api__/brand-dashboard";

export const metadata: Metadata = {
  title: "Payout Requests - Bazaar Brand Dashboard",
  description: "Manage your payout requests",
};

export default async function PayoutRequests() {
  const payoutRequests = await api.getAllPayoutRequests();
  return <VendorPayoutRequestsPageView payoutRequests={payoutRequests} />;
}

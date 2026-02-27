import type { Metadata } from "next";
import { RefundRequestPageView } from "pages-sections/brand-dashboard/refund-request/page-view";
import api from "utils/__api__/brand-dashboard";

export const metadata: Metadata = {
  title: "Refund Requests - Bazaar Brand Dashboard",
  description: "Manage refund requests from customers",
};

export default async function RefundRequest() {
  const requests = await api.getAllRefundRequests();
  return <RefundRequestPageView requests={requests} />;
}

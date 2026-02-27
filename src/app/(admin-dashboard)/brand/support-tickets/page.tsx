import type { Metadata } from "next";
import { SupportTicketsPageView } from "pages-sections/brand-dashboard/support-tickets/page-view";

export const metadata: Metadata = {
  title: "Support Tickets - Bazaar Brand Dashboard",
  description: "View and manage support tickets",
};

export default function SupportTickets() {
  return <SupportTicketsPageView tickets={[]} />;
}

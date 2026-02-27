import { Metadata } from "next";
import { TicketsPageView } from "pages-sections/customer-dashboard/support-tickets/page-view";
// API FUNCTIONS
import api from "utils/__api__/ticket";

export const metadata: Metadata = {
  title: "Support Tickets - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

// ==============================================================
interface Props {
  searchParams: Promise<{ page: string }>;
}
// ==============================================================

export default async function SupportTickets({ searchParams }: Props) {
  const { page } = await searchParams;
  const data = await api.getTicketList(+page || 1);

  if (!data || data.tickets.length === 0) {
    return <div>Data not found</div>;
  }

  return <TicketsPageView tickets={data.tickets} totalPages={data.totalPages} />;
}

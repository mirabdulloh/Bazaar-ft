import { Metadata } from "next";
import { notFound } from "next/navigation";
import { TicketDetailsPageView } from "pages-sections/customer-dashboard/support-tickets/page-view";
// API FUNCTIONS
import api from "utils/__api__/ticket";
// CUSTOM DATA MODEL
import { SlugParams } from "models/Common";

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const { slug } = await params;
  const ticket = await api.getTicket(slug);

  return {
    title: ticket.title + " - Seoulé",
    description: "Seoulé — Fashion platform connecting brands and shoppers.",
    
    keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
  };
}

export default async function SupportTicketDetails({ params }: SlugParams) {
  const { slug } = await params;
  const ticket = await api.getTicket(slug);

  if (!ticket) notFound();

  return <TicketDetailsPageView ticket={ticket} />;
}

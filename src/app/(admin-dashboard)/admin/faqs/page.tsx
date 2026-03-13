import type { Metadata } from "next";
import { FaqsPageView } from "pages-sections/brand-dashboard/faqs/page-view";

export const metadata: Metadata = {
  title: "FAQs - BAZAAR Admin",
  description: "Manage frequently asked questions",
};

export default function AdminFaqsPage() {
  return <FaqsPageView />;
}

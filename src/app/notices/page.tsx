import type { Metadata } from "next";
import CustomerSupportPageView from "pages-sections/customer-support/page-view";

export const metadata: Metadata = {
  title: "Customer Support - Notices - BAZAAR",
  description: "Latest announcements and platform notices from BAZAAR."
};

export default function NoticesPage() {
  return <CustomerSupportPageView initialTab="notices" />;
}

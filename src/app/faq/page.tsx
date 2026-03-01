import type { Metadata } from "next";
import CustomerSupportPageView from "pages-sections/customer-support/page-view";

export const metadata: Metadata = {
  title: "Customer Support - FAQ - BAZAAR",
  description: "Frequently asked questions about shopping on BAZAAR."
};

export default function FaqPage() {
  return <CustomerSupportPageView initialTab="faq" />;
}

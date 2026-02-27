import type { Metadata } from "next";
import FaqPageView from "pages-sections/faq/page-view/faq";

export const metadata: Metadata = {
  title: "FAQ - BAZAAR",
  description: "Frequently asked questions about shopping on BAZAAR.",
};

export default function FaqPage() {
  return <FaqPageView />;
}

import type { Metadata } from "next";
import NoticesPageView from "pages-sections/notices/page-view/notices";

export const metadata: Metadata = {
  title: "Notices - BAZAAR",
  description: "Latest announcements and platform notices from BAZAAR.",
};

export default function NoticesPage() {
  return <NoticesPageView />;
}

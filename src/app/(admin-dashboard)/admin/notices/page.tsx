import type { Metadata } from "next";
import { NoticesPageView } from "pages-sections/brand-dashboard/notices/page-view";

export const metadata: Metadata = {
  title: "Notices - BAZAAR Admin",
  description: "Manage platform notices and announcements",
};

export default function AdminNoticesPage() {
  return <NoticesPageView />;
}

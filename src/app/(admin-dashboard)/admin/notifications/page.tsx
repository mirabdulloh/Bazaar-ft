import type { Metadata } from "next";
import { AdminNotificationsPageView } from "pages-sections/brand-dashboard/admin-notifications/page-view";

export const metadata: Metadata = {
  title: "Notifications - Seoulé Admin",
  description: "Manage platform notifications",
};

export default function AdminNotificationsPage() {
  return <AdminNotificationsPageView />;
}

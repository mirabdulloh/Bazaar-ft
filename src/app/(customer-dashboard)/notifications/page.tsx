import type { Metadata } from "next";
import NotificationsPageView from "pages-sections/customer-dashboard/notifications/page-view/notifications";

export const metadata: Metadata = {
  title: "Notifications - Seoulé",
  description: "View your notifications",
};

export default function NotificationsPage() {
  return <NotificationsPageView />;
}

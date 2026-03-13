import type { Metadata } from "next";
import NotificationsPageView from "pages-sections/customer-dashboard/notifications/page-view/notifications";

export const metadata: Metadata = {
  title: "Notifications - BAZAAR",
  description: "View your notifications",
};

export default function NotificationsPage() {
  return <NotificationsPageView />;
}

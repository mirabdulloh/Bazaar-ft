import type { Metadata } from "next";
import { AdminDashboardPageView } from "pages-sections/brand-dashboard/admin-dashboard/page-view";

export const metadata: Metadata = {
  title: "Admin Dashboard - BAZAAR",
  description: "BAZAAR admin dashboard for platform oversight and moderation.",
  keywords: ["admin dashboard", "brands", "members", "moderation", "bazaar"]
};

export default function AdminDashboard() {
  return <AdminDashboardPageView />;
}

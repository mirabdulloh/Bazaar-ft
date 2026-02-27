import type { Metadata } from "next";
import { DashboardPageView } from "pages-sections/brand-dashboard/dashboard/page-view";

export const metadata: Metadata = {
  title: "Vendor Dashboard - Seoulé",
  description:
    "Seoulé — Fashion platform connecting brands and shoppers",
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function VendorDashboard() {
  return <DashboardPageView />;
}

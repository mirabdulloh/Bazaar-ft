import type { Metadata } from "next";
import { CouponsPageView } from "pages-sections/brand-dashboard/coupons/page-view";

export const metadata: Metadata = {
  title: "Coupons - BAZAAR Admin",
  description: "Manage discount coupons",
};

export default function AdminCouponsPage() {
  return <CouponsPageView />;
}

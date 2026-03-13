import type { Metadata } from "next";
import { BrandCouponsPageView } from "pages-sections/brand-dashboard/brand-coupons/page-view";

export const metadata: Metadata = {
  title: "Coupons - BAZAAR Brand Dashboard",
  description: "Create and manage brand coupons",
};

export default function VendorCouponsPage() {
  return <BrandCouponsPageView />;
}

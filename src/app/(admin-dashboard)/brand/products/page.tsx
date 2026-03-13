import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Products - BAZAAR Brand Dashboard",
  description: "Manage your brand's products",
};

import { BrandProductsPageView } from "pages-sections/brand-dashboard/brand-products/page-view";

export default function VendorProductsPage() {
  return <BrandProductsPageView />;
}

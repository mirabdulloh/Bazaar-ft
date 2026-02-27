import type { Metadata } from "next";
import { ShopsPageView } from "pages-sections/brands/page-view";
import { getShopList } from "utils/__api__/brands";

export const metadata: Metadata = {
  title: "Brands - Seoulé",
  description: "Discover all fashion brands on Seoulé. Shop clothing, shoes, and accessories from independent brands.",
};

export default async function BrandsPage() {
  const { shops, meta } = await getShopList();
  return (
    <ShopsPageView
      shops={shops}
      totalShops={meta.totalShops}
      totalPages={meta.totalPages}
      firstIndex={meta.firstIndex}
      lastIndex={meta.lastIndex}
    />
  );
}

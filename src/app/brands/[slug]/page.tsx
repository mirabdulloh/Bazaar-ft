import type { Metadata } from "next";
import { ShopDetailsPageView } from "pages-sections/brands/page-view";
import { getProductsBySlug } from "utils/__api__/brands";
import { getFilters } from "utils/__api__/product-search";

// ============================================================
type Props = { params: Promise<{ slug: string }> };
// ============================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} - Seoulé`,
    description: `Shop products from this brand on Seoulé.`,
  };
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params;
  const [shop, filters] = await Promise.all([
    getProductsBySlug(slug),
    getFilters()
  ]);

  return <ShopDetailsPageView shop={shop} filters={filters} />;
}

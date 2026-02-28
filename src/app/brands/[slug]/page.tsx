import type { Metadata } from "next";
import BrandDetailsPageView from "pages-sections/brands/page-view/brand-details";

// ============================================================
type Props = { params: Promise<{ slug: string }> };
// ============================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Brand - BAZAAR",
    description: "Shop products from this brand on BAZAAR.",
  };
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params;
  return <BrandDetailsPageView brandId={slug} />;
}

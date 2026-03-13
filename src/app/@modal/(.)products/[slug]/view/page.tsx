import type { Metadata } from "next";

import ProductQuickView from "./components/product-quick-view";

import { SlugParams } from "models/Common";

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Product Quick View - BAZAAR`,
    description: "BAZAAR — Fashion platform connecting brands and shoppers.",
    keywords: ["fashion", "clothing", slug, "BAZAAR"]
  };
}

export default async function QuickViewPage({ params }: SlugParams) {
  const { slug } = await params;

  return <ProductQuickView productId={slug} />;
}

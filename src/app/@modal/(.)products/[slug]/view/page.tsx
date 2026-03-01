import type { Metadata } from "next";

import ProductQuickView from "./components/product-quick-view";

import { SlugParams } from "models/Common";

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Product Quick View - Seoulé`,
    description: "Seoulé — Fashion platform connecting brands and shoppers.",
    keywords: ["fashion", "clothing", slug, "Seoulé"]
  };
}

export default async function QuickViewPage({ params }: SlugParams) {
  const { slug } = await params;

  return <ProductQuickView productId={slug} />;
}

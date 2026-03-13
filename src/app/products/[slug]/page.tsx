import type { Metadata } from "next";
// PAGE VIEW COMPONENT
import { ProductDetailsPageView } from "pages-sections/product-details/page-view";
// CUSTOM DATA MODEL
import { SlugParams } from "models/Common";

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Product Details - BAZAAR`,
    description: `Shop product details on BAZAAR.`,
    keywords: ["fashion", "clothing", slug, "BAZAAR"]
  };
}

export default async function ProductDetails({ params }: SlugParams) {
  const { slug } = await params;

  return <ProductDetailsPageView productId={slug} />;
}

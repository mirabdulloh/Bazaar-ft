import type { Metadata } from "next";
import { notFound } from "next/navigation";
// PAGE VIEW COMPONENT
import { ProductDetailsPageView } from "pages-sections/product-details/page-view";
// API FUNCTIONS
import api from "utils/__api__/products";
import { getFrequentlyBought, getRelatedProducts } from "utils/__api__/related-products";
// CUSTOM DATA MODEL
import { SlugParams } from "models/Common";

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await api.getProduct(slug);
  if (!product) notFound();

  return {
    title: `${product.title} - Seoulé`,
    description: `Shop ${product.title} on Seoulé. Discover fashion from the best independent brands.`,
    keywords: ["fashion", "clothing", product.title, "Seoulé"]
  };
}

export default async function ProductDetails({ params }: SlugParams) {
  const { slug } = await params;
  const [product, relatedProducts, frequentlyBought] = await Promise.all([
    api.getProduct(slug),
    getRelatedProducts(),
    getFrequentlyBought()
  ]);

  if (!product) notFound();

  return (
    <ProductDetailsPageView
      product={product}
      relatedProducts={relatedProducts}
      frequentlyBought={frequentlyBought}
    />
  );
}

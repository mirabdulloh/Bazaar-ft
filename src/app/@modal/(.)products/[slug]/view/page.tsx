import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductQuickView from "./components/product-quick-view";

import api from "utils/__api__/products";
import { SlugParams } from "models/Common";

export async function generateMetadata({ params }: SlugParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await api.getProduct(slug);

  if (!product) notFound();

  return {
    title: product.title + " - Seoulé",
    description: "Seoulé — Fashion platform connecting brands and shoppers.",
    
    keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
  };
}

export default async function QuickViewPage({ params }: SlugParams) {
  const { slug } = await params;
  const product = await api.getProduct(slug);

  if (!product) notFound();

  return <ProductQuickView product={product} />;
}

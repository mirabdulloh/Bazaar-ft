import { Metadata } from "next";
// PAGE VIEW COMPONENT
import { ProductSearchPageView } from "pages-sections/product-details/page-view";
// API FUNCTIONS
import { getFilters, getProducts } from "utils/__api__/product-search";

export const metadata: Metadata = {
  title: "Shop Products - Seoulé",
  description: "Browse and shop clothing, shoes, and accessories from the best fashion brands on Seoulé.",
  keywords: ["fashion", "clothing", "shop", "brands", "Seoulé"]
};

// ==============================================================
interface Props {
  searchParams: Promise<{
    q: string;
    sale: string;
    page: string;
    sort: string;
    prices: string;
    colors: string;
    brands: string;
    rating: string;
    category: string;
  }>;
}
// ==============================================================

export default async function ProductSearch({ searchParams }: Props) {
  const { q, page, sort, sale, prices, colors, brands, rating, category } = await searchParams;

  const [filters, data] = await Promise.all([
    getFilters(),
    getProducts({ q, page, sort, sale, prices, colors, brands, rating, category })
  ]);

  return (
    <ProductSearchPageView
      filters={filters}
      products={data.products}
      pageCount={data.pageCount}
      totalProducts={data.totalProducts}
      lastIndex={data.lastIndex}
      firstIndex={data.firstIndex}
    />
  );
}

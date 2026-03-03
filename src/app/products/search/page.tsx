import { Metadata } from "next";
import { ProductSearchPageView } from "pages-sections/product-details/page-view";

export const metadata: Metadata = {
  title: "Products - BAZAAR",
  description: "Browse and shop clothing, shoes, bags, and accessories from the best fashion brands on BAZAAR.",
  keywords: ["fashion", "clothing", "shop", "brands", "BAZAAR"]
};

export default function ProductSearch() {
  return <ProductSearchPageView />;
}

import type { Metadata } from "next";
import { BrandArticlesPageView } from "pages-sections/brand-dashboard/articles/page-view";

export const metadata: Metadata = {
  title: "My Articles - BAZAAR Brand",
  description: "Manage and publish brand community articles",
};

export default function BrandArticlesPage() {
  return <BrandArticlesPageView />;
}

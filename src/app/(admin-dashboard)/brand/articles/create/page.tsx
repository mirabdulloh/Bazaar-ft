import type { Metadata } from "next";
import CreateArticlePageView from "pages-sections/brand-dashboard/articles/page-view/create-article";

export const metadata: Metadata = {
  title: "Write Article - BAZAAR Brand",
  description: "Write and publish a brand community article",
};

export default function BrandCreateArticlePage() {
  return <CreateArticlePageView />;
}

import type { Metadata } from "next";
import { ArticlesPageView } from "pages-sections/brand-dashboard/articles/page-view";

export const metadata: Metadata = {
  title: "Community Articles - Seoulé Admin",
  description: "Moderate community articles and posts",
};

export default function AdminArticlesPage() {
  return <ArticlesPageView />;
}

import type { Metadata } from "next";
import CreateArticlePageView from "pages-sections/brand-dashboard/articles/page-view/create-article";

export const metadata: Metadata = {
  title: "Write Article - BAZAAR Admin",
  description: "Write a new community article as admin",
};

export default function AdminCreateArticlePage() {
  return <CreateArticlePageView />;
}

import type { Metadata } from "next";
import ArticleDetailPageView from "pages-sections/community/page-view/article-detail";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = {
  title: "Article - BAZAAR Community",
  description: "Read this article on BAZAAR Community.",
};

export default async function CommunityArticlePage({ params }: Props) {
  const { slug } = await params;
  return <ArticleDetailPageView initialInput={{ articleId: slug }} />;
}

import type { Metadata } from "next";
import CommunityPageView from "pages-sections/community/page-view/community";

export const metadata: Metadata = {
  title: "Community - BAZAAR",
  description: "Fashion articles, lookbooks, and style guides from BAZAAR brands and creators.",
};

export default function CommunityPage() {
  return <CommunityPageView />;
}

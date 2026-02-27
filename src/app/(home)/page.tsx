import type { Metadata } from "next";
import HomePageView from "pages-sections/home/page-view";

export const metadata: Metadata = {
  title: "Seoulé — Discover & Shop the Best Fashion Brands",
  description:
    "Seoulé is a multi-brand fashion platform. Discover, follow, and shop your favorite independent clothing brands all in one place.",
  keywords: ["fashion", "clothing", "brands", "e-commerce", "streetwear", "style"]
};

export default function HomePage() {
  return <HomePageView />;
}

import { Metadata } from "next";
import { ShopSettingsPageView } from "pages-sections/brand-dashboard/shop-settings/page-view";

export const metadata: Metadata = {
  title: "Shop Settings - Seoulé",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function ShopSettings() {
  return <ShopSettingsPageView />;
}

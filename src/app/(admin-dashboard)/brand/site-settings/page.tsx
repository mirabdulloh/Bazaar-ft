import type { Metadata } from "next";
import { SiteSettingsPageView } from "pages-sections/brand-dashboard/site-settings/page-view";

export const metadata: Metadata = {
  title: "Site Settings - Bazaar Brand Dashboard",
  description: "Configure your brand site settings",
};

export default function SiteSettings() {
  return <SiteSettingsPageView />;
}

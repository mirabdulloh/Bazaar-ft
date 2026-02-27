import { Metadata } from "next";
import { AccountSettingsPageView } from "pages-sections/brand-dashboard/account-settings/page-view";

export const metadata: Metadata = {
  title: "Account Settings - Next.js E-commerce Template",
  description: `Seoulé — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function AccountSettings() {
  return <AccountSettingsPageView />;
}

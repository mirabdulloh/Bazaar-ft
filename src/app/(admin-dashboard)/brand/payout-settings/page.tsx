import type { Metadata } from "next";
import { PayoutSettingsPageView } from "pages-sections/brand-dashboard/payout-settings/page-view";

export const metadata: Metadata = {
  title: "Payout Settings - Bazaar Brand Dashboard",
  description: "Configure your payout settings",
};

export default function PayoutSettings() {
  return <PayoutSettingsPageView />;
}

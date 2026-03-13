import { Metadata } from "next";
import { ProfilePageView } from "pages-sections/customer-dashboard/profile/page-view";

export const metadata: Metadata = {
  title: "My Profile - BAZAAR",
  description: "BAZAAR — Fashion platform connecting brands and shoppers.",
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Profile() {
  return <ProfilePageView />;
}

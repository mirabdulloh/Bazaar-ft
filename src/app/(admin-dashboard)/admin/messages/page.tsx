import { Metadata } from "next";
import { MessagesPageView } from "pages-sections/brand-dashboard/admin-messages/page-view";

export const metadata: Metadata = {
  title: "Messages - BAZAAR",
  description: `BAZAAR — Fashion platform connecting brands and shoppers`,
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Messages() {
  return <MessagesPageView />;
}

import type { Metadata } from "next";
import { ChatsPageView } from "pages-sections/brand-dashboard/chats/page-view";

export const metadata: Metadata = {
  title: "Chats - Seoulé Admin",
  description: "Manage and moderate platform chats",
};

export default function AdminChatsPage() {
  return <ChatsPageView />;
}

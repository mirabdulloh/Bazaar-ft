import type { Metadata } from "next";
import { VendorChatPageView } from "pages-sections/vendor-dashboard/chat/page-view/chat";

export const metadata: Metadata = {
  title: "Chats - Seoulé Brand Dashboard",
  description: "Chat with your customers",
};

export default function VendorChatsPage() {
  return <VendorChatPageView />;
}

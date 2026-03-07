import type { Metadata } from "next";
import { ChatPageView } from "pages-sections/customer-dashboard/chat/page-view/chat";

export const metadata: Metadata = {
  title: "Messages - Seoulé",
  description: "Chat with your favorite brands in real time.",
};

export default function ChatPage() {
  return <ChatPageView />;
}

"use client";

import DashboardChatView from "../../../../components/chat/dashboard-chat-view";
import { GET_MY_CHATS } from "../../../../../apollo/user/query";

export function ChatPageView() {
  return (
    <DashboardChatView
      chatsQuery={GET_MY_CHATS}
      chatsRootKey="getMyChats"
      mode="customer"
      title="Messages"
      subtitle="Chat with brands in real time."
    />
  );
}

"use client";

import DashboardChatView from "../../../../components/chat/dashboard-chat-view";
import { GET_BRAND_CHATS } from "../../../../../apollo/user/query";

export function VendorChatPageView() {
  return (
    <DashboardChatView
      chatsQuery={GET_BRAND_CHATS}
      chatsRootKey="getBrandChats"
      mode="brand"
      title="Chats"
      subtitle="Reply to customer conversations in one place."
    />
  );
}

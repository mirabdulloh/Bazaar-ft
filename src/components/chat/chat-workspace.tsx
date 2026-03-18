"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client/react";
import type { Socket } from "socket.io-client";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import MarkChatUnreadOutlined from "@mui/icons-material/MarkChatUnreadOutlined";
import SearchRounded from "@mui/icons-material/SearchRounded";
import SupportAgentRounded from "@mui/icons-material/SupportAgentRounded";
import StorefrontRounded from "@mui/icons-material/StorefrontRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import AddCommentRounded from "@mui/icons-material/AddCommentRounded";
import AutorenewRounded from "@mui/icons-material/AutorenewRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import PageWrapper from "pages-sections/brand-dashboard/page-wrapper";
import DashboardHeader from "pages-sections/customer-dashboard/dashboard-header";
import { userVar } from "../../../apollo/store";
import { GET_BRANDS } from "../../../apollo/user/query";
import {
  CLAIM_SUPPORT_CHAT,
  CLOSE_CHAT,
  MARK_CHAT_MESSAGES_AS_READ,
  OPEN_OR_GET_BRAND_CHAT,
  OPEN_OR_GET_SUPPORT_CHAT,
  SEND_CHAT_MESSAGE,
} from "../../../apollo/chat/mutation";
import {
  GET_ADMIN_SUPPORT_CHATS,
  GET_ALL_MESSAGES_BY_ADMIN,
  GET_BRAND_CHATS,
  GET_MESSAGES,
  GET_MY_CHATS,
  GET_MY_SUPPORT_CHATS,
} from "../../../apollo/chat/query";
import { createChatSocket } from "lib/chat/socket";
import { getJwtToken } from "lib/auth";
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from "lib/sweetAlert";

type ViewerMode = "user" | "brand" | "admin";
type ChatTab = "brand" | "support" | "customers" | "user-support" | "brand-support";

type ChatSummary = {
  _id: string;
  chatScope: "BRAND_DIRECT" | "ADMIN_SUPPORT";
  chatStatus: "PENDING" | "OPEN" | "CLOSED";
  requesterId: string;
  requesterType: "USER" | "BRAND";
  brandId?: string | null;
  assignedAdminId?: string | null;
  chatSubject?: string | null;
  supportTopic?: string | null;
  sourcePath?: string | null;
  lastMessageAt?: string | null;
  lastMessageText?: string | null;
  updatedAt: string;
  unreadCount: number;
  canReply: boolean;
  requesterData?: any;
  brandData?: any;
  assignedAdminData?: any;
};

type ChatMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType: string;
  messageType: "TEXT" | "IMAGE" | "FILE";
  message?: string | null;
  attachments?: string[] | null;
  isReadByMe: boolean;
  isOwnMessage: boolean;
  createdAt: string;
  senderData?: any;
};

const CHAT_PAGE_LIMIT = 50;
const MESSAGE_LIMIT = 100;
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const EMPTY_CHATS: ChatSummary[] = [];
const EMPTY_MESSAGES: ChatMessage[] = [];

function resolveImage(src?: string | null, fallbackSeed = "User"): string {
  if (src && src !== "null" && src !== "undefined") {
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    const normalized = src.startsWith("/") ? src : `/${src}`;
    return API_BASE ? `${API_BASE}${normalized}` : normalized;
  }

  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    fallbackSeed
  )}&backgroundColor=1d4ed8&textColor=ffffff`;
}

function formatRelativeDate(date?: string | null): string {
  if (!date) return "";
  const target = new Date(date);
  const diffMs = Date.now() - target.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return target.toLocaleDateString();
}

function formatThreadTime(date: string): string {
  return new Date(date).toLocaleString();
}

function getWorkspaceTitle(mode: ViewerMode): string {
  if (mode === "user") return "Messages";
  if (mode === "brand") return "Chats";
  return "Support Chats";
}

function getInitialTab(mode: ViewerMode): ChatTab {
  if (mode === "user") return "brand";
  if (mode === "brand") return "customers";
  return "user-support";
}

function getTabOptions(mode: ViewerMode): { value: ChatTab; label: string; icon: React.ReactElement }[] {
  if (mode === "user") {
    return [
      { value: "brand", label: "Brands", icon: <StorefrontRounded fontSize="small" /> },
      { value: "support", label: "Support", icon: <SupportAgentRounded fontSize="small" /> },
    ];
  }

  if (mode === "brand") {
    return [
      { value: "customers", label: "Customers", icon: <ForumOutlined fontSize="small" /> },
      { value: "support", label: "Support", icon: <SupportAgentRounded fontSize="small" /> },
    ];
  }

  return [
    { value: "user-support", label: "From Users", icon: <ForumOutlined fontSize="small" /> },
    { value: "brand-support", label: "From Brands", icon: <StorefrontRounded fontSize="small" /> },
  ];
}

function getDisplayName(chat: ChatSummary, mode: ViewerMode): string {
  if (chat.chatScope === "BRAND_DIRECT") {
    if (mode === "brand") return chat.requesterData?.memberNick || chat.requesterData?.memberFullName || "Customer";
    return chat.brandData?.brandName || chat.brandData?.memberData?.memberNick || "Brand";
  }

  if (mode === "admin") {
    return chat.requesterData?.memberNick || chat.requesterData?.memberFullName || "Support Request";
  }

  return chat.assignedAdminData?.memberNick || "Bazaar Support";
}

function getDisplayMeta(chat: ChatSummary, mode: ViewerMode): string {
  if (chat.chatScope === "BRAND_DIRECT") {
    return mode === "brand" ? "Customer conversation" : "Brand conversation";
  }

  if (mode === "admin") {
    return chat.requesterType === "BRAND" ? "Brand support" : "User support";
  }

  return chat.supportTopic || "Support chat";
}

function getDisplayAvatar(chat: ChatSummary, mode: ViewerMode): string {
  if (chat.chatScope === "BRAND_DIRECT") {
    if (mode === "brand") {
      return resolveImage(chat.requesterData?.memberImage, chat.requesterData?.memberNick || "Customer");
    }

    return resolveImage(
      chat.brandData?.memberData?.memberImage || chat.brandData?.brandLogo,
      chat.brandData?.brandName || "Brand"
    );
  }

  if (mode === "admin") {
    return resolveImage(chat.requesterData?.memberImage, chat.requesterData?.memberNick || "Support");
  }

  return resolveImage(chat.assignedAdminData?.memberImage, "Support");
}

function getListQueryConfig(mode: ViewerMode, tab: ChatTab) {
  const baseInput = {
    page: 1,
    limit: CHAT_PAGE_LIMIT,
    direction: "DESC",
  };

  if (mode === "user" && tab === "brand") {
    return {
      query: GET_MY_CHATS,
      dataKey: "getMyChats",
      variables: { input: { ...baseInput, search: { chatScope: "BRAND_DIRECT" } } },
    };
  }

  if (mode === "brand" && tab === "customers") {
    return {
      query: GET_BRAND_CHATS,
      dataKey: "getBrandChats",
      variables: { input: { ...baseInput, search: { chatScope: "BRAND_DIRECT" } } },
    };
  }

  if (mode === "admin") {
    return {
      query: GET_ADMIN_SUPPORT_CHATS,
      dataKey: "getAdminSupportChats",
      variables: {
        input: {
          ...baseInput,
          search: {
            chatScope: "ADMIN_SUPPORT",
            requesterType: tab === "brand-support" ? "BRAND" : "USER",
          },
        },
      },
    };
  }

  return {
    query: GET_MY_SUPPORT_CHATS,
    dataKey: "getMySupportChats",
    variables: { input: { ...baseInput, search: { chatScope: "ADMIN_SUPPORT" } } },
  };
}

export default function ChatWorkspace({ mode }: { mode: ViewerMode }) {
  const user = useReactiveVar(userVar);
  const router = useRouter();
  const searchParams = useSearchParams();
  const socketRef = useRef<Socket | null>(null);
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMarkedKeyRef = useRef<string>("");
  const selectedChatIdRef = useRef<string>("");
  const handledOpenBrandRef = useRef<string>("");

  const [activeTab, setActiveTab] = useState<ChatTab>(getInitialTab(mode));
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");
  const [chatRows, setChatRows] = useState<ChatSummary[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [supportTopic, setSupportTopic] = useState("");
  const [supportInitialMessage, setSupportInitialMessage] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [brandSubject, setBrandSubject] = useState("");

  const tabOptions = useMemo(() => getTabOptions(mode), [mode]);
  const listConfig = useMemo(() => getListQueryConfig(mode, activeTab), [mode, activeTab]);

  const {
    data: chatListData,
    loading: chatListLoading,
    error: chatListError,
    refetch: refetchChats,
  } = useQuery(listConfig.query, {
    variables: listConfig.variables,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const currentListResponse = (chatListData as any)?.[listConfig.dataKey];
  const rawChats = useMemo(
    () => ((currentListResponse?.list ?? EMPTY_CHATS) as ChatSummary[]),
    [currentListResponse]
  );

  useEffect(() => {
    if (!chatListData) return;
    setChatRows(rawChats);
  }, [chatListData, rawChats]);

  const filteredChats = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return chatRows;

    return chatRows.filter((chat) => {
      const haystack = [
        getDisplayName(chat, mode),
        getDisplayMeta(chat, mode),
        chat.lastMessageText,
        chat.chatSubject,
        chat.supportTopic,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [chatRows, mode, searchTerm]);

  useEffect(() => {
    if (!filteredChats.length) {
      setSelectedChatId("");
      return;
    }

    if (!selectedChatId || !filteredChats.some((item) => item._id === selectedChatId)) {
      setSelectedChatId(filteredChats[0]._id);
    }
  }, [filteredChats, selectedChatId]);

  const selectedChat = useMemo(
    () => filteredChats.find((item) => item._id === selectedChatId) ?? null,
    [filteredChats, selectedChatId]
  );

  const {
    data: messageData,
    loading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery(mode === "admin" ? GET_ALL_MESSAGES_BY_ADMIN : GET_MESSAGES, {
    variables: selectedChatId
      ? {
          input: {
            page: 1,
            limit: MESSAGE_LIMIT,
            direction: "ASC",
            conversationId: selectedChatId,
          },
        }
      : undefined,
    skip: !selectedChatId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const messages = useMemo(
    () =>
      (((messageData as any)?.[mode === "admin" ? "getAllMessagesByAdmin" : "getMessages"]?.list ??
        EMPTY_MESSAGES) as ChatMessage[]),
    [messageData, mode]
  );

  const { data: brandsData } = useQuery(GET_BRANDS, {
    skip: mode !== "user" || !brandDialogOpen,
    variables: {
      input: {
        page: 1,
        limit: 50,
        search: {},
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const availableBrands = useMemo(() => {
    const list = ((brandsData as any)?.getBrands?.brands ?? []) as any[];
    const keyword = brandSearch.trim().toLowerCase();
    if (!keyword) return list;
    return list.filter((brand) =>
      [brand.brandName, brand.memberData?.memberNick, brand.brandDesc].filter(Boolean).join(" ").toLowerCase().includes(keyword)
    );
  }, [brandsData, brandSearch]);

  const [openBrandChat, { loading: openingBrandChat }] = useMutation(OPEN_OR_GET_BRAND_CHAT);
  const [openSupportChat, { loading: openingSupportChat }] = useMutation(OPEN_OR_GET_SUPPORT_CHAT);
  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_CHAT_MESSAGE);
  const [markRead] = useMutation(MARK_CHAT_MESSAGES_AS_READ);
  const [claimSupportChat, { loading: claimingChat }] = useMutation(CLAIM_SUPPORT_CHAT);
  const [closeChat, { loading: closingChat }] = useMutation(CLOSE_CHAT);

  const requestedBrandId = mode === "user" ? searchParams.get("brandId")?.trim() || "" : "";
  const requestedSubject = mode === "user" ? searchParams.get("subject")?.trim() || "" : "";

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  const refetchAll = useCallback(async () => {
    const tasks: Promise<unknown>[] = [refetchChats()];
    if (selectedChatIdRef.current) tasks.push(refetchMessages());
    await Promise.all(tasks);
  }, [refetchChats, refetchMessages]);

  useEffect(() => {
    const socket = createChatSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      const token = getJwtToken();
      if (token) socket.emit("authenticate", { token });
      if (selectedChatIdRef.current) socket.emit("joinChat", { chatId: selectedChatIdRef.current });
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("newMessage", (payload) => {
      if (
        payload?.conversationId === selectedChatIdRef.current ||
        payload?.chatId === selectedChatIdRef.current
      ) {
        void refetchMessages();
      }
      void refetchChats();
    });

    socket.on("chatListUpdated", () => {
      void refetchChats();
    });

    socket.on("messagesRead", (payload) => {
      if (payload?.chatId === selectedChatIdRef.current) void refetchMessages();
      void refetchChats();
    });

    socket.on("chatClaimed", () => {
      void refetchAll();
    });

    socket.on("chatClosed", () => {
      void refetchAll();
    });

    socket.on("userTyping", (payload) => {
      if (!selectedChatIdRef.current || payload?.chatId !== selectedChatIdRef.current) return;
      if (payload?.memberId === user._id) return;
      setRemoteTyping("Typing...");
      if (remoteTypingTimer.current) clearTimeout(remoteTypingTimer.current);
      remoteTypingTimer.current = setTimeout(() => setRemoteTyping(""), 2000);
    });

    socket.on("userStopTyping", (payload) => {
      if (!selectedChatIdRef.current || payload?.chatId !== selectedChatIdRef.current) return;
      setRemoteTyping("");
    });

    return () => {
      if (selectedChatIdRef.current) socket.emit("leaveChat", { chatId: selectedChatIdRef.current });
      socket.disconnect();
      socketRef.current = null;
      if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
      if (remoteTypingTimer.current) clearTimeout(remoteTypingTimer.current);
    };
  }, [refetchAll, refetchChats, refetchMessages, user._id]);

  useEffect(() => {
    if (!socketRef.current || !socketConnected || !selectedChatId) return;
    socketRef.current.emit("joinChat", { chatId: selectedChatId });
    return () => {
      socketRef.current?.emit("leaveChat", { chatId: selectedChatId });
    };
  }, [selectedChatId, socketConnected]);

  useEffect(() => {
    if (socketConnected || !selectedChatId) return;
    const interval = window.setInterval(() => {
      void refetchAll();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [refetchAll, selectedChatId, socketConnected]);

  useEffect(() => {
    if (!selectedChat || !selectedChat.unreadCount) return;

    const key = `${selectedChat._id}:${messages.length}:${selectedChat.unreadCount}`;
    if (lastMarkedKeyRef.current === key) return;
    lastMarkedKeyRef.current = key;

    void markRead({ variables: { chatId: selectedChat._id } })
      .then(() => Promise.all([refetchChats(), refetchMessages()]))
      .catch(() => {});
  }, [markRead, messages.length, refetchChats, refetchMessages, selectedChat]);

  const handleSendMessage = useCallback(async () => {
    const content = messageInput.trim();
    if (!selectedChatId || !content) return;

    try {
      await sendMessage({
        variables: {
          input: {
            conversationId: selectedChatId,
            messageType: "TEXT",
            message: content,
          },
        },
      });

      setMessageInput("");
      socketRef.current?.emit("stopTyping", { chatId: selectedChatId });
      await Promise.all([refetchMessages(), refetchChats()]);
    } catch (error: any) {
      await sweetMixinErrorAlert(error.message || "Failed to send message");
    }
  }, [messageInput, refetchChats, refetchMessages, selectedChatId, sendMessage]);

  const handleInputTyping = useCallback(
    (value: string) => {
      setMessageInput(value);
      if (!selectedChatId || !socketConnected) return;

      if (value.trim()) {
        socketRef.current?.emit("typing", { chatId: selectedChatId });
        if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
        typingStopTimer.current = setTimeout(() => {
          socketRef.current?.emit("stopTyping", { chatId: selectedChatId });
        }, 1200);
      } else {
        socketRef.current?.emit("stopTyping", { chatId: selectedChatId });
      }
    },
    [selectedChatId, socketConnected]
  );

  const handleOpenBrandChat = useCallback(async () => {
    if (!selectedBrandId) return;

    try {
      const result = await openBrandChat({
        variables: {
          input: {
            brandId: selectedBrandId,
            chatSubject: brandSubject.trim() || undefined,
          },
        },
      });

      const chat = (result.data as any)?.openOrGetBrandChat as ChatSummary | undefined;
      await refetchChats();
      if (chat?._id) setSelectedChatId(chat._id);
      setBrandDialogOpen(false);
      setSelectedBrandId("");
      setBrandSubject("");
      setBrandSearch("");
      await sweetTopSmallSuccessAlert("Brand chat ready");
    } catch (error: any) {
      await sweetMixinErrorAlert(error.message || "Failed to open brand chat");
    }
  }, [brandSubject, openBrandChat, refetchChats, selectedBrandId]);

  const handleOpenSupportChat = useCallback(async () => {
    const initialMessage = supportInitialMessage.trim();
    if (!initialMessage) return;

    try {
      const result = await openSupportChat({
        variables: {
          input: {
            supportTopic: supportTopic.trim() || undefined,
            sourcePath: typeof window !== "undefined" ? window.location.pathname : undefined,
          },
        },
      });

      const chat = (result.data as any)?.openOrGetSupportChat as ChatSummary | undefined;
      if (chat?._id) {
        setActiveTab(mode === "admin" ? "user-support" : "support");
        setSelectedChatId(chat._id);
        await sendMessage({
          variables: {
            input: {
              conversationId: chat._id,
              messageType: "TEXT",
              message: initialMessage,
            },
          },
        });
      }

      setSupportDialogOpen(false);
      setSupportTopic("");
      setSupportInitialMessage("");
      await refetchChats();

      await sweetTopSmallSuccessAlert("Support chat opened");
    } catch (error: any) {
      await sweetMixinErrorAlert(error.message || "Failed to open support chat");
    }
  }, [mode, openSupportChat, refetchChats, sendMessage, supportInitialMessage, supportTopic]);

  const handleClaimChat = useCallback(async () => {
    if (!selectedChatId) return;
    try {
      await claimSupportChat({ variables: { chatId: selectedChatId } });
      await refetchAll();
      await sweetTopSmallSuccessAlert("Support chat claimed");
    } catch (error: any) {
      await sweetMixinErrorAlert(error.message || "Failed to claim chat");
    }
  }, [claimSupportChat, refetchAll, selectedChatId]);

  const handleCloseChat = useCallback(async () => {
    if (!selectedChatId) return;
    try {
      await closeChat({ variables: { chatId: selectedChatId } });
      await refetchAll();
      await sweetTopSmallSuccessAlert("Chat closed");
    } catch (error: any) {
      await sweetMixinErrorAlert(error.message || "Failed to close chat");
    }
  }, [closeChat, refetchAll, selectedChatId]);

  useEffect(() => {
    if (mode !== "user" || !requestedBrandId) return;
    if (handledOpenBrandRef.current === requestedBrandId) return;

    handledOpenBrandRef.current = requestedBrandId;

    (async () => {
      try {
        const result = await openBrandChat({
          variables: {
            input: {
              brandId: requestedBrandId,
              chatSubject: requestedSubject || undefined,
            },
          },
        });

        const chat = (result.data as any)?.openOrGetBrandChat as ChatSummary | undefined;
        setActiveTab("brand");
        if (chat?._id) setSelectedChatId(chat._id);
        await refetchChats();
      } catch (error: any) {
        await sweetMixinErrorAlert(error.message || "Failed to open brand chat");
      } finally {
        router.replace("/chat");
      }
    })();
  }, [mode, openBrandChat, refetchChats, requestedBrandId, requestedSubject, router]);

  const emptyText =
    mode === "user"
      ? activeTab === "brand"
        ? "No brand chats yet."
        : "No support chats yet."
      : mode === "brand"
        ? activeTab === "customers"
          ? "No customer chats yet."
          : "No support chats yet."
        : "No support chats yet.";

  const pageHeader =
    mode === "user" ? (
      <DashboardHeader title={getWorkspaceTitle(mode)} Icon={MarkChatUnreadOutlined} />
    ) : (
      <PageWrapper title={getWorkspaceTitle(mode)}>
        <></>
      </PageWrapper>
    );

  return (
    <Stack spacing={2}>
      {pageHeader}

      <Card sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          sx={{ mb: 2 }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 42 }}
          >
            {tabOptions.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
                sx={{ minHeight: 42 }}
              />
            ))}
          </Tabs>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              size="small"
              placeholder="Search chats"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {mode === "user" && activeTab === "brand" && (
              <Button variant="contained" startIcon={<AddCommentRounded />} onClick={() => setBrandDialogOpen(true)}>
                New Brand Chat
              </Button>
            )}

            {(mode === "user" || mode === "brand") && activeTab === "support" && (
              <Button variant="contained" startIcon={<SupportAgentRounded />} onClick={() => setSupportDialogOpen(true)}>
                Contact Support
              </Button>
            )}

            <Button variant="outlined" startIcon={<AutorenewRounded />} onClick={() => void refetchAll()}>
              Refresh
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "340px minmax(0, 1fr)" },
            gap: 2,
            minHeight: { xs: "auto", lg: 640 },
          }}
        >
          <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
            {chatListLoading && !chatRows.length ? (
              <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
                <CircularProgress size={26} />
              </Stack>
            ) : chatListError ? (
              <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240, p: 2 }}>
                <Typography color="error.main" textAlign="center">
                  Failed to load chats
                </Typography>
              </Stack>
            ) : filteredChats.length ? (
              <List disablePadding sx={{ maxHeight: { xs: "unset", lg: 640 }, overflowY: "auto" }}>
                {filteredChats.map((chat, index) => (
                  <Box key={chat._id}>
                    <ListItemButton
                      selected={chat._id === selectedChatId}
                      onClick={() => setSelectedChatId(chat._id)}
                      sx={{ alignItems: "flex-start", py: 1.5, px: 1.5 }}
                    >
                      <Badge
                        color="primary"
                        badgeContent={chat.unreadCount}
                        invisible={!chat.unreadCount}
                        overlap="circular"
                        sx={{ mr: 1.5 }}
                      >
                        <Avatar src={getDisplayAvatar(chat, mode)} />
                      </Badge>

                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" spacing={1}>
                            <Typography variant="subtitle2" noWrap>
                              {getDisplayName(chat, mode)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatRelativeDate(chat.lastMessageAt || chat.updatedAt)}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {getDisplayMeta(chat, mode)}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {chat.lastMessageText || "No messages yet."}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItemButton>
                    {index < filteredChats.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            ) : (
              <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ minHeight: 240, p: 3 }}>
                <ForumOutlined color="disabled" />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {emptyText}
                </Typography>
              </Stack>
            )}
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              minHeight: { xs: 420, lg: 640 },
              overflow: "hidden",
            }}
          >
            {selectedChat ? (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                  sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                    <Avatar src={getDisplayAvatar(selectedChat, mode)} />
                    <Box minWidth={0}>
                      <Typography variant="subtitle1" noWrap>
                        {getDisplayName(selectedChat, mode)}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip
                          size="small"
                          label={selectedChat.chatScope === "ADMIN_SUPPORT" ? "Support" : "Direct"}
                          color={selectedChat.chatScope === "ADMIN_SUPPORT" ? "secondary" : "primary"}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={selectedChat.chatStatus}
                          color={selectedChat.chatStatus === "OPEN" ? "success" : selectedChat.chatStatus === "PENDING" ? "warning" : "default"}
                        />
                        {!socketConnected && <Chip size="small" label="Polling" variant="outlined" />}
                      </Stack>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    {mode === "admin" &&
                      selectedChat.chatScope === "ADMIN_SUPPORT" &&
                      !selectedChat.assignedAdminId &&
                      selectedChat.chatStatus !== "CLOSED" && (
                        <Button variant="contained" onClick={handleClaimChat} disabled={claimingChat}>
                          Claim
                        </Button>
                      )}

                    {selectedChat.chatStatus !== "CLOSED" && (
                      <Button variant="outlined" color="inherit" onClick={handleCloseChat} disabled={closingChat}>
                        Close
                      </Button>
                    )}
                  </Stack>
                </Stack>

                <Box sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "grey.50" }}>
                  {messagesLoading && !messages.length ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 220 }}>
                      <CircularProgress size={24} />
                    </Stack>
                  ) : messagesError ? (
                    <Typography color="error.main">Failed to load messages.</Typography>
                  ) : messages.length ? (
                    <Stack spacing={1.25}>
                      {messages.map((message) => {
                        const own = message.isOwnMessage;
                        return (
                          <Stack key={message._id} alignItems={own ? "flex-end" : "flex-start"}>
                            <Box
                              sx={{
                                px: 1.5,
                                py: 1.1,
                                maxWidth: "78%",
                                borderRadius: 2.5,
                                bgcolor: own ? "primary.main" : "background.paper",
                                color: own ? "primary.contrastText" : "text.primary",
                                boxShadow: own ? "none" : 1,
                              }}
                            >
                              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                {message.message || (message.attachments?.length ? "[Attachment]" : "")}
                              </Typography>

                              {message.attachments?.length ? (
                                <Stack spacing={0.5} sx={{ mt: message.message ? 1 : 0 }}>
                                  {message.attachments.map((attachment) => (
                                    <Typography key={attachment} variant="caption" sx={{ wordBreak: "break-all" }}>
                                      {attachment}
                                    </Typography>
                                  ))}
                                </Stack>
                              ) : null}
                            </Box>

                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                              {formatThreadTime(message.createdAt)}
                            </Typography>
                          </Stack>
                        );
                      })}

                      {remoteTyping && (
                        <Typography variant="caption" color="text.secondary">
                          {remoteTyping}
                        </Typography>
                      )}
                    </Stack>
                  ) : (
                    <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ minHeight: 220 }}>
                      <MarkChatUnreadOutlined color="disabled" />
                      <Typography variant="body2" color="text.secondary">
                        No messages yet. Start the conversation.
                      </Typography>
                    </Stack>
                  )}
                </Box>

                <Divider />

                <Stack direction="row" spacing={1} sx={{ p: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder={
                      selectedChat.canReply
                        ? "Write a message"
                        : selectedChat.chatStatus === "CLOSED"
                          ? "This chat is closed"
                          : "Claim this support chat to reply"
                    }
                    value={messageInput}
                    onChange={(event) => handleInputTyping(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    disabled={!selectedChat.canReply || sendingMessage}
                  />

                  <Button
                    variant="contained"
                    onClick={() => void handleSendMessage()}
                    disabled={!selectedChat.canReply || !messageInput.trim() || sendingMessage}
                    sx={{ minWidth: 48, px: 2 }}
                  >
                    <SendRounded fontSize="small" />
                  </Button>
                </Stack>
              </>
            ) : (
              <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ flex: 1, p: 4 }}>
                <ForumOutlined color="disabled" sx={{ fontSize: 34 }} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Select a chat to open the thread.
                </Typography>
              </Stack>
            )}
          </Card>
        </Box>
      </Card>

      <Dialog open={brandDialogOpen} onClose={() => setBrandDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start Brand Chat</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              size="small"
              label="Search brands"
              value={brandSearch}
              onChange={(event) => setBrandSearch(event.target.value)}
            />

            <Card variant="outlined" sx={{ maxHeight: 320, overflowY: "auto" }}>
              <List disablePadding>
                {availableBrands.map((brand) => (
                  <ListItemButton
                    key={brand._id}
                    selected={selectedBrandId === brand._id}
                    onClick={() => setSelectedBrandId(brand._id)}
                  >
                    <Avatar
                      src={resolveImage(brand.memberData?.memberImage || brand.brandLogo, brand.brandName)}
                      sx={{ mr: 1.5 }}
                    />
                    <ListItemText
                      primary={brand.brandName}
                      secondary={brand.brandDesc || brand.memberData?.memberNick || "Brand"}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Card>

            <TextField
              size="small"
              label="Subject (optional)"
              value={brandSubject}
              onChange={(event) => setBrandSubject(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBrandDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleOpenBrandChat()} disabled={!selectedBrandId || openingBrandChat}>
            Start Chat
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={supportDialogOpen} onClose={() => setSupportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Bazaar Support</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              size="small"
              label="Topic"
              value={supportTopic}
              onChange={(event) => setSupportTopic(event.target.value)}
            />
            <TextField
              multiline
              minRows={4}
              label="Initial message"
              value={supportInitialMessage}
              onChange={(event) => setSupportInitialMessage(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupportDialogOpen(false)} startIcon={<CloseRounded />}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleOpenSupportChat()}
            disabled={!supportInitialMessage.trim() || openingSupportChat}
          >
            Open Support Chat
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

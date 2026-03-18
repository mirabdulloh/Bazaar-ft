"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client/react";
import type { Socket } from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
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
import useMediaQuery from "@mui/material/useMediaQuery";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import MarkChatUnreadOutlined from "@mui/icons-material/MarkChatUnreadOutlined";
import SearchRounded from "@mui/icons-material/SearchRounded";
import SupportAgentRounded from "@mui/icons-material/SupportAgentRounded";
import StorefrontRounded from "@mui/icons-material/StorefrontRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import AddCommentRounded from "@mui/icons-material/AddCommentRounded";
import AutorenewRounded from "@mui/icons-material/AutorenewRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import ImageRounded from "@mui/icons-material/ImageRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import DoneRounded from "@mui/icons-material/DoneRounded";
import DoneAllRounded from "@mui/icons-material/DoneAllRounded";
import ReplyRounded from "@mui/icons-material/ReplyRounded";
import ImageOutlined from "@mui/icons-material/ImageOutlined";
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
  GET_CHAT_PRESENCE,
  GET_MESSAGES,
  GET_MY_CHATS,
  GET_MY_SUPPORT_CHATS,
} from "../../../apollo/chat/query";
import { createChatSocket } from "lib/chat/socket";
import { getJwtToken, getRefreshToken, setJwtToken, setRefreshToken, setUserFromMemberData } from "lib/auth";
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
  readByMemberIds?: string[] | null;
  isReadByMe: boolean;
  isOwnMessage: boolean;
  createdAt: string;
  senderData?: any;
  replyToId?: string | null;
  parentMessageData?: {
    _id: string;
    senderId: string;
    senderType: string;
    messageType: "TEXT" | "IMAGE" | "FILE";
    message?: string | null;
    attachments?: string[] | null;
    createdAt: string;
  } | null;
};

type ChatPresence = {
  targetMemberId?: string | null;
  isOnline: boolean;
  lastActiveAt?: string | null;
};

type PendingImage = {
  file: File;
  previewUrl: string;
  name: string;
};

type JwtPayload = { exp?: number };

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

function formatLastSeen(date?: string | null): string {
  if (!date) return "Offline";
  const target = new Date(date);
  const diffMs = Date.now() - target.getTime();
  const diffMin = Math.max(1, Math.round(diffMs / 60000));

  if (diffMin < 60) return `Last seen ${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `Last seen ${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `Last seen ${diffDay}d ago`;
  return `Last seen ${target.toLocaleDateString()}`;
}

function formatMessageTime(date: string): string {
  return new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatMessageDay(date: string): string {
  const target = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (target.toDateString() === today.toDateString()) return "Today";
  if (target.toDateString() === yesterday.toDateString()) return "Yesterday";

  return target.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: target.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function isSameCalendarDay(first?: string | null, second?: string | null): boolean {
  if (!first || !second) return false;
  return new Date(first).toDateString() === new Date(second).toDateString();
}

function isWithinGroupWindow(first?: string | null, second?: string | null): boolean {
  if (!first || !second) return false;
  return Math.abs(new Date(second).getTime() - new Date(first).getTime()) <= 5 * 60 * 1000;
}

function shouldGroupMessages(previous: ChatMessage | null, current: ChatMessage): boolean {
  if (!previous) return false;
  return (
    previous.senderId === current.senderId &&
    previous.isOwnMessage === current.isOwnMessage &&
    isSameCalendarDay(previous.createdAt, current.createdAt) &&
    isWithinGroupWindow(previous.createdAt, current.createdAt)
  );
}

function isMessageReadByPeer(message: ChatMessage): boolean {
  return Boolean(message.isOwnMessage && (message.readByMemberIds?.length ?? 0) > 1);
}

function getQuotedSenderLabel(message: ChatMessage | null | undefined, viewerId?: string): string {
  if (!message) return "";
  if (message.senderId === viewerId) return "You";
  if (message.senderData?.memberNick || message.senderData?.memberFullName) {
    return message.senderData?.memberNick || message.senderData?.memberFullName;
  }
  if (message.senderType === "ADMIN") return "Support";
  if (message.senderType === "BRAND") return "Brand";
  return "Customer";
}

function getQuotedMessagePreview(message: ChatMessage | null | undefined): string {
  if (!message) return "";
  if (message.message?.trim()) return message.message.trim();
  if (message.messageType === "IMAGE" || message.attachments?.length) return "Image";
  if (message.messageType === "FILE") return "File";
  return "Message";
}

function isTokenExpiringSoon(token?: string, skewMs = 30_000): boolean {
  if (!token) return true;
  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (!payload.exp) return true;
    return payload.exp * 1000 <= Date.now() + skewMs;
  } catch {
    return true;
  }
}

async function getValidToken(): Promise<string> {
  const currentToken = getJwtToken();
  if (currentToken && !isTokenExpiringSoon(currentToken)) return currentToken;

  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("Session expired. Please log in again.");

  const res = await fetch(process.env.NEXT_PUBLIC_API_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `mutation RefreshToken($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
          _id memberType memberStatus memberAuthType memberPhone memberNick
          memberFullName memberEmail memberImage memberAddress memberDesc
          memberArticles memberFollowers memberFollowings memberPoints
          memberLikes memberViews memberComments memberRank memberWarnings
          memberBlocks memberProducts accessToken refreshToken
        }
      }`,
      variables: { refreshToken },
    }),
  });

  const json = await res.json();
  const data = json?.data?.refreshToken;
  if (!data?.accessToken) throw new Error("Session expired. Please log in again.");

  setJwtToken(data.accessToken);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
  setUserFromMemberData(data);

  return data.accessToken;
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
  const theme = useTheme();
  const isMobileLayout = useMediaQuery(theme.breakpoints.down("md"));
  const socketRef = useRef<Socket | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMarkedKeyRef = useRef<string>("");
  const selectedChatIdRef = useRef<string>("");
  const handledOpenBrandRef = useRef<string>("");
  const handledSelectChatRef = useRef<string>("");

  const [activeTab, setActiveTab] = useState<ChatTab>(getInitialTab(mode));
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");
  const [chatRows, setChatRows] = useState<ChatSummary[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [supportTopic, setSupportTopic] = useState("");
  const [supportInitialMessage, setSupportInitialMessage] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [brandSubject, setBrandSubject] = useState("");
  const requestedBrandId = mode === "user" ? searchParams.get("brandId")?.trim() || "" : "";
  const requestedSubject = mode === "user" ? searchParams.get("subject")?.trim() || "" : "";
  const requestedChatId = searchParams.get("chatId")?.trim() || "";
  const requestedTab = searchParams.get("tab")?.trim() || "";
  const workspaceHref = mode === "admin" ? "/admin/chats" : mode === "brand" ? "/brand/chats" : "/chat";

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
      setSelectedChatId((prev) => {
        if (isMobileLayout) return prev && filteredChats.some((item) => item._id === prev) ? prev : "";
        return filteredChats[0]._id;
      });
    }
  }, [filteredChats, isMobileLayout, selectedChatId]);

  useEffect(() => {
    if (!requestedChatId || !filteredChats.length) return;
    if (handledSelectChatRef.current === requestedChatId) return;

    const requestedChatExists = filteredChats.some((chat) => chat._id === requestedChatId);
    if (!requestedChatExists) return;

    handledSelectChatRef.current = requestedChatId;
    setSelectedChatId(requestedChatId);
    router.replace(workspaceHref);
  }, [filteredChats, requestedChatId, router, workspaceHref]);

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

  const { data: presenceData } = useQuery(GET_CHAT_PRESENCE, {
    variables: selectedChatId ? { chatId: selectedChatId } : undefined,
    skip: !selectedChatId,
    fetchPolicy: "cache-and-network",
    pollInterval: 20000,
  });

  const chatPresence = useMemo(
    () => (((presenceData as any)?.getChatPresence ?? null) as ChatPresence | null),
    [presenceData]
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

  useEffect(() => {
    if (!requestedTab) return;
    const hasTab = tabOptions.some((tab) => tab.value === requestedTab);
    if (!hasTab) return;
    if (activeTab !== requestedTab) setActiveTab(requestedTab as ChatTab);
  }, [activeTab, requestedTab, tabOptions]);

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    setReplyTarget(null);
    setMessageInput("");
  }, [selectedChatId]);

  useEffect(() => {
    return () => {
      if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl);
    };
  }, [pendingImage?.previewUrl]);

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
      setSocketReady(false);
      const token = getJwtToken();
      if (token) socket.emit("authenticate", { token });
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
      setSocketReady(false);
    });

    socket.on("authenticated", () => {
      setSocketReady(true);
      if (selectedChatIdRef.current) {
        socket.emit("joinChat", { chatId: selectedChatIdRef.current });
      }
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
    if (!socketRef.current || !socketReady || !selectedChatId) return;
    socketRef.current.emit("joinChat", { chatId: selectedChatId });
    return () => {
      socketRef.current?.emit("leaveChat", { chatId: selectedChatId });
    };
  }, [selectedChatId, socketReady]);

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

  useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport || !selectedChatId) return;

    const scrollToBottom = () => {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: messages.length > 1 ? "smooth" : "auto",
      });
    };

    if (typeof window !== "undefined") {
      window.requestAnimationFrame(scrollToBottom);
    } else {
      scrollToBottom();
    }
  }, [messages.length, remoteTyping, selectedChatId]);

  const uploadChatImage = useCallback(async (file: File): Promise<string> => {
    const token = await getValidToken();
    const formData = new FormData();
    formData.append(
      "operations",
      JSON.stringify({
        query: `mutation ImageUploader($file: Upload!, $target: String!) {
          imageUploader(file: $file, target: $target)
        }`,
        variables: {
          file: null,
          target: "chat",
        },
      })
    );
    formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
    formData.append("0", file);

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "apollo-require-preflight": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    const uploaded = response.data?.data?.imageUploader;
    if (!uploaded) throw new Error("Image upload failed");
    return uploaded;
  }, []);

  const clearPendingImage = useCallback(() => {
    setPendingImage((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
  }, []);

  const handleSendMessage = useCallback(async () => {
    const content = messageInput.trim();
    if (!selectedChatId || (!content && !pendingImage)) return;

    try {
      setUploadingImage(Boolean(pendingImage));
      const attachment = pendingImage ? await uploadChatImage(pendingImage.file) : null;
      await sendMessage({
        variables: {
          input: {
            conversationId: selectedChatId,
            messageType: attachment ? "IMAGE" : "TEXT",
            message: content || undefined,
            attachments: attachment ? [attachment] : undefined,
            replyToId: replyTarget?._id,
          },
        },
      });

      setMessageInput("");
      setReplyTarget(null);
      clearPendingImage();
      if (selectedChatIdRef.current) socketRef.current?.emit("stopTyping", { chatId: selectedChatIdRef.current });
      await Promise.all([refetchMessages(), refetchChats()]);
    } catch (error: any) {
      await sweetMixinErrorAlert(error.message || "Failed to send message");
    } finally {
      setUploadingImage(false);
    }
  }, [clearPendingImage, messageInput, pendingImage, refetchChats, refetchMessages, replyTarget?._id, selectedChatId, sendMessage, uploadChatImage]);

  const handleInputTyping = useCallback(
    (value: string) => {
      setMessageInput(value);
      if (!selectedChatId || !socketReady) return;

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
    [selectedChatId, socketReady]
  );

  const handlePickImage = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    clearPendingImage();
    setPendingImage({
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    });
  }, [clearPendingImage]);

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
        router.replace(workspaceHref);
      }
    })();
  }, [mode, openBrandChat, refetchChats, requestedBrandId, requestedSubject, router, workspaceHref]);

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

  const showListPane = !isMobileLayout || !selectedChat;
  const showThreadPane = !isMobileLayout || Boolean(selectedChat);
  const workspaceHeight = isMobileLayout ? "min(72dvh, 680px)" : "min(78dvh, 760px)";
  const presenceText = useMemo(() => {
    if (!selectedChat) return "";
    if (selectedChat.chatScope === "ADMIN_SUPPORT" && mode !== "admin" && !selectedChat.assignedAdminId) {
      return "Waiting for support agent";
    }

    if (chatPresence?.isOnline) return "Online";
    return formatLastSeen(chatPresence?.lastActiveAt);
  }, [chatPresence?.isOnline, chatPresence?.lastActiveAt, mode, selectedChat]);

  return (
    <Stack spacing={2}>
      {pageHeader}

      <Card
        sx={{
          p: { xs: 1.25, md: 2 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
          overflow: "hidden",
        }}
      >
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
            height: workspaceHeight,
            minHeight: workspaceHeight,
          }}
        >
          {showListPane && (
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              height: "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              bgcolor: "rgba(255,255,255,0.82)",
              borderColor: "rgba(148, 163, 184, 0.28)",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
              backdropFilter: "blur(10px)",
            }}
          >
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
              <List
                disablePadding
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  px: 0.5,
                  py: 0.75,
                  scrollBehavior: "smooth",
                  "&::-webkit-scrollbar": { width: 8 },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(148,163,184,0.4)",
                    borderRadius: 999,
                  },
                }}
              >
                {filteredChats.map((chat, index) => (
                  <Box key={chat._id}>
                    <ListItemButton
                      selected={chat._id === selectedChatId}
                      onClick={() => setSelectedChatId(chat._id)}
                      sx={{
                        alignItems: "flex-start",
                        py: { xs: 1.25, md: 1.5 },
                        px: { xs: 1.25, md: 1.5 },
                        mx: 1,
                        my: 0.5,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: chat._id === selectedChatId ? "primary.light" : "transparent",
                        bgcolor: chat._id === selectedChatId ? "rgba(37,99,235,0.08)" : "transparent",
                        boxShadow: chat._id === selectedChatId ? "0 10px 24px rgba(37, 99, 235, 0.10)" : "none",
                        transition: "all 160ms ease",
                        "&:hover": {
                          bgcolor: chat._id === selectedChatId ? "rgba(37,99,235,0.08)" : "rgba(15,23,42,0.03)",
                        },
                      }}
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
                        disableTypography
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
                    {index < filteredChats.length - 1 && <Divider sx={{ mx: 2 }} />}
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
          )}

          {showThreadPane && (
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              height: "100%",
              overflow: "hidden",
              bgcolor: "rgba(255,255,255,0.88)",
              borderColor: "rgba(148, 163, 184, 0.28)",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
              backdropFilter: "blur(10px)",
            }}
          >
            {selectedChat ? (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                  sx={{
                    p: { xs: 1.25, sm: 2 },
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "rgba(248,250,252,0.9)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
                    {isMobileLayout && (
                      <IconButton
                        size="small"
                        onClick={() => setSelectedChatId("")}
                        sx={{ mt: { xs: 0.25, sm: 0 } }}
                      >
                        <ArrowBackRounded fontSize="small" />
                      </IconButton>
                    )}
                    <Avatar src={getDisplayAvatar(selectedChat, mode)} />
                    <Box minWidth={0}>
                      <Typography variant="subtitle1" noWrap={!isMobileLayout}>
                        {getDisplayName(selectedChat, mode)}
                      </Typography>
                      <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.2, mb: 0.75 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: chatPresence?.isOnline ? "success.main" : "grey.400",
                            boxShadow: chatPresence?.isOnline ? "0 0 0 4px rgba(34,197,94,0.16)" : "none",
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="caption"
                          color={chatPresence?.isOnline ? "success.main" : "text.secondary"}
                          sx={{ fontWeight: chatPresence?.isOnline ? 600 : 500 }}
                        >
                          {presenceText}
                        </Typography>
                      </Stack>
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

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
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

                <Box
                  ref={messagesViewportRef}
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    p: { xs: 1.5, md: 2 },
                    bgcolor: "#f7f9fc",
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(99,115,129,0.08) 1px, transparent 0)",
                    backgroundSize: "18px 18px",
                    scrollBehavior: "smooth",
                    "&::-webkit-scrollbar": { width: 8 },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(148,163,184,0.4)",
                      borderRadius: 999,
                    },
                  }}
                >
                  {messagesLoading && !messages.length ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 220 }}>
                      <CircularProgress size={24} />
                    </Stack>
                  ) : messagesError ? (
                    <Typography color="error.main">Failed to load messages.</Typography>
                  ) : messages.length ? (
                    <Stack spacing={1.25}>
                      {messages.map((message, index) => {
                        const previousMessage = index > 0 ? messages[index - 1] : null;
                        const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
                        const own = message.isOwnMessage;
                        const readByPeer = isMessageReadByPeer(message);
                        const showDateSeparator = !previousMessage || !isSameCalendarDay(previousMessage.createdAt, message.createdAt);
                        const groupedWithPrevious = shouldGroupMessages(previousMessage, message);
                        const groupedWithNext = nextMessage ? shouldGroupMessages(message, nextMessage) : false;
                        const attachment = message.attachments?.[0];
                        const attachmentSrc = attachment ? resolveImage(attachment, "attachment") : "";
                        return (
                          <Stack
                            key={message._id}
                            alignItems={own ? "flex-end" : "flex-start"}
                            spacing={0.45}
                            sx={{ pt: showDateSeparator ? 0.5 : 0, mt: groupedWithPrevious ? 0.25 : 0.9 }}
                          >
                            {showDateSeparator && (
                              <Stack alignItems="center" sx={{ width: "100%", pb: 0.5 }}>
                                <Box
                                  sx={{
                                    px: 1.25,
                                    py: 0.4,
                                    borderRadius: 999,
                                    bgcolor: "rgba(15,23,42,0.06)",
                                    border: "1px solid",
                                    borderColor: "divider",
                                  }}
                                >
                                  <Typography variant="caption" color="text.secondary">
                                    {formatMessageDay(message.createdAt)}
                                  </Typography>
                                </Box>
                              </Stack>
                            )}

                            <Box
                              sx={{
                                px: 1.5,
                                py: 1.1,
                                maxWidth: { xs: "88%", sm: "82%", md: "78%" },
                                borderRadius: 2.5,
                                bgcolor: own ? "primary.main" : "background.paper",
                                color: own ? "primary.contrastText" : "text.primary",
                                boxShadow: own ? "none" : 1,
                                borderTopRightRadius: own ? (groupedWithPrevious ? 1 : 0.75) : 2.5,
                                borderTopLeftRadius: own ? 2.5 : groupedWithPrevious ? 1 : 0.75,
                                borderBottomRightRadius: own ? (groupedWithNext ? 1 : 2.5) : 2.5,
                                borderBottomLeftRadius: own ? 2.5 : groupedWithNext ? 1 : 2.5,
                              }}
                            >
                              {message.parentMessageData ? (
                                <Box
                                  sx={{
                                    mb: message.message || attachmentSrc ? 0.7 : 0,
                                    px: 0.95,
                                    py: 0.6,
                                    borderRadius: 1.75,
                                    borderLeft: "2px solid",
                                    borderLeftColor: own ? "rgba(255,255,255,0.72)" : "primary.light",
                                    bgcolor: own ? "rgba(255,255,255,0.10)" : "rgba(37,99,235,0.05)",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: "block",
                                      fontWeight: 700,
                                      lineHeight: 1.15,
                                      color: own ? "inherit" : "primary.main",
                                    }}
                                  >
                                    {getQuotedSenderLabel(message.parentMessageData as ChatMessage, user._id)}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: "-webkit-box",
                                      mt: 0.15,
                                      lineHeight: 1.2,
                                      color: own ? "rgba(255,255,255,0.86)" : "text.secondary",
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {getQuotedMessagePreview(message.parentMessageData as ChatMessage)}
                                  </Typography>
                                </Box>
                              ) : null}

                              {message.message ? (
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                  {message.message}
                                </Typography>
                              ) : null}

                              {attachmentSrc ? (
                                <Box
                                  component="img"
                                  src={attachmentSrc}
                                  alt="chat attachment"
                                  sx={{
                                    mt: message.message ? 1 : 0,
                                    display: "block",
                                    width: "100%",
                                    maxWidth: { xs: 220, sm: 280 },
                                    maxHeight: { xs: 240, sm: 320 },
                                    objectFit: "cover",
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: own ? "rgba(255,255,255,0.35)" : "divider",
                                  }}
                                />
                              ) : null}
                            </Box>

                            {!groupedWithNext && (
                              <Stack
                                direction="row"
                                spacing={0.25}
                                alignItems="center"
                                sx={{ mt: 0.1, px: 0.25, color: own && readByPeer ? "primary.main" : "text.secondary" }}
                              >
                                <Typography variant="caption" color="inherit">
                                  {formatMessageTime(message.createdAt)}
                                </Typography>
                                {own &&
                                  (readByPeer ? (
                                    <DoneAllRounded sx={{ fontSize: 14 }} />
                                  ) : (
                                    <DoneRounded sx={{ fontSize: 14, opacity: 0.9 }} />
                                  ))}
                                <IconButton
                                  size="small"
                                  onClick={() => setReplyTarget(message)}
                                  sx={{
                                    ml: 0.2,
                                    width: 24,
                                    height: 24,
                                    color: "inherit",
                                    opacity: 0.72,
                                    bgcolor: own ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.04)",
                                    "&:hover": {
                                      opacity: 1,
                                      bgcolor: own ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.08)",
                                    },
                                  }}
                                >
                                  <ReplyRounded sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Stack>
                            )}
                          </Stack>
                        );
                      })}

                      {remoteTyping && (
                        <Stack alignItems="flex-start" sx={{ pt: 0.5 }}>
                          <Box
                            sx={{
                              px: 1.2,
                              py: 0.7,
                              borderRadius: 999,
                              bgcolor: "rgba(255,255,255,0.92)",
                              border: "1px solid",
                              borderColor: "divider",
                              boxShadow: "0 8px 18px rgba(15,23,42,0.06)",
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {remoteTyping}
                            </Typography>
                          </Box>
                        </Stack>
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

                <Stack
                  direction="column"
                  spacing={1}
                  sx={{
                    p: { xs: 1, sm: 1.5 },
                    bgcolor: "rgba(255,255,255,0.96)",
                    borderTop: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 -10px 30px rgba(15,23,42,0.04)",
                  }}
                >
                  {(replyTarget || pendingImage) && (
                    <Stack spacing={0.85}>
                      {replyTarget && (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{
                            px: 1.05,
                            py: 0.75,
                            borderRadius: 2.5,
                            bgcolor: "rgba(248,250,252,0.96)",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Stack
                            spacing={0.15}
                            minWidth={0}
                            flex={1}
                            sx={{
                              pl: 1,
                              borderLeft: "2px solid",
                              borderLeftColor: "primary.light",
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", lineHeight: 1.15 }}>
                              Replying to {getQuotedSenderLabel(replyTarget, user._id)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: 1.2,
                              }}
                            >
                              {getQuotedMessagePreview(replyTarget)}
                            </Typography>
                          </Stack>

                          <IconButton size="small" onClick={() => setReplyTarget(null)} sx={{ flexShrink: 0 }}>
                            <CloseRounded fontSize="small" />
                          </IconButton>
                        </Stack>
                      )}

                      {pendingImage && (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{
                            px: 1.1,
                            py: 0.95,
                            borderRadius: 3,
                            bgcolor: "rgba(248,250,252,0.96)",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center" minWidth={0} flex={1}>
                            <Box
                              component="img"
                              src={pendingImage.previewUrl}
                              alt={pendingImage.name}
                              sx={{
                                width: 46,
                                height: 46,
                                objectFit: "cover",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                flexShrink: 0,
                              }}
                            />
                            <Stack minWidth={0}>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                Image ready to send
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                              >
                                {pendingImage.name}
                              </Typography>
                            </Stack>
                          </Stack>

                          <IconButton size="small" onClick={() => clearPendingImage()} sx={{ flexShrink: 0 }}>
                            <CloseRounded fontSize="small" />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>
                  )}

                  <Stack direction="row" spacing={1} alignItems="flex-end">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    hidden
                    onChange={(event) => void handlePickImage(event)}
                  />

                  <IconButton
                    color="primary"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={!selectedChat.canReply || uploadingImage}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "rgba(248,250,252,0.96)",
                      flexShrink: 0,
                      width: 46,
                      height: 46,
                    }}
                  >
                    {pendingImage ? <ImageOutlined fontSize="small" /> : <ImageRounded fontSize="small" />}
                  </IconButton>

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
                    disabled={!selectedChat.canReply || sendingMessage || uploadingImage}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: "rgba(248,250,252,0.96)",
                        alignItems: "flex-end",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                      },
                    }}
                  />

                  <Button
                    variant="contained"
                    onClick={() => void handleSendMessage()}
                    disabled={!selectedChat.canReply || (!messageInput.trim() && !pendingImage) || sendingMessage || uploadingImage}
                    sx={{
                      minWidth: { xs: 46, sm: 48 },
                      px: { xs: 1.5, sm: 2 },
                      height: 56,
                      borderRadius: 3,
                      flexShrink: 0,
                      boxShadow: "0 12px 24px rgba(37, 99, 235, 0.24)",
                    }}
                  >
                    {uploadingImage ? <CircularProgress size={18} color="inherit" /> : <SendRounded fontSize="small" />}
                  </Button>
                  </Stack>
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
          )}
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

"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { userVar } from "../../../apollo/store";
import { GET_MESSAGES } from "../../../apollo/user/query";
import { OPEN_OR_GET_CHAT, SEND_MESSAGE } from "../../../apollo/user/mutation";
import { CustomJwtPayload } from "lib/types/customJwtPayload";
import { T } from "lib/types/common";
import { useSocket } from "providers/SocketProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatScreen = "brands" | "chat";

interface ChatContextValue {
  // Widget open/close
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;

  // Support chat widget
  isSupportOpen: boolean;
  openSupport: () => void;
  closeSupport: () => void;

  // Current navbar chat session
  screen: ChatScreen;
  conversationId: string;
  localMessages: T[];
  openingChat: boolean;

  // Actions
  openBrandChat: (brandId: string) => Promise<void>;
  sendNavbarMessage: (text: string) => Promise<void>;
  goBackToBrands: () => void;
}

// ─── Session storage helpers ──────────────────────────────────────────────────

function ssGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return sessionStorage.getItem(key); } catch { return null; }
}
function ssSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(key, value); } catch { /* noop */ }
}
function ssClearAll() {
  if (typeof window === "undefined") return;
  ["chat_isOpen", "chat_screen", "chat_convId"].forEach((k) => {
    try { sessionStorage.removeItem(k); } catch { /* noop */ }
  });
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextValue>({
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  isSupportOpen: false,
  openSupport: () => {},
  closeSupport: () => {},
  screen: "brands",
  conversationId: "",
  localMessages: [],
  openingChat: false,
  openBrandChat: async () => {},
  sendNavbarMessage: async () => {},
  goBackToBrands: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: PropsWithChildren) {
  const user = useReactiveVar(userVar) as CustomJwtPayload;
  const isLoggedIn = !!user?._id;

  const { on } = useSocket();

  // ── Widget state (hydrated from sessionStorage)
  const [isOpen, setIsOpen] = useState(() => ssGet("chat_isOpen") === "true");
  const [screen, setScreen] = useState<ChatScreen>(
    () => (ssGet("chat_screen") as ChatScreen) ?? "brands"
  );
  const [conversationId, setConversationId] = useState(
    () => ssGet("chat_convId") ?? ""
  );
  const [localMessages, setLocalMessages] = useState<T[]>([]);
  const [openingChat, setOpeningChat] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // ── Apollo mutations
  const [openOrGetChatMutation] = useMutation(OPEN_OR_GET_CHAT);
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  // ── Fetch messages for the active conversation (runs when conversationId is set)
  const { data: messagesData } = useQuery(GET_MESSAGES, {
    skip: !conversationId || screen !== "chat",
    fetchPolicy: "network-only",
    variables: {
      input: { page: 1, limit: 100, conversationId, direction: "ASC" },
    },
  });

  useEffect(() => {
    if (!messagesData) return;
    const list: T[] = (messagesData as T)?.getMessages?.list ?? [];
    setLocalMessages(list);
  }, [messagesData]);

  // ── Persist widget state to sessionStorage
  useEffect(() => { ssSet("chat_isOpen", String(isOpen)); }, [isOpen]);
  useEffect(() => { ssSet("chat_screen", screen); }, [screen]);
  useEffect(() => { ssSet("chat_convId", conversationId); }, [conversationId]);

  // ── Clear session on logout
  useEffect(() => {
    if (!isLoggedIn) {
      ssClearAll();
      setIsOpen(false);
      setIsSupportOpen(false);
      setScreen("brands");
      setConversationId("");
      setLocalMessages([]);
    }
  }, [isLoggedIn]);

  // ── WebSocket: append incoming messages only for the active conversation
  const conversationIdRef = useRef(conversationId);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    return on<T>("newMessage", (msg) => {
      const incoming = String(msg.conversationId ?? "");
      if (!incoming || incoming !== conversationIdRef.current) return;
      setLocalMessages((prev) => {
        if (prev.some((m: T) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    });
  }, [on]);

  // ─── Actions ─────────────────────────────────────────────────────────────

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const openSupport = useCallback(() => setIsSupportOpen(true), []);
  const closeSupport = useCallback(() => setIsSupportOpen(false), []);

  const goBackToBrands = useCallback(() => {
    setScreen("brands");
    setConversationId("");
    setLocalMessages([]);
  }, []);

  const openBrandChat = useCallback(
    async (brandId: string) => {
      if (!brandId || !isLoggedIn) return;
      setOpeningChat(true);
      try {
        const res = await openOrGetChatMutation({
          variables: { input: { brandId, chatSubject: "Chat" } },
        });
        const chatId = String((res?.data as T)?.openOrGetChat?._id ?? "");
        if (chatId) {
          setLocalMessages([]); // cleared; Apollo query will populate
          setConversationId(chatId);
          setScreen("chat");
        }
      } finally {
        setOpeningChat(false);
      }
    },
    [isLoggedIn, openOrGetChatMutation]
  );

  const sendNavbarMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !conversationId) return;

      const optimistic: T = {
        _id: `local-${Date.now()}`,
        conversationId,
        senderId: user._id,
        message: trimmed,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, optimistic]);

      try {
        const result = await sendMessageMutation({
          variables: { input: { conversationId, message: trimmed } },
        });
        const confirmed = (result?.data as T)?.sendMessage as T | undefined;
        if (confirmed) {
          setLocalMessages((prev) => [
            ...prev.filter((m: T) => m._id !== optimistic._id),
            confirmed,
          ]);
        }
      } catch {
        setLocalMessages((prev) =>
          prev.filter((m: T) => m._id !== optimistic._id)
        );
        throw new Error("Failed to send message");
      }
    },
    [conversationId, user._id, sendMessageMutation]
  );

  // ─── Context value ────────────────────────────────────────────────────────

  const value = useMemo<ChatContextValue>(
    () => ({
      isOpen,
      openChat,
      closeChat,
      isSupportOpen,
      openSupport,
      closeSupport,
      screen,
      conversationId,
      localMessages,
      openingChat,
      openBrandChat,
      sendNavbarMessage,
      goBackToBrands,
    }),
    [
      isOpen,
      openChat,
      closeChat,
      isSupportOpen,
      openSupport,
      closeSupport,
      screen,
      conversationId,
      localMessages,
      openingChat,
      openBrandChat,
      sendNavbarMessage,
      goBackToBrands,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChat() {
  return useContext(ChatContext);
}

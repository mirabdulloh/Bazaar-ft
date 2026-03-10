"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import Typography from "@mui/material/Typography";
import CloseRounded from "@mui/icons-material/CloseRounded";
import SupportAgentRounded from "@mui/icons-material/SupportAgentRounded";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../../../apollo/store";
import { CustomJwtPayload } from "lib/types/customJwtPayload";
import { useChat } from "../chat-provider";
import { useSocket } from "providers/SocketProvider";
import { useQuery } from "lib/hooks/useQuery";
import { GET_MESSAGES } from "../../../../apollo/user/query";
import { OPEN_OR_GET_CHAT, SEND_MESSAGE } from "../../../../apollo/user/mutation";
import { MessageBubble } from "../shared/MessageBubble";
import { ChatInput } from "../shared/ChatInput";
import { T } from "lib/types/common";

const SUPPORT_BRAND_ID = process.env.NEXT_PUBLIC_SUPPORT_BRAND_ID ?? "";

export function SupportChatWindow() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const user = useReactiveVar(userVar) as CustomJwtPayload;
  const isLoggedIn = !!user?._id;

  const { isSupportOpen, closeSupport } = useChat();
  const { on } = useSocket();

  const [conversationId, setConversationId] = useState("");
  const [localMessages, setLocalMessages] = useState<T[]>([]);
  const [initializing, setInitializing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [openOrGetChatMutation] = useMutation(OPEN_OR_GET_CHAT);
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  // Fetch messages when conversation is ready
  const { data: messagesData } = useQuery(GET_MESSAGES, {
    skip: !conversationId || !isSupportOpen,
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

  // Open/create the support conversation when the window opens
  useEffect(() => {
    if (!isSupportOpen || !isLoggedIn || conversationId || !SUPPORT_BRAND_ID) return;
    setInitializing(true);
    openOrGetChatMutation({
      variables: { input: { brandId: SUPPORT_BRAND_ID, chatSubject: "Support" } },
    })
      .then((res) => {
        const chatId = String((res?.data as T)?.openOrGetChat?._id ?? "");
        if (chatId) setConversationId(chatId);
      })
      .finally(() => setInitializing(false));
  }, [isSupportOpen, isLoggedIn, conversationId, openOrGetChatMutation]);

  // Subscribe to incoming messages for this conversation
  const conversationIdRef = useRef(conversationId);
  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);

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

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages.length]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!conversationId) return;
      const trimmed = text.trim();
      if (!trimmed) return;

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
      }
    },
    [conversationId, user._id, sendMessageMutation]
  );

  if (!mounted || !isSupportOpen) return null;

  return (
    <Slide direction="up" in={isSupportOpen} mountOnEnter unmountOnExit>
      <Paper
        elevation={12}
        sx={{
          position: "fixed",
          bottom: 88,
          right: 24,
          width: 360,
          height: 480,
          zIndex: 1299,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
          }}
        >
          <SupportAgentRounded sx={{ fontSize: 20 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Bazaar Support
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Typically replies in a few minutes
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={closeSupport}
            sx={{ color: "white", opacity: 0.8, "&:hover": { opacity: 1 } }}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 0.25,
          }}
        >
          {initializing ? (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : !SUPPORT_BRAND_ID ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
              Support chat is not configured.
            </Typography>
          ) : localMessages.length === 0 ? (
            <Box
              sx={{
                maxWidth: "80%",
                alignSelf: "flex-start",
                bgcolor: "grey.100",
                px: 1.5,
                py: 1,
                borderRadius: "16px 16px 16px 4px",
              }}
            >
              <Typography variant="body2">
                Hi there! How can we help you today?
              </Typography>
            </Box>
          ) : (
            localMessages.map((msg: T, idx: number) => {
              const isMine = String(msg.senderId) === String(user._id);
              const prevMsg = localMessages[idx - 1] as T | undefined;
              const showAvatar =
                !isMine &&
                (prevMsg === undefined ||
                  String(prevMsg.senderId) !== String(msg.senderId));
              return (
                <MessageBubble
                  key={String(msg._id)}
                  message={msg}
                  isMine={isMine}
                  showAvatar={showAvatar}
                  isOptimistic={String(msg._id).startsWith("local-")}
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          disabled={!conversationId || initializing}
          placeholder="Type your message…"
        />
      </Paper>
    </Slide>
  );
}

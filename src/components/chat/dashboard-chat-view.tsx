"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DocumentNode } from "@apollo/client";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import {
  alpha,
  useTheme,
} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import { userVar } from "../../../apollo/store";
import { DELETE_CHAT, SEND_MESSAGE } from "../../../apollo/user/mutation";
import { GET_MESSAGES } from "../../../apollo/user/query";
import { useQuery } from "../../lib/hooks/useQuery";
import { sweetConfirmAlert, sweetMixinErrorAlert } from "../../lib/sweetAlert";
import { CustomJwtPayload } from "../../lib/types/customJwtPayload";
import { T } from "../../lib/types/common";
import { useChatSocket } from "../../lib/chatSocket";

type ConversationMode = "customer" | "brand";

type Props = {
  chatsQuery: DocumentNode;
  chatsRootKey: "getMyChats" | "getBrandChats";
  mode: ConversationMode;
  title: string;
  subtitle: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveImage(img?: string | null): string {
  if (!img || img === "null" || img === "undefined") return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}

function formatRelativeTime(date?: string) {
  if (!date) return "";
  const value = new Date(date).getTime();
  if (Number.isNaN(value)) return "";

  const diff = Date.now() - value;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatMessageTime(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getConversationName(item: T, mode: ConversationMode): string {
  if (mode === "customer") {
    return (
      ((item.brandData as T)?.brandName as string) ||
      (((item.brandData as T)?.memberData as T)?.memberNick as string) ||
      "Brand"
    );
  }

  return ((item.memberData as T)?.memberNick as string) || "Customer";
}

function getConversationImage(item: T, mode: ConversationMode): string {
  if (mode === "customer") {
    return (
      resolveImage((item.brandData as T)?.brandLogo as string) ||
      resolveImage((((item.brandData as T)?.memberData as T)?.memberImage as string))
    );
  }

  return resolveImage((item.memberData as T)?.memberImage as string);
}

export default function DashboardChatView({
  chatsQuery,
  chatsRootKey,
  mode,
  title,
  subtitle,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const user = useReactiveVar(userVar) as CustomJwtPayload;
  const isLoggedIn = !!user?._id;

  const [activeChatId, setActiveChatId] = useState<string>("");
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<T[]>([]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const {
    loading: getChatsLoading,
    data: getChatsData,
    refetch: getChatsRefetch,
  } = useQuery(chatsQuery, {
    variables: {
      input: {
        page: 1,
        limit: 20,
        sort: "updatedAt",
        direction: "DESC",
      },
    },
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const conversations = useMemo(
    () => (((getChatsData as T)?.[chatsRootKey]?.list ?? []) as T[]),
    [getChatsData, chatsRootKey]
  );
  const selectedConversation = conversations.find((item: T) => item._id === activeChatId) ?? null;

  const {
    loading: getMessagesLoading,
    data: getMessagesData,
    refetch: getMessagesRefetch,
  } = useQuery(GET_MESSAGES, {
    variables: {
      input: {
        page: 1,
        limit: 50,
        conversationId: activeChatId,
        direction: "ASC",
      },
    },
    skip: !isLoggedIn || !activeChatId,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const [sendMessage, { loading: sendMessageLoading }] = useMutation(SEND_MESSAGE);
  const [deleteChat, { loading: deleteChatLoading }] = useMutation(DELETE_CHAT);

  useEffect(() => {
    const list = ((getMessagesData as T)?.getMessages?.list ?? []) as T[];
    setLocalMessages(list);
  }, [getMessagesData]);

  useEffect(() => {
    if (isMobile || activeChatId || conversations.length === 0) return;
    setActiveChatId(conversations[0]._id as string);
  }, [activeChatId, conversations, isMobile]);

  useEffect(() => {
    if (activeChatId && !conversations.some((item: T) => item._id === activeChatId)) {
      setActiveChatId(isMobile ? "" : (conversations[0]?._id as string) || "");
    }
  }, [activeChatId, conversations, isMobile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [localMessages, activeChatId]);

  const handleSocketMessage = useCallback(async () => {
    if (!activeChatId) return;
    await Promise.all([getMessagesRefetch(), getChatsRefetch()]);
  }, [activeChatId, getMessagesRefetch, getChatsRefetch]);

  useChatSocket(activeChatId || null, handleSocketMessage);

  const handleDeleteChat = useCallback(async () => {
    if (!activeChatId) return;

    const ok = await sweetConfirmAlert(
      "Delete this conversation?",
      "This removes the chat from your list.",
      "Delete"
    );

    if (!ok) return;

    try {
      await deleteChat({ variables: { input: activeChatId } });
      setActiveChatId("");
      setLocalMessages([]);
      await getChatsRefetch();
    } catch (error: any) {
      sweetMixinErrorAlert(error?.message ?? "Failed to delete chat.");
    }
  }, [activeChatId, deleteChat, getChatsRefetch]);

  const handleSend = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || !activeChatId || sendMessageLoading) return;

    const optimistic: T = {
      _id: `local-${Date.now()}`,
      conversationId: activeChatId,
      senderId: user._id,
      message: trimmed,
      createdAt: new Date().toISOString(),
      senderData: {
        _id: user._id,
        memberNick: user.memberNick,
        memberImage: user.memberImage,
      },
    };

    setDraft("");
    setLocalMessages((prev) => [...prev, optimistic]);

    try {
      await sendMessage({
        variables: {
          input: {
            conversationId: activeChatId,
            message: trimmed,
          },
        },
      });

      await Promise.all([getMessagesRefetch(), getChatsRefetch()]);
    } catch (error: any) {
      sweetMixinErrorAlert(error?.message ?? "Failed to send message.");
      setLocalMessages((prev) => prev.filter((msg: T) => msg._id !== optimistic._id));
      setDraft(trimmed);
    }
  }, [
    activeChatId,
    draft,
    getChatsRefetch,
    getMessagesRefetch,
    sendMessage,
    sendMessageLoading,
    user._id,
    user.memberImage,
    user.memberNick,
  ]);

  const canShowThread = !!activeChatId && (!isMobile || activeChatId);
  const showConversationList = !isMobile || !activeChatId;
  const showThread = !isMobile || !!activeChatId;

  const emptyList = !getChatsLoading && conversations.length === 0;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      {!isLoggedIn ? (
        <Paper
          variant="outlined"
          sx={{
            minHeight: 420,
            borderRadius: 4,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            px: 3,
          }}
        >
          <Stack spacing={1.5} alignItems="center">
            <ChatBubbleOutlineRounded color="action" sx={{ fontSize: 40 }} />
            <Typography variant="h6" fontWeight={700}>
              Please log in to use chat
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            minHeight: { xs: "calc(100vh - 220px)", md: 680 },
            display: "flex",
            bgcolor: "background.paper",
          }}
        >
          {showConversationList && (
            <Box
              sx={{
                width: { xs: "100%", md: 300 },
                borderRight: { md: `1px solid ${theme.palette.divider}` },
                display: "flex",
                flexDirection: "column",
                bgcolor: alpha(theme.palette.grey[50], 0.6),
              }}
            >
              <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: "primary.main",
                    }}
                  >
                    <ChatBubbleOutlineRounded />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      Messages
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {mode === "customer" ? "Your brand conversations" : "Your customer conversations"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ flex: 1, overflowY: "auto" }}>
                {getChatsLoading && conversations.length === 0 ? (
                  <Stack sx={{ minHeight: 240 }} alignItems="center" justifyContent="center">
                    <CircularProgress size={28} />
                  </Stack>
                ) : emptyList ? (
                  <Stack sx={{ minHeight: 240, px: 3 }} alignItems="center" justifyContent="center" spacing={1}>
                    <ChatBubbleOutlineRounded color="action" />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      No conversations yet.
                    </Typography>
                  </Stack>
                ) : (
                  conversations.map((item: T) => {
                    const isActive = item._id === activeChatId;

                    return (
                      <ListItemButton
                        key={item._id as string}
                        selected={isActive}
                        onClick={() => setActiveChatId(item._id as string)}
                        sx={{
                          px: 2,
                          py: 1.5,
                          alignItems: "flex-start",
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                          bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                          "&.Mui-selected": {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                          "&.Mui-selected:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1.25} sx={{ width: "100%" }}>
                          <Avatar
                            src={getConversationImage(item, mode)}
                            alt={getConversationName(item, mode)}
                            sx={{ width: 46, height: 46 }}
                          />

                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                noWrap
                                sx={{ maxWidth: "70%" }}
                              >
                                {getConversationName(item, mode)}
                              </Typography>

                              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                                {formatRelativeTime(item.updatedAt as string)}
                              </Typography>
                            </Stack>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                              sx={{ mt: 0.4 }}
                            >
                              {(item.chatSubject as string) || "Open conversation"}
                            </Typography>
                          </Box>
                        </Stack>
                      </ListItemButton>
                    );
                  })
                )}
              </Box>
            </Box>
          )}

          {showThread && (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              {canShowThread ? (
                <>
                  <Box
                    sx={{
                      px: { xs: 1.5, md: 2.5 },
                      py: 1.5,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                      {isMobile && (
                        <IconButton onClick={() => setActiveChatId("")}>
                          <ArrowBackRounded />
                        </IconButton>
                      )}

                      <Avatar
                        src={selectedConversation ? getConversationImage(selectedConversation, mode) : ""}
                        alt={selectedConversation ? getConversationName(selectedConversation, mode) : "Chat"}
                        sx={{ width: 42, height: 42 }}
                      />

                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={800} noWrap>
                          {selectedConversation ? getConversationName(selectedConversation, mode) : "Conversation"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {(selectedConversation?.chatSubject as string) || "Live conversation"}
                        </Typography>
                      </Box>
                    </Stack>

                    <IconButton
                      color="error"
                      onClick={handleDeleteChat}
                      disabled={deleteChatLoading}
                    >
                      <DeleteOutlineRounded />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      overflowY: "auto",
                      px: { xs: 1.5, md: 2.5 },
                      py: 2,
                      bgcolor: alpha(theme.palette.grey[50], 0.45),
                    }}
                  >
                    {getMessagesLoading && localMessages.length === 0 ? (
                      <Stack sx={{ minHeight: 260 }} alignItems="center" justifyContent="center">
                        <CircularProgress size={28} />
                      </Stack>
                    ) : localMessages.length === 0 ? (
                      <Stack sx={{ minHeight: 260 }} alignItems="center" justifyContent="center" spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          No messages yet. Start the conversation.
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack spacing={1.5}>
                        {localMessages.map((message: T) => {
                          const isMine = message.senderId === user._id;
                          const senderImg = resolveImage((message.senderData as T)?.memberImage as string);
                          const senderName = ((message.senderData as T)?.memberNick as string) || "User";

                          return (
                            <Stack
                              key={message._id as string}
                              direction="row"
                              spacing={1}
                              justifyContent={isMine ? "flex-end" : "flex-start"}
                              alignItems="flex-end"
                            >
                              {!isMine && <Avatar src={senderImg} alt={senderName} sx={{ width: 32, height: 32 }} />}

                              <Box
                                sx={{
                                  maxWidth: { xs: "84%", md: "70%" },
                                  px: 1.5,
                                  py: 1.2,
                                  borderRadius: 3,
                                  bgcolor: isMine ? "primary.main" : "grey.100",
                                  color: isMine ? "primary.contrastText" : "text.primary",
                                  borderTopRightRadius: isMine ? 1 : 3,
                                  borderTopLeftRadius: isMine ? 3 : 1,
                                  boxShadow: isMine
                                    ? `0 10px 20px ${alpha(theme.palette.primary.main, 0.22)}`
                                    : "0 6px 16px rgba(15, 23, 42, 0.06)",
                                }}
                              >
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                  {message.message as string}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    mt: 0.6,
                                    display: "block",
                                    color: isMine ? alpha("#fff", 0.8) : "text.secondary",
                                    textAlign: isMine ? "right" : "left",
                                  }}
                                >
                                  {formatMessageTime(message.createdAt as string)}
                                </Typography>
                              </Box>
                            </Stack>
                          );
                        })}
                        <div ref={bottomRef} />
                      </Stack>
                    )}
                  </Box>

                  <Box sx={{ p: { xs: 1.25, md: 1.75 }, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Stack direction="row" spacing={1.25} alignItems="flex-end">
                      <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Write a message..."
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleSend();
                          }
                        }}
                        disabled={sendMessageLoading || deleteChatLoading}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                            bgcolor: "background.paper",
                          },
                        }}
                      />

                      <Button
                        variant="contained"
                        onClick={handleSend}
                        disabled={!draft.trim() || sendMessageLoading || deleteChatLoading}
                        sx={{
                          minWidth: 52,
                          height: 52,
                          borderRadius: 3,
                          boxShadow: "none",
                        }}
                      >
                        <SendRounded />
                      </Button>
                    </Stack>
                  </Box>
                </>
              ) : (
                <Stack sx={{ flex: 1 }} alignItems="center" justifyContent="center" spacing={1.5}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: "primary.main",
                    }}
                  >
                    <ChatBubbleOutlineRounded />
                  </Avatar>
                  <Typography variant="h6" fontWeight={800}>
                    Select a conversation to start chatting
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 320 }}>
                    Choose a conversation from the left panel to see the full message thread.
                  </Typography>
                </Stack>
              )}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}

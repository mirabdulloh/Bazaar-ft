"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DocumentNode } from "@apollo/client";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import DoneAllRounded from "@mui/icons-material/DoneAllRounded";
import EmojiEmotionsOutlined from "@mui/icons-material/EmojiEmotionsOutlined";
import MoreVertRounded from "@mui/icons-material/MoreVertRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
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

  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMessageTime(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
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

function groupMessagesByDate(messages: T[]): { label: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const msg of messages) {
    const d = new Date(msg.createdAt as string);
    const key = d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(msg);
  }
  const fmtKey = (offset: number) =>
    new Date(Date.now() - offset).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const todayKey = fmtKey(0);
  const yesterdayKey = fmtKey(86400000);
  return Array.from(map.entries()).map(([key, items]) => ({
    label: key === todayKey ? "Today" : key === yesterdayKey ? "Yesterday" : key,
    items,
  }));
}

const STATUS_CHIP: Record<string, { label: string; color: "success" | "warning" | "default" }> = {
  OPEN: { label: "Open", color: "success" },
  PENDING: { label: "Pending", color: "warning" },
  CLOSED: { label: "Closed", color: "default" },
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const {
    loading: getChatsLoading,
    data: getChatsData,
    refetch: getChatsRefetch,
  } = useQuery(chatsQuery, {
    variables: { input: { page: 1, limit: 20, sort: "updatedAt", direction: "DESC" } },
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const conversations = useMemo(
    () => (((getChatsData as T)?.[chatsRootKey]?.list ?? []) as T[]),
    [getChatsData, chatsRootKey]
  );

  const filtered = useMemo(
    () =>
      searchQuery.trim()
        ? conversations.filter((item: T) =>
            getConversationName(item, mode).toLowerCase().includes(searchQuery.toLowerCase())
          )
        : conversations,
    [conversations, searchQuery, mode]
  );

  const selectedConversation = conversations.find((item: T) => item._id === activeChatId) ?? null;

  const {
    loading: getMessagesLoading,
    data: getMessagesData,
    refetch: getMessagesRefetch,
  } = useQuery(GET_MESSAGES, {
    variables: { input: { page: 1, limit: 50, conversationId: activeChatId, direction: "ASC" } },
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
    const ok = await sweetConfirmAlert("Delete this conversation?", "This removes the chat from your list.", "Delete");
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
      senderData: { _id: user._id, memberNick: user.memberNick, memberImage: user.memberImage },
    };

    setDraft("");
    setLocalMessages((prev) => [...prev, optimistic]);

    try {
      await sendMessage({ variables: { input: { conversationId: activeChatId, message: trimmed } } });
      await Promise.all([getMessagesRefetch(), getChatsRefetch()]);
    } catch (error: any) {
      sweetMixinErrorAlert(error?.message ?? "Failed to send message.");
      setLocalMessages((prev) => prev.filter((msg: T) => msg._id !== optimistic._id));
      setDraft(trimmed);
    }
  }, [activeChatId, draft, getChatsRefetch, getMessagesRefetch, sendMessage, sendMessageLoading, user._id, user.memberImage, user.memberNick]);

  const canShowThread = !!activeChatId && (!isMobile || activeChatId);
  const showConversationList = !isMobile || !activeChatId;
  const showThread = !isMobile || !!activeChatId;
  const emptyList = !getChatsLoading && conversations.length === 0;
  const chatStatus = (selectedConversation?.chatStatus as string) ?? "OPEN";
  const statusChip = STATUS_CHIP[chatStatus] ?? STATUS_CHIP.OPEN;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      </Box>

      {!isLoggedIn ? (
        <Paper variant="outlined" sx={{ minHeight: 420, borderRadius: 4, display: "grid", placeItems: "center", textAlign: "center", px: 3 }}>
          <Stack spacing={1.5} alignItems="center">
            <ChatBubbleOutlineRounded color="action" sx={{ fontSize: 40 }} />
            <Typography variant="h6" fontWeight={700}>Please log in to use chat</Typography>
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
          {/* ── Conversation List ── */}
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
              {/* Panel header */}
              <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
                  <Avatar
                    variant="rounded"
                    sx={{ width: 38, height: 38, bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main" }}
                  >
                    <ChatBubbleOutlineRounded sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>Messages</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {mode === "customer" ? "Brand conversations" : "Customer conversations"}
                    </Typography>
                  </Box>
                </Stack>

                {/* Search */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: theme.palette.grey[100],
                    borderRadius: 999,
                    px: 1.5,
                    py: 0.5,
                  }}
                >
                  <SearchRounded sx={{ fontSize: 18, color: "text.secondary", flexShrink: 0 }} />
                  <InputBase
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1, fontSize: "0.875rem" }}
                  />
                </Box>
              </Box>

              {/* Conversation items */}
              <Box sx={{ flex: 1, overflowY: "auto" }}>
                {getChatsLoading && conversations.length === 0 ? (
                  <Stack sx={{ minHeight: 240 }} alignItems="center" justifyContent="center">
                    <CircularProgress size={28} />
                  </Stack>
                ) : emptyList ? (
                  <Stack sx={{ minHeight: 240, px: 3 }} alignItems="center" justifyContent="center" spacing={1}>
                    <ChatBubbleOutlineRounded color="action" />
                    <Typography variant="body2" color="text.secondary" textAlign="center">No conversations yet.</Typography>
                  </Stack>
                ) : filtered.length === 0 ? (
                  <Stack sx={{ minHeight: 120, px: 3 }} alignItems="center" justifyContent="center" spacing={1}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">No results for "{searchQuery}"</Typography>
                  </Stack>
                ) : (
                  filtered.map((item: T) => {
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
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                          bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                          "&.Mui-selected": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                          "&.Mui-selected:hover": { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                        }}
                      >
                        <Stack direction="row" spacing={1.25} sx={{ width: "100%" }}>
                          {/* Avatar with online dot */}
                          <Box position="relative" flexShrink={0}>
                            <Avatar
                              src={getConversationImage(item, mode)}
                              alt={getConversationName(item, mode)}
                              sx={{ width: 46, height: 46 }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 1,
                                right: 1,
                                width: 10,
                                height: 10,
                                bgcolor: "success.main",
                                borderRadius: "50%",
                                border: `2px solid ${theme.palette.background.paper}`,
                              }}
                            />
                          </Box>

                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                              <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: "70%" }}>
                                {getConversationName(item, mode)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                                {formatRelativeTime(item.updatedAt as string)}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.3, fontSize: "0.78rem" }}>
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

          {/* ── Message Thread ── */}
          {showThread && (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              {canShowThread ? (
                <>
                  {/* Thread header */}
                  <Box
                    sx={{
                      px: { xs: 1.5, md: 2 },
                      py: 1.25,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                      {isMobile && (
                        <IconButton size="small" onClick={() => setActiveChatId("")}>
                          <ArrowBackRounded />
                        </IconButton>
                      )}

                      <Box position="relative" flexShrink={0}>
                        <Avatar
                          src={selectedConversation ? getConversationImage(selectedConversation, mode) : ""}
                          alt={selectedConversation ? getConversationName(selectedConversation, mode) : "Chat"}
                          sx={{ width: 42, height: 42 }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 1,
                            right: 1,
                            width: 10,
                            height: 10,
                            bgcolor: "success.main",
                            borderRadius: "50%",
                            border: `2px solid ${theme.palette.background.paper}`,
                          }}
                        />
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1" fontWeight={800} noWrap>
                            {selectedConversation ? getConversationName(selectedConversation, mode) : "Conversation"}
                          </Typography>
                          <Chip
                            label={statusChip.label}
                            color={statusChip.color}
                            size="small"
                            sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {(selectedConversation?.chatSubject as string) || "Live conversation"}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Kebab menu */}
                    <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} disabled={deleteChatLoading}>
                      <MoreVertRounded />
                    </IconButton>
                    <Menu
                      anchorEl={menuAnchor}
                      open={!!menuAnchor}
                      onClose={() => setMenuAnchor(null)}
                      transformOrigin={{ horizontal: "right", vertical: "top" }}
                      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                      <MenuItem
                        onClick={() => { setMenuAnchor(null); handleDeleteChat(); }}
                        sx={{ color: "error.main", gap: 0.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <DeleteOutlineRounded color="error" fontSize="small" />
                        </ListItemIcon>
                        Delete conversation
                      </MenuItem>
                    </Menu>
                  </Box>

                  {/* Messages */}
                  <Box
                    sx={{
                      flex: 1,
                      overflowY: "auto",
                      px: { xs: 1.5, md: 2.5 },
                      py: 2,
                      bgcolor: alpha(theme.palette.grey[50], 0.4),
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
                      <Stack spacing={0}>
                        {groupMessagesByDate(localMessages).map((group) => (
                          <Box key={group.label}>
                            {/* Date separator */}
                            <Box sx={{ textAlign: "center", my: 1.5 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  bgcolor: "grey.100",
                                  borderRadius: 999,
                                  px: 1.5,
                                  py: 0.4,
                                  color: "text.secondary",
                                  fontSize: "0.7rem",
                                }}
                              >
                                {group.label}
                              </Typography>
                            </Box>

                            <Stack spacing={0}>
                              {group.items.map((message: T, idx: number) => {
                                const isMine = message.senderId === user._id;
                                const senderImg = resolveImage((message.senderData as T)?.memberImage as string);
                                const senderName = ((message.senderData as T)?.memberNick as string) || "User";
                                const isLocal = String(message._id).startsWith("local-");

                                const prevMsg = idx > 0 ? group.items[idx - 1] : null;
                                const isSameGroup =
                                  !!prevMsg &&
                                  prevMsg.senderId === message.senderId &&
                                  new Date(message.createdAt as string).getTime() -
                                    new Date(prevMsg.createdAt as string).getTime() <
                                    120_000;

                                return (
                                  <Box
                                    key={message._id as string}
                                    sx={{ mt: isSameGroup ? 0.3 : 1.5 }}
                                  >
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      justifyContent={isMine ? "flex-end" : "flex-start"}
                                      alignItems="flex-end"
                                    >
                                      {/* Other's avatar (or spacer) */}
                                      {!isMine && (
                                        isSameGroup ? (
                                          <Box sx={{ width: 32, flexShrink: 0 }} />
                                        ) : (
                                          <Avatar src={senderImg} alt={senderName} sx={{ width: 32, height: 32, flexShrink: 0 }} />
                                        )
                                      )}

                                      {/* Bubble */}
                                      <Box
                                        sx={{
                                          maxWidth: { xs: "82%", md: "68%" },
                                          px: 1.5,
                                          pt: 1,
                                          pb: 0.75,
                                          borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                          bgcolor: isMine ? "primary.main" : "grey.100",
                                          color: isMine ? "primary.contrastText" : "text.primary",
                                          boxShadow: isMine
                                            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`
                                            : "0 2px 8px rgba(15,23,42,0.06)",
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5 }}
                                        >
                                          {message.message as string}
                                        </Typography>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "flex-end",
                                            gap: 0.4,
                                            mt: 0.4,
                                          }}
                                        >
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontSize: "0.65rem",
                                              color: isMine ? alpha("#fff", 0.75) : "text.secondary",
                                            }}
                                          >
                                            {formatMessageTime(message.createdAt as string)}
                                          </Typography>
                                          {isMine && !isLocal && (
                                            <DoneAllRounded
                                              sx={{ fontSize: 13, color: alpha("#fff", 0.75) }}
                                            />
                                          )}
                                        </Box>
                                      </Box>
                                    </Stack>
                                  </Box>
                                );
                              })}
                            </Stack>
                          </Box>
                        ))}
                        <div ref={bottomRef} />
                      </Stack>
                    )}
                  </Box>

                  {/* Input */}
                  <Box
                    sx={{
                      p: { xs: 1.25, md: 1.5 },
                      borderTop: `1px solid ${theme.palette.divider}`,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-end">
                      <IconButton size="small" disabled sx={{ color: "text.secondary", mb: 0.25 }}>
                        <EmojiEmotionsOutlined />
                      </IconButton>

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
                            bgcolor: alpha(theme.palette.grey[100], 0.8),
                            "& fieldset": { border: "none" },
                          },
                        }}
                      />

                      <IconButton
                        onClick={handleSend}
                        disabled={!draft.trim() || sendMessageLoading || deleteChatLoading}
                        sx={{
                          width: 44,
                          height: 44,
                          flexShrink: 0,
                          mb: 0.25,
                          bgcolor: draft.trim() ? "primary.main" : "grey.100",
                          color: draft.trim() ? "white" : "grey.500",
                          borderRadius: "50%",
                          transition: "all 0.2s ease",
                          "&:hover": { bgcolor: draft.trim() ? "primary.dark" : "grey.200" },
                          "&.Mui-disabled": { bgcolor: "grey.100", color: "grey.400" },
                        }}
                      >
                        <SendRounded sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  </Box>
                </>
              ) : (
                <Stack sx={{ flex: 1 }} alignItems="center" justifyContent="center" spacing={1.5}>
                  <Avatar
                    variant="rounded"
                    sx={{ width: 56, height: 56, bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main" }}
                  >
                    <ChatBubbleOutlineRounded />
                  </Avatar>
                  <Typography variant="h6" fontWeight={800}>Select a conversation</Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 300 }}>
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
